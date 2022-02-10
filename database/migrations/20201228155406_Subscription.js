exports.up = function (knex) {
    return knex.schema.createTable("Subscription", (tbl) => {
        tbl.increments("id").primary();
        tbl.uuid("user_id").references("User.id").notNullable()
        tbl.string("plan_id").references("Plan.id")
        tbl.bigInteger("subscribe_start");
        tbl.bigInteger("subscribe_end");
        tbl.bigInteger("trial_start");
        tbl.bigInteger("trial_end");
    })
};

exports.down = function (knex) {
    return knex.schema.dropTableIfExists("Subscription")
};
