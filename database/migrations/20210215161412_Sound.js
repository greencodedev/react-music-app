exports.up = function (knex) {
    return knex.schema.createTable("Sound", tbl => {
        // refactor to include pack as referenced foreign key
        tbl.increments("id").primary();
        tbl.string("name").notNullable().unique();
        tbl.string("pack")
        tbl.string("type");
        tbl.boolean("exclusive");
        tbl.string('genre');
        tbl.integer("tempo");
        tbl.float("duration");
        tbl.string("key");
        tbl.string('instrument_type');
        tbl.string('tags');
        tbl.string("s3_uri").notNullable().unique();
        tbl.integer("download_count").default(0);
        tbl.bigInteger("date_added");
        tbl.bigInteger("date_modified");
    })
};

exports.down = function (knex) {
    return knex.schema.dropTableIfExists("Sound")
};
