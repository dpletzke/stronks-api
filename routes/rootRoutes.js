const Router = require("express-promise-router");

// create a new express-promise-router
// this has the same API as the normal express router except
// it allows you to use async functions as route handlers
const router = new Router();

// export our router to be mounted by the parent application
module.exports = (controller) => {
  const { getLogin } = controller;

  /* GET home page. */
  router.get("/", (req, res, next) => {
    res.render("index", { title: "Express" });
  });

  return router;
};
