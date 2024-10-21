const express = require('express');
const yahooFinance = require('yahoo-finance');
const app = express();
const PORT = 5173;

app.get('/ohlcv', async (req, res) => {
  const { symbol } = req.query; // Get the stock symbol from the request

  try {
    const data = await yahooFinance.historical({
      symbol: symbol,
      from: '2024-01-01', // Set your desired start date
      to: new Date().toISOString().slice(0, 10), // Current date
      period: 'd',
    });

    if (data.length > 0) {
      const latestData = data[data.length - 1]; // Get the most recent data
      res.json({
        symbol: latestData.symbol,
        open: latestData.open,
        high: latestData.high,
        low: latestData.low,
        close: latestData.close,
        volume: latestData.volume,
      });
    } else {
      res.status(404).json({ error: 'No data found for this symbol.' });
    }
  } catch (error) {
    console.error('Error fetching data from Yahoo Finance:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
