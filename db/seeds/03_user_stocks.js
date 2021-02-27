exports.seed = async (knex) => {
  // Deletes ALL existing entries
  await knex("user_stocks").del();
  await knex.raw("ALTER SEQUENCE user_stocks_id_seq RESTART with 10000;");

  const seeds = [
    { user_id: 100, stock_id: 1000, number_of_shares: 2 },
    { user_id: 100, stock_id: 1001, number_of_shares: 1 },
    { user_id: 100, stock_id: 1002, number_of_shares: 5 },
    { user_id: 101, stock_id: 1001, number_of_shares: 2 },
    { user_id: 101, stock_id: 1002, number_of_shares: 2 },
  ];

  return await knex("user_stocks").insert(seeds);
};
