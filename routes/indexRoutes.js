const db = require("../db");
const { authMiddleware } = require("../middlewares/authMiddleware");

const rootController = require("../controllers/rootController")(db);
const usersController = require("../controllers/usersController")(db);

const root = require("./rootRoutes")(rootController);
const users = require("./usersRoutes")(usersController);

module.exports = (app) => {
  app.use("/", root);
  app.use("/users", authMiddleware, users);
};
