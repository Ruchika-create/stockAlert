import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from './Sidebar';
import HomePage from './HomePage';
import './StockDashboard.css';

function StockDashboard() {
  const [showHomePage, setShowHomePage] = useState(true);
  const [stockData, setStockData] = useState([]);
  const [selectedStock, setSelectedStock] = useState('');
  const [stockPrice, setStockPrice] = useState(0);
  const [threshold, setThreshold] = useState('');
  const [alertMessage, setAlertMessage] = useState('');
  const [atoEnabled, setAtoEnabled] = useState(false);
  const [comparisonType, setComparisonType] = useState('greaterThanOrEqualTo');
  const [percentageOfLTP, setPercentageOfLTP] = useState('');
  const [openSidebar, setOpenSidebar] = useState(false);
  const [showCreateAlert, setShowCreateAlert] = useState(false);
  const [alerts, setAlerts] = useState([]); // State to hold created alerts
  const stockList = [
    "STOVEKRAFT.NS", "^NSEI", "TSLA", "NVDA",
    "ADANIPORTS.NS", "ASIANPAINT.NS", "AXISBANK.NS", "BAJAJ-AUTO.NS", "BAJFINANCE.NS",
    "BAJAJFINSV.NS", "BPCL.NS", "BHARTIARTL.NS", "BRITANNIA.NS", "CIPLA.NS",
    "COALINDIA.NS", "DIVISLAB.NS", "DRREDDY.NS", "EICHERMOT.NS", "GRASIM.NS",
    "HCLTECH.NS", "HDFCBANK.NS", "HDFC.NS", "HEROMOTOCO.NS", "HINDALCO.NS",
    "HINDUNILVR.NS", "ICICIBANK.NS", "INDUSINDBK.NS", "INFY.NS", "ITC.NS",
    "JSWSTEEL.NS", "KOTAKBANK.NS", "LT.NS", "M&M.NS", "MARUTI.NS", "NTPC.NS",
    "ONGC.NS", "POWERGRID.NS", "RELIANCE.NS", "SBILIFE.NS", "SBIN.NS",
    "SUNPHARMA.NS", "TCS.NS", "TATACONSUM.NS", "TATAMOTORS.NS", "TATASTEEL.NS",
    "TECHM.NS", "TITAN.NS", "ULTRACEMCO.NS", "UPL.NS", "WIPRO.NS"
  ];

  const fetchStockPrice = async (symbol) => {
    try {
      const response = await axios.get(`http://localhost:5000/stock?symbol=${symbol}`);
      return { symbol, price: response.data.price };
    } catch (error) {
      console.error(`Error fetching stock data for ${symbol}:`, error);
      return { symbol, price: 'Error fetching data' };
    }
  };

  useEffect(() => {
    const fetchAllStockPrices = async () => {
      const data = await Promise.all(stockList.map(symbol => fetchStockPrice(symbol)));
      setStockData(data);
    };
    fetchAllStockPrices();
  }, []);

  useEffect(() => {
    const fetchPriceAndCheckThreshold = async () => {
      if (selectedStock) {
        const priceData = await fetchStockPrice(selectedStock);
        setStockPrice(priceData.price);
        const numericThreshold = parseFloat(threshold);

        if (!isNaN(numericThreshold) && priceData.price !== 'Error fetching data') {
          let conditionMet = false;

          if ((comparisonType === 'greaterThanOrEqualTo' && priceData.price >= numericThreshold) ||
            (comparisonType === 'lessThanOrEqualTo' && priceData.price <= numericThreshold) ||
            (comparisonType === 'greaterThan' && priceData.price > numericThreshold) ||
            (comparisonType === 'lessThan' && priceData.price < numericThreshold)) {
            conditionMet = true;
          }

          if (conditionMet) {
            setAlertMessage(`Alert: ${selectedStock} has met the condition: ${comparisonType} ${numericThreshold}`);
          } else {
            setAlertMessage('');
          }
        }
      }
    };
    fetchPriceAndCheckThreshold();
  }, [selectedStock, threshold, comparisonType]);

  const handlePercentageChange = (e) => {
    const percentage = e.target.value;
    setPercentageOfLTP(percentage);

    if (!isNaN(percentage) && selectedStock && stockPrice) {
      const newThreshold = stockPrice * (1 + percentage / 100);
      setThreshold(newThreshold.toFixed(2));
    }
  };

  const handleSidebarToggle = () => {
    setOpenSidebar(!openSidebar);
  };

  const handleToggleHomePage = () => {
    setShowHomePage(prev => !prev);
  };

  const handleShowLiveStocks = async () => {
    setShowHomePage(false);
    setShowCreateAlert(false); // Hide create alert when showing live stocks

    const randomStocks = stockList.sort(() => 0.5 - Math.random()).slice(0, 10);
    
    const randomStockData = await Promise.all(randomStocks.map(symbol => fetchStockPrice(symbol)));
    setStockData(randomStockData); // Update state with random stock prices
  };

  const handleCreateAlert = () => {
    setShowCreateAlert(true); // Show the create alert pop-up
    setShowHomePage(false); 
  };

  const handleSubmitAlert = () => {
    console.log('Selected Stock:', selectedStock);
    console.log('Threshold:', threshold);
    console.log('Comparison Type:', comparisonType);

    if (selectedStock && threshold) {
      const newAlert = {
        stock: selectedStock,
        threshold,
        comparisonType,
        atoEnabled,
      };
      setAlerts([...alerts, newAlert]); // Add the new alert to the alerts state
      setAlertMessage(`Alert created for ${selectedStock}: ${comparisonType} ${threshold}`);
      setShowCreateAlert(false); // Close create alert popup
      // Reset alert form fields
      setSelectedStock('');
      setThreshold('');
      setPercentageOfLTP('');
      setAtoEnabled(false);
    } else {
      setAlertMessage('Please select a stock and enter a threshold.'); // Error message if validation fails
    }
  };

  return (
    <div className="app">
      <Sidebar 
        openSidebarToggle={openSidebar} 
        OpenSidebar={handleSidebarToggle}  
        onLiveStocksClick={handleShowLiveStocks} 
        onCreateAlertsClick={handleCreateAlert} 
        alerts={alerts} // Pass alerts to the Sidebar
      />

      {/* Conditionally render HomePage, Create Alert, or Live Stocks */}
      {showHomePage ? (
        <HomePage onToggle={handleToggleHomePage} />
      ) : showCreateAlert ? (
        <div className="create-alert-popup">
          <h3>Create Alert</h3>
          <div className="alert-form">
            <label>If</label>
            <select value="Last price" disabled>
              <option value="Last price">Last price</option>
            </select>

            <label>of</label>
            <select onChange={(e) => setSelectedStock(e.target.value)}>
              <option value="">-- Select Stock --</option>
              {stockList.map(stock => (
                <option key={stock} value={stock}>{stock}</option>
              ))}
            </select>

            <label>is</label>
            <select value={comparisonType} onChange={(e) => setComparisonType(e.target.value)}>
              <option value="greaterThanOrEqualTo">Greater than or equal to (&ge;)</option>
              <option value="lessThanOrEqualTo">Less than or equal to (&le;)</option>
              <option value="greaterThan">Greater than (&gt;)</option>
              <option value="lessThan">Less than (&lt;)</option>
            </select>

            <label>than</label>
            <input
              type="number"
              value={threshold}
              onChange={(e) => setThreshold(e.target.value)}
              placeholder="Enter threshold price"
            />

            <label>% of Last price</label>
            <input
              type="number"
              value={percentageOfLTP}
              onChange={handlePercentageChange}
              placeholder="Enter percentage"
            />
          </div>
          <button className="create-button" onClick={handleSubmitAlert}>Create</button>
        </div>
      ) : (
        <div className="stock-dashboard">
          <h2>Stock Dashboard</h2>
          <button onClick={handleToggleHomePage}>Go To Home Page</button>
          <ul>
            {stockData.length > 0 ? (
              stockData.map(stock => (
                <li key={stock.symbol}>
                  {stock.symbol}: {stock.price}
                </li>
              ))
            ) : (
              <li>No stocks available</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}

export default StockDashboard;
