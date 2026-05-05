require('dotenv').config();

module.exports = {
	development: {
		username: process.env.DB_USERNAME,
		password: process.env.DB_PASSWORD,
		database: process.env.DB_DATABASE,
		host: process.env.DB_HOST,
		port: process.env.DB_PORT,
		dialect: 'mysql',
		logging: false,
	},
	test: {
		dialect: 'sqlite',
		storage: './database/test.sqlite',
		migrationStorageTableName: 'sequelize_meta',
		logging: false,
	},
	production: {
		username: process.env.DB_USERNAME,
		password: process.env.DB_PASSWORD,
		database: process.env.DB_DATABASE,
		host: process.env.DB_HOST,
		port: process.env.DB_PORT,
		dialect: 'mysql',
		logging: false,
	},
};
