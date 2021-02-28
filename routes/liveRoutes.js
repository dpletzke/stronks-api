const Router = require("express-promise-router");
require("dotenv").config();

const router = new Router();

const { ErrorHandler } = require("../helpers/errorsHelper");

module.exports = (controller) => {
  const { login } = controller;

  router.get("/", (req, res, next) => {

    


    res.render("index", { title: "Express" });
  });

  return router;
};
