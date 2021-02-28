const controller = (db, ds) => {
  /**
   * get portfolio and cast shares into number
   * @param {number} userId
   */
  const getPortfolioById = (userId) => {
    return db
      .select("ticker", "number_of_shares as numShares")
      .from("user_stocks")
      .join("stocks", "stocks.id", "=", "stock_id")
      .where({ user_id: userId })
      .then((result) => {
        return result.reduce((acc, stock) => {
          acc[stock.ticker] = { ...stock, numShares: Number(stock.numShares) };
          return acc;
        }, {});
      });
  };

  /**
   * add and cast prices to portfolio
   * @param {number} userId
   */
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

  /**
   * pass through datastore function to route
   */
  const getStockPrices = ds.getStockPrices;

  /**
   * change owned stock number of shares, after validating is valid trade
   * will update existing row or insert new one, if it doesn't exist
   * @param {number} userId
   * @param {Object[]} newShares - list of newShares positions
   * @param {number} trades[].user_id
   * @param {number} trades[].stock_id
   * @param {string} trades[].number_of_shares - new amount of shares the user owns
   */
  const updatePortfolio = (newShares) => {
    console.log({ newShares });
    return db("user_stocks")
      .insert(newShares)
      .onConflict(["user_id", "stock_id"])
      .merge()
      .returning([
        "user_id as userId",
        "stock_id as stockId",
        "number_of_shares as numShares",
      ])
      .then((result) => result);
  };

  return {
    getPortfolioById,
    getPortfolioDataById,
    updatePortfolio,
    getStockPrices,
  };
};

module.exports = controller;
