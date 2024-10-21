import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './LiveStocks.css';

function LiveStocks() {
  const nifty50Stocks = [
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

  const [stockList, setStockList] = useState([]);

  const getRandomStocks = (stocks, count) => {
    const shuffled = stocks.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  };

  const fetchStockList = async () => {
      try {
      const randomStocks = getRandomStocks(nifty50Stocks, 10);
      const stockDataPromises = randomStocks.map(stock =>
        axios.get(`http://localhost:5000/ohlcv?symbol=${stock}`)
      );

      const stockDataResponses = await Promise.all(stockDataPromises);

      // Log the responses for debugging
      console.log('Stock Data Responses:', stockDataResponses);

      const formattedStockData = stockDataResponses.map(res => ({
        symbol: res.data.symbol,
        last_traded_price: res.data.price,
      }));

      setStockList(formattedStockData);
      } catch (error) {
      console.error('Error fetching stock list:', error.response ? error.response.data : error.message);
      }
    };
    
  useEffect(() => {
    fetchStockList();
  }, []);

  return (
    <div className="live-stocks">
      <h1>Live Stocks</h1>
      <table>
        <thead>
          <tr>
            <th>Symbol</th>
            <th>LTP</th>
          </tr>
        </thead>
        <tbody>
          {stockList.length > 0 ? (
            stockList.map(stock => (
              <tr key={stock.symbol}>
                <td>{stock.symbol}</td>
                <td>{stock.last_traded_price}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="2">Loading stock data...</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default LiveStocks;
