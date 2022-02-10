exports.up = function (knex) {
    return knex.schema.createTable("PayPal", tbl => {
        tbl.increments().primary();
        tbl.bigInteger("created").notNullable();
        tbl.bigInteger("updated")
        tbl.string("transaction_id").notNullable();
        tbl.string("payment_status")
    })
};

exports.down = function (knex) {
    return knex.schema.dropTableIfExists("PayPal");
};
