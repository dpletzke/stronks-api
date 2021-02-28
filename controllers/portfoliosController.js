const controller = (db, ds) => {
  const getPortfolioById = (userId) => {
    return db
      .select("ticker", "number_of_shares as numberOfShares")
      .from("user_stocks")
      .join("stocks", "stocks.id", "=", "stock_id")
      .where({ user_id: userId })
      .then((result) => {
        return result.reduce((acc, stock) => {
          acc[stock.ticker] = stock;
          return acc;
        }, {});
      });
  };

  /*
   * get portfolio with prices
   **/
  const getPortfolioDataById = (userId) => {
    return getPortfolioById(userId).then(async (portfolio) => {
      const tickers = Object.keys(portfolio);
      const prices = await ds.getStockPrices(tickers);
      return tickers.reduce((acc, ticker) => {
        acc[ticker] = {
          ...portfolio[ticker],
          price: prices[ticker],
        };
        return acc;
      }, {});
    });
  };
  /*
  * pass through datastore function to route
  */
  const getStockPrices = ds.getStockPrices;

  const tradeStock = (userId, ticker, newPosition) => {
    return db
      .select("cash")
      .from("users")
      .where({ id: userId })
      .first()
      .then((result) => result);
  };

  return { getPortfolioById, getPortfolioDataById, tradeStock, getStockPrices };
};

module.exports = controller;
