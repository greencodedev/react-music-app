exports.up = function (knex) {
    return knex.schema.createTable("Token", (tbl) => {
        tbl.string("userId").notNullable().references("User.id")
        tbl.string("token").notNullable();
        tbl.bigInteger("expiresAt").notNullable()
    })
};

exports.down = function (knex) {
    return knex.schema.dropTableIfExists("Token")
};
