exports.seed = async (knex) => {
  await knex("stocks").del();
  await knex.raw("ALTER SEQUENCE stocks_id_seq RESTART with 1000;");

  const seeds = [{ ticker: "AAPL" }, { ticker: "TSLA" }, { ticker: "GME" }];

  return await knex("stocks").insert(seeds);
};
