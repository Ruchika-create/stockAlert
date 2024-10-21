import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './HomePage.css'; 

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

const HomePage = () => {
  const [marketData, setMarketData] = useState({
    bankNifty: null,
    nifty50: null,
    finnifty: null,
    randomStocks: {},
  });
  const [selectedCategory, setSelectedCategory] = useState('indexes'); 
  const [selectedIndex, setSelectedIndex] = useState('bankNifty'); 
  const [chartData, setChartData] = useState(null); 
  const [stocks, setStocks] = useState([]);
  const [historicalData, setHistoricalData] = useState({});

  const fetchMarketData = async () => {
    try {
      const bankNiftyResponse = await axios.get('http://localhost:5000/stock?symbol=^NSEBANK');
      const nifty50Response = await axios.get('http://localhost:5000/stock?symbol=^NSEI');
      const finniftyResponse = await axios.get('http://localhost:5000/stock?symbol=^CNXFIN');

      // Select 3 random stocks from stockList
      const randomStocks = [];
      while (randomStocks.length < 3) {
        const randomStock = stockList[Math.floor(Math.random() * stockList.length)];
        if (!randomStocks.includes(randomStock)) {
          randomStocks.push(randomStock);
        }
      }

      const randomStockPrices = await Promise.all(
        randomStocks.map(symbol => axios.get(`http://localhost:5000/stock?symbol=${symbol}`))
      );

      const randomStocksData = randomStockPrices.reduce((acc, response, index) => {
        acc[randomStocks[index]] = response.data.price;
        return acc;
      }, {});

      setMarketData({
        bankNifty: bankNiftyResponse.data.price,
        nifty50: nifty50Response.data.price,
        finnifty: finniftyResponse.data.price,
        randomStocks: randomStocksData,
      });
    } catch (error) {
      console.error('Error fetching market data:', error);
    }
  };

  const fetchHistoricalData = async () => {
    const historicalPromises = stockList.map(async (symbol) => {
      const response = await axios.get(`http://localhost:5000/historical-data?symbol=${symbol}`);
      return { symbol, data: response.data }; 
    });

    const historicalResults = await Promise.all(historicalPromises);
    const historicalDataMap = {};
    historicalResults.forEach(item => {
      historicalDataMap[item.symbol] = item.data;
    });
    setHistoricalData(historicalDataMap);
  };

  const fetchStocksData = async () => {
    const stockPromises = stockList.map(async (symbol) => {
      const response = await axios.get(`http://localhost:5000/stock?symbol=${symbol}`);
      return { symbol, price: response.data.price };
    });

    const stocksData = await Promise.all(stockPromises);
    setStocks(stocksData);
  };

  const fetchChartData = async (symbol) => {
    try {
      const response = await axios.get(`http://localhost:5000/chart?symbol=${symbol}&interval=1h`);
      setChartData(response.data); // Assuming this returns chart data
    } catch (error) {
      console.error('Error fetching chart data:', error);
    }
  };

  useEffect(() => {
    fetchMarketData();
    fetchHistoricalData();
    fetchStocksData();
  }, []);

  useEffect(() => {
    fetchChartData(selectedIndex === 'bankNifty' ? '^NSEBANK' : selectedIndex === 'nifty50' ? '^NSEI' : '^CNXFIN');
  }, [selectedIndex]);

  const handleCategoryToggle = (category) => {
    setSelectedCategory(category);
    setSelectedIndex(category === 'indexes' ? 'bankNifty' : 'axisBank'); // Reset to default selection
    fetchChartData(category === 'indexes' ? '^NSEBANK' : 'AXISBANK.NS'); // Fetch default chart
  };

  const handleIndexSelect = (index) => {
    setSelectedIndex(index);
    fetchChartData(index === 'bankNifty' ? '^NSEBANK' : index === 'nifty50' ? '^NSEI' : '^CNXFIN');
  };

  const handleStockSelect = (stock) => {
    setSelectedIndex(stock);
    fetchChartData(stock === 'axisBank' ? 'AXISBANK.NS' : stock === 'tataMotors' ? 'TATAMOTORS.NS' : 'TITAN.NS');
  };

  return (
    <div className="home-page">
      <h1 className="market-overview">Market Overview</h1>

      {/* Category toggle panel */}
      <div className="category-toggle">
        <button onClick={() => handleCategoryToggle('indexes')}>Indexes</button>
        <button onClick={() => handleCategoryToggle('stocks')}>Stocks</button>
      </div>

      {/* Indexes section */}
      {selectedCategory === 'indexes' && (
        <div className="index-selector">
          <h2>Indices:</h2>
          <div className="index-buttons">
            <button onClick={() => handleIndexSelect('bankNifty')}>Bank Nifty: {marketData.bankNifty}</button>
            <button onClick={() => handleIndexSelect('nifty50')}>Nifty 50: {marketData.nifty50}</button>
            <button onClick={() => handleIndexSelect('finnifty')}>Fin Nifty: {marketData.finnifty}</button>
          </div>
        </div>
      )}

      {/* Stocks section */}
      {selectedCategory === 'stocks' && (
        <div className="stock-selector">
          <h2>Stocks:</h2>
          <div className="stock-buttons">
            {Object.entries(marketData.randomStocks).map(([stock, price]) => (
              <button key={stock} onClick={() => handleStockSelect(stock)}>{stock}: {price}</button>
            ))}
          </div>
        </div>
      )}

      {/* Chart section */}
      <div className="chart-section">
        {chartData && (
          <div>
            <h3>1-Hour Chart for {selectedIndex}</h3>
            {/* TODO: add stock daily charts*/}
          </div>
        )}
      </div>
    </div>
  );
}

export default HomePage;
