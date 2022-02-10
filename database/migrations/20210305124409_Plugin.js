exports.up = function (knex) {
    return knex.schema.createTable("Plugin", (tbl) => {
        tbl.uuid("id").primary();
        tbl.string("name")
        tbl.text("description")
        tbl.integer("access_tier").default(2)
        tbl.string("download_url")
    })
};

exports.down = function (knex) {
    return knex.schema.dropTableIfExists("Plugin");
};
