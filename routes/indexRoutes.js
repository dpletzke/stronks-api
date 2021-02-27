const db = require("../db");

const rootController = require("../controllers/rootController");
const usersController = require("../controllers/usersController")(db);

const root = require("./rootRoutes")(rootController);
const users = require("./usersRoutes")(usersController);

module.exports = (app) => {
  app.use("/", root);
  app.use("/users", users);
};
