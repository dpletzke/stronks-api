exports.up = function (knex) {
  return knex.schema.createTable("user_stocks", (table) => {
    table.increments("id").unsigned().primary();
    table
      .integer("user_id")
      .notNullable()
      .references("id")
      .inTable("users")
      .onUpdate("CASCADE")
      .onDelete("CASCADE");
    table
      .integer("stock_id")
      .notNullable()
      .references("id")
      .inTable("stocks")
      .onUpdate("CASCADE")
      .onDelete("CASCADE");
    table.unique(["user_id", "stock_id"]);
    table.decimal("number_of_shares").defaultTo(0);
    table.timestamp("created_at").defaultTo(knex.fn.now());
    table.timestamp("updated_at").defaultTo(knex.fn.now());
  });
};

exports.down = function (knex) {
  knex.raw("ALTER SEQUENCE user_stocks_id_seq RESTART with 10000;");
  return knex.schema.dropTable("user_stocks");
};
