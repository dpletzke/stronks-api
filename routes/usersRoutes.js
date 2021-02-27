const Router = require("express-promise-router");

// create a new express-promise-router
// this has the same API as the normal express router except
// it allows you to use async functions as route handlers
const router = new Router();

// export our router to be mounted by the parent application
module.exports = (controller) => {
  const { getUserById, getCashById } = controller;

  router.get("/", (req, res) => {
    const { userId } = req.query; 

    getUserById(userId).then((result) => {
      res.json(result);
    })
    .catch(err => {
      res.json(err);
    })
  });

  router.get("/cash", (req, res) => {
    const { userId } = req.query; 

    getCashById(userId).then((result) => {
      res.json(result);
    })
    .catch(err => {
      res.json(err);
    })
  });

  return router;
};
