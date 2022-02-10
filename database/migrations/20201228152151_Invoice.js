exports.up = function (knex) {
    return knex.schema.createTable("Invoice", (tbl) => {
        tbl.increments("id").primary()
        tbl.uuid("user_id").references("User.id").notNullable()
        tbl.string("product_type")
        tbl.integer("product_id")
        tbl.string("description")
        tbl.integer("amount")
        tbl.bigInteger("created")
    })
};

exports.down = function (knex) {
    return knex.schema.dropTableIfExists("Invoice")
};
