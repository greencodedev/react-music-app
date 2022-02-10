const knex = require("knex");
const configOptions = require("../knexfile");
const {
    DB_ENV = "development"
} = process.env;

module.exports = knex(configOptions[DB_ENV]);
