const stocksInit = {
  AAPL: 130.00,
  TSLA: 700.00,
  GME: 50.00,
  OPK: 4.50,
};

const stocks = new Map(Object.entries(stocksInit));

stocks.forEach((val, key, map) => {
  const timer = setInterval(() => {
    const changeBy = Math.random() * 0.2 + 0.92;
    map.set(key, Math.max(0.5, (val * changeBy).toFixed(2)));
  }, 1000);
});
/**
 * 
 * @param {Object[]} tickers - array of ticker strings
 * @returns {Promise} resolves to prices
 * @returns {Object} prices
 * @returns {number} prices[ticker] - current price 
 */
const getStockPrices = (tickers) => {
  const prices = tickers.reduce((acc, ticker) => {
    acc[ticker] = Number(stocks.get(ticker));
    return acc;
  }, {});
  return new Promise((res, rej) => {
    res(prices);
  });
};

module.exports = {
  getStockPrices,
};
