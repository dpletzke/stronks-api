exports.up = function (knex) {
  return knex.schema.createTable("stocks", (table) => {
    table.increments("id").unsigned().primary();
    table.string("ticker").notNullable();
    table.timestamp("created_at").defaultTo(knex.fn.now());
    table.timestamp("updated_at").defaultTo(knex.fn.now());
  });
};

exports.down = function (knex) {
  knex.raw("ALTER SEQUENCE stocks_id_seq RESTART with 1000;");
  return knex.schema.dropTable("stocks");
};
