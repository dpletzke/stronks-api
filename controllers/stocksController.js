const controller = (ds) => {

  const getTradeValue = (tickers) => {
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
