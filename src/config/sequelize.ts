import config from './configSetup';

module.exports = {
  development: {
    username: config.DB_USER,
    password: config.DB_PASSWORD,
    database: config.DB_NAME,
    host: config.DB_HOST || "127.0.0.1",
    dialect: config.DB_DIALECT || "mysql"
  },
  test: {
    username: config.DB_USER,
    password: config.DB_PASSWORD,
    database: config.DB_NAME,
    host: config.DB_HOST || "127.0.0.1",
    dialect: config.DB_DIALECT || "mysql"
  },
  production: {
    username: config.DB_USER,
    password: config.DB_PASSWORD,
    database: config.DB_NAME,
    host: config.DB_HOST || "127.0.0.1",
    dialect: config.DB_DIALECT || "mysql"
  }
};