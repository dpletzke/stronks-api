const controller = (db, ds) => {
  const getPortfoiloDataById = (userId) => {
    return db
      .select("ticker", "number_of_shares as numberOfShares")
      .from("user_stocks")
      .join("stocks", "stocks.id", "=", "stock_id")
      .where({ user_id: userId })
      .then(async (result) => {
        const prices = await ds.getStockPrices(
          result.map(({ ticker }) => ticker)
        );
        console.log(prices);
        return result.map((userStock) => {
          return { ...userStock, price: prices[userStock.ticker] };
        });
      });
  };

  const tradeStock = (userId, ticker, newPosition) => {
    return db
      .select("cash")
      .from("users")
      .where({ id: userId })
      .first()
      .then((result) => result);
  };

  return { getPortfoiloDataById, tradeStock };
};

module.exports = controller;
