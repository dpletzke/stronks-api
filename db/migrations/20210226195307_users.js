
exports.up = function (knex) {
  return knex.schema.createTable("users", (table) => {
    table.increments("id").unsigned().primary();
    table.string("email").notNullable();
    table.string("password").notNullable();
    table.decimal("cash").defaultTo(0);
    table.timestamp("created_at").defaultTo(knex.fn.now());
    table.timestamp("updated_at").defaultTo(knex.fn.now());
  });
};

exports.down = function (knex) {
  knex.raw("ALTER SEQUENCE users_id_seq RESTART with 100;");
  return knex.schema.dropTable("users");
};
