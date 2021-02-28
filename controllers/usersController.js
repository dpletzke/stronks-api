const controller = (db) => {
  const getUsers = () => {
    return db.select("*").from("users");
  };

  const getUserByEmail = (email) => {
    return db
      .select("*")
      .from("users")
      .where({ email })
      .first()
      .then((result) => result);
  };

  const getUserById = (userId) => {
    return db
      .select("*")
      .from("users")
      .where({ id: userId })
      .first()
      .then((result) => result);
  };

  const getCashById = (userId) => {
    return db
      .select("cash")
      .from("users")
      .where({ id: userId })
      .first()
      .then((result) => Number(result.cash));
  };

  // can't use first() on update query
  const updateCashById = (userId, newCash) => {
    return db("users")
      .where({ id: userId })
      .update("cash", newCash)
      .returning("cash")
      .then((result) => result[0]);
  };

  const incrementCashById = (userId, cashChange) => {
    return db("users")
      .where({ id: userId })
      .increment("cash", cashChange)
      .returning("cash")
      .then((result) => result[0]);
  };

  return {
    getUsers,
    getUserByEmail,
    getUserById,
    getCashById,
    updateCashById,
    incrementCashById,
  };
};

module.exports = controller;
