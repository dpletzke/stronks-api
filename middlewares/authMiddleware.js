require("dotenv").config({ path: "../.env" });
const jwt = require("jsonwebtoken");

const { ErrorHandler } = require("../helpers/errorsHelper");

const authMiddleware = (req, res, next) => {
  const { token } = req.headers;
  const { userId } = req.query;

  jwt.verify(token, process.env.JWT_KEY, (err, decodedUserId) => {

    if (err && err.message === "jwt expired") {
      next(new ErrorHandler(401, "Session expired"));
    } else if (err) {
      next(new ErrorHandler(401, "Unauthorized"));
    } else if (Number(userId) !== decodedUserId.data) {
      next(new ErrorHandler(401, "Request not authorized for user"));
    } else {
      next();
    }
  });
};

module.exports = {
  authMiddleware,
};
