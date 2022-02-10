exports.up = function (knex) {
    return knex.schema.createTable("SoundDownload", tbl => {
        tbl.increments("id").primary();
        tbl.string("name").notNullable();
        tbl.integer("soundId").notNullable();
        tbl.string("userId").notNullable().references("User.id")
        tbl.bigInteger("downloaded_at").notNullable()
        tbl.boolean("exclusive").default(false) //* account downloads color/has been downloaded or not
    })
};

exports.down = function (knex) {
    return knex.schema.dropTableIfExists("SoundDownload")
};
