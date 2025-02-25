'use strict';
const https = require('https');

module.exports = function (app) {
  app.route('/api/stock-prices')
    .get(function (req, res) {
      const stockSymbols = req.query.stock;
      const like = req.query.like === 'true';

      let stocks = [];
      if (Array.isArray(stockSymbols)) {
        stocks = stockSymbols; // if two stocks are provided
      } else {
        stocks = [stockSymbols]; // only one stock
      }

      // Function to fetch stock price data
      function fetchStockData(stockSymbol, callback) {
        const url = `https://stock-price-checker-proxy.freecodecamp.rocks/v1/stock/${stockSymbol}/quote`;

        https.get(url, (response) => {
          let data = '';

          response.on('data', (chunk) => {
            data += chunk;
          });

          response.on('end', () => {
            try {
              const stock = JSON.parse(data);
              callback(null, {
                stock: stock.symbol,
                price: stock.latestPrice,
                likes: like ? 1 : 0, // If liking, increment likes
              });
            } catch (error) {
              callback('Error parsing stock data');
            }
          });
        }).on('error', (err) => {
          callback(`Error fetching stock data: ${err.message}`);
        });
      }

      // Use Promise.all to fetch data for multiple stocks
      const stockDataPromises = stocks.map(stock => {
        return new Promise((resolve, reject) => {
          fetchStockData(stock, (err, data) => {
            if (err) {
              reject(err);
            } else {
              resolve(data);
            }
          });
        });
      });

      Promise.all(stockDataPromises)
        .then((stockData) => {
          if (stocks.length === 2) {
            // If two stocks are passed, calculate relative likes difference
            stockData[0].rel_likes = stockData[0].likes - stockData[1].likes;
            stockData[1].rel_likes = stockData[1].likes - stockData[0].likes;
            res.json({ stockData });
          } else {
            // For a single stock, return stock data with likes
            res.json({ stockData: stockData[0] });
          }
        })
        .catch((error) => {
          res.status(500).json({ error: 'Error fetching stock prices' });
        });
    });
};
