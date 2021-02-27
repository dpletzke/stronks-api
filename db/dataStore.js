const stocksInit = {
  AAPL: 130.0,
  TSLA: 700.0,
  GME: 50.0,
};

const stocks = new Map(Object.entries(stocksInit));

stocks.forEach((val, key, map) => {
  const timer = setInterval(() => {
    const changeBy = Math.random() * 0.2 + 0.92;
    map.set(key, (val * changeBy).toFixed(2));
  }, 1000);
});

const getStockPrices = (tickers) => {
  const prices = tickers.reduce((acc, ticker) => {
    acc[ticker] = stocks.get(ticker);
    return acc;
  }, {});
  return new Promise((res, rej) => {
    if (prices) res(prices);
    else rej("No ticker by that name");
  });
};

module.exports = {
  getStockPrices,
};
