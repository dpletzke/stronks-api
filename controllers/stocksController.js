const controller = (db, ds) => {
  /**
   * returns an object of keys ticker, value stockIds for insert prep
   * @param {Object} newPortfolioShares - ref of new positions
   * @param {string} newPortfolioShares.ticker - ticker string
   * @param {number} newPortfolioShares.numShares - new shares amount
   * @returns {Object} stockIdRef - key ticker, value stock_id
   */
  const getStockIds = (newPortfolioShares) => {
    return db
      .select("id as stock_id", "ticker")
      .from("stocks")
      .whereIn(
        "ticker",
        Object.keys(newPortfolioShares)
      )
      .then((result) => {
        return result.reduce((acc, stock) => {
          acc[stock.ticker] = stock.stock_id;
          return acc;
        }, {});
      });
  };

  return { getStockIds };
};

module.exports = controller;
