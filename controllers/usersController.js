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

  return { getUsers, getUserByEmail, getUserById, getCashById };
};

module.exports = controller;
