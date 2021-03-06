require("dotenv").config();

module.exports = {
  development: {
    client: "pg",
    connection: {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASS || 'postgres',
      database: process.env.DB_NAME || 'stronks-api',
    },
    // debug:true,
    migrations: {
      directory: "./migrations",
    },
    seeds: {
      directory: "./seeds",
    },
  },
  // production: {
  //   client: "pg",

  //   connection: {
  //     connectionString: process.env.DATABASE_URL,
  //     ssl: { rejectUnauthorized: false },
  //   },
  //   migrations: {
  //     directory: __dirname + "/migrations",
  //   },
  //   seeds: {
  //     directory: __dirname + "/seeds",
  //   },
  // },
};
