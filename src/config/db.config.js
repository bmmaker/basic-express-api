const dotenv = require('dotenv');
dotenv.config();

const env = process.env;

const development = {
  username: env.MYSQL_USERNAME,
  password: env.MYSQL_PASSWORD,
  database: env.MYSQL_DATABASE,
  host: env.MYSQL_HOST,
  dialect: 'mysql',
  port: env.MYSQL_PORT,
  ssl: 'Amazon RDS',
  logging: console.log,
  timezone: '+09:00',
};

const production = {
  username: env.MYSQL_USERNAME,
  password: env.MYSQL_PASSWORD,
  database: env.MYSQL_DATABASE,
  host: env.MYSQL_HOST,
  dialect: 'mysql',
  port: env.MYSQL_PORT,
  ssl: 'Amazon RDS',
  logging: console.log,
  timezone: '+09:00',
};

const test = {
  username: env.MYSQL_USERNAME,
  password: env.MYSQL_PASSWORD,
  database: env.MYSQL_DATABASE_TEST,
  host: env.MYSQL_HOST,
  dialect: 'mysql',
  port: env.MYSQL_PORT,
  ssl: 'Amazon RDS',
  logging: console.log,
  timezone: '+09:00',
};

export { development, production, test };
