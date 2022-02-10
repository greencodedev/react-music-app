module.exports = {
  development: {
    client: 'sqlite3',
    connection: {
      filename: './database/dev.sqlite3'
    },
    migrations: {
      directory: "./database/migrations"
    },
    seeds: {
      directory: "./database/seeds"
    },
    useNullAsDefault: true
  },

  testing: {
    client: "sqlite3",
    connection: {
      filename: "./database/testing.sqlite3"
    },
    migrations: {
      directory: "./database/migrations"
    },
    seeds: {
      directory: "./database/seeds"
    },
    pool: {
      afterCreate: (conn, done) => {
        // runs after a connection is made to the sqlite engine
        conn.run("PRAGMA foreign_keys = ON", done); // turn on FK enforcement
      }
    }
  },

  staging: {
    client: 'mysql',
    connection: {
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      port: process.env.DB_PORT
    },
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      directory: "./database/migrations",
      tableName: 'knex_migrations'
    },
    seeds: {
      directory: "./database/seeds"
    },
  },

  production: {
    client: 'mysql',
    connection: {
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      port: process.env.DB_PORT
    },
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      tableName: 'knex_migrations',
      directory: "./database/migrations"
    },
    seeds: {
      directory: "./database/seeds"
    },
  }
};
