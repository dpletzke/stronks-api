const bcrypt = require("bcrypt");
const { ErrorHandler } = require("../helpers/errorsHelper");

module.exports = (db) => {
  const login = async ({ email, password }) => {
    const user = await db.select("*").from("users").where({ email }).first();
    if (!user) {
      throw new ErrorHandler(404, "No users by that email address");
    }
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      throw new ErrorHandler(400, "Your password is not correct");
    }

    return user;
  };

  return { login };
};
