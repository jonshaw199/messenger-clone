const Sequelize = require("sequelize");

const db = new Sequelize(
  process.env.DATABASE_URL ||
    `postgres://${process.env.PSQL_USR}:${process.env.PSQL_PW}@localhost:5432/messenger`,
  {
    logging: false,
  }
);

module.exports = db;
