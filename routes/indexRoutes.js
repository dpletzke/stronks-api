const db = require("../db");
const ds = require("../db/dataStore");
const { authMiddleware } = require("../middlewares/authMiddleware");

const rootController = require("../controllers/rootController")(db);
const usersController = require("../controllers/usersController")(db);
const stocksController = require("../controllers/stocksController")(db, ds);
const portfoliosController = require("../controllers/portfoliosController")(
  db,
  ds
);

const root = require("./rootRoutes")(rootController);
const users = require("./usersRoutes")(usersController);
const portfolios = require("./portfoliosRoutes")({
  ...portfoliosController,
  ...usersController,
  ...stocksController
});


module.exports = (app, io) => {

  require("../live/connection")(io, ds);

  app.use("/", root);
  app.use("/users", authMiddleware, users);
  app.use("/portfolios", authMiddleware, portfolios);
};
