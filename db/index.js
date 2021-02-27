require("dotenv").config();

// Database setup
const knexfile = require("./knexfile");
const db = require("knex")(knexfile[process.env.NODE_ENV || "development"]);
module.exports = db;