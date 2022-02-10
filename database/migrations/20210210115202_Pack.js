exports.up = function (knex) {
    return knex.schema.createTable("Pack", tbl => {
        tbl.increments("id").primary();
        tbl.string("title").default("")
        tbl.string("artist").default("")
        tbl.string("description", 1000).default("")
        tbl.string('sound_tags').default("")
        tbl.bigInteger("date_added");
        tbl.bigInteger("date_modified");
    })
};

exports.down = function (knex) {
    return knex.schema.dropTableIfExists("Pack")
};
