from flask import Flask, jsonify, request, render_template
import yfinance as yf
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
import threading
import time

app = Flask(__name__)
CORS(app)

# Database configuration
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///alerts.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

class Alert(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    symbol = db.Column(db.String(10), nullable=False)
    upper_threshold = db.Column(db.Float, nullable=False)
    lower_threshold = db.Column(db.Float, nullable=False)

# Create the database tables
with app.app_context():
    db.create_all()

price_thresholds = {}

# Function to fetch stock prices using yfinance
def get_stock_price(symbol):
    try:
        stock = yf.Ticker(symbol)
        stock_data = stock.history(period="1d")
        if not stock_data.empty:
            return stock_data['Close'].iloc[-1]
        return None
    except Exception as e:
        return str(e)

# Serve the HTML file
@app.route('/')
def home():
    return render_template('index.html')

@app.route('/stock', methods=['GET'])
def stock_price():
    symbol = request.args.get('symbol')
    price = get_stock_price(symbol)
    if price is not None:
        return jsonify({'price': price}), 200
    return jsonify({'error': 'Could not fetch price'}), 404

# Route to allow users to set price thresholds for a stock
@app.route('/set_alert', methods=['POST'])
def set_alert():
    data = request.json
    stock_symbol = data.get('symbol')
    upper_threshold = data.get('upper_threshold')
    lower_threshold = data.get('lower_threshold')

    if not stock_symbol or upper_threshold is None or lower_threshold is None:
        return jsonify({'error': 'Symbol, upper threshold, and lower threshold are required'}), 400

    # Save the alert to the database
    new_alert = Alert(symbol=stock_symbol, upper_threshold=upper_threshold, lower_threshold=lower_threshold)
    db.session.add(new_alert)
    db.session.commit()

    # Store the thresholds in memory for monitoring
    price_thresholds[stock_symbol] = {
        'upper': upper_threshold,
        'lower': lower_threshold
    }

    return jsonify({
        'message': f'Alert set for {stock_symbol}. Upper: {upper_threshold}, Lower: {lower_threshold}'
    }), 200

# Function to continuously monitor stock prices and trigger alerts
def monitor_prices():
    while True:
        for symbol, thresholds in price_thresholds.items():
            current_price = get_stock_price(symbol)
            if current_price is not None:
                if current_price > thresholds['upper']:
                    print(f"Alert: {symbol} price is above {thresholds['upper']}! Current price: {current_price}")
                elif current_price < thresholds['lower']:
                    print(f"Alert: {symbol} price is below {thresholds['lower']}! Current price: {current_price}")

        time.sleep(60)

price_monitor_thread = threading.Thread(target=monitor_prices)
price_monitor_thread.daemon = True
price_monitor_thread.start()

if __name__ == '__main__':
    app.run(debug=True)
