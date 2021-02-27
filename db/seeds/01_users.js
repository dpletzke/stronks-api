const bcrypt = require("bcrypt");

const saltRounds = 10;

exports.seed = async (knex) => {
  // Deletes ALL existing entries
  await knex("users").del();
  await knex.raw("ALTER SEQUENCE users_id_seq RESTART with 100;");
  const saltedPass = await bcrypt.hash("test", saltRounds);
  const seeds = [
    { email: "test@test.com", password: saltedPass, cash: 10 },
    { email: "test1@test.com", password: saltedPass, cash: 500 },
    { email: "test2@test.com", password: saltedPass, cash: 10000 },
  ];
  return await knex("users").insert(seeds);
};
