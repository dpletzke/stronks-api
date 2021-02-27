const jwt = require("jsonwebtoken");
const Router = require("express-promise-router");
require("dotenv").config();

const router = new Router();

const { ErrorHandler } = require("../helpers/errorsHelper");

module.exports = (controller) => {
  const { login } = controller;

  router.get("/", (req, res, next) => {
    res.render("index", { title: "Express" });
  });

  router.post("/login", (req, res, next) => {
    const { email, password } = req.body;
    if (!email || !password) {
      next(new ErrorHandler(400, "Missing field(s)"));
    } else {
      login({ email, password })
        .then((user) => {
          const token = jwt.sign(
            {
              data: user.id,
            },
            process.env.JWT_KEY,
            { expiresIn: "24h" }
          );
          res.json({ token, userId: user.id });
        })
        .catch((err) => {
          next(err);
        });
    }
  });

  return router;
};
