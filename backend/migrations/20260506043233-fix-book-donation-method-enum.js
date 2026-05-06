'use strict';

/**
 * Migration: fix method column ENUM value.
 *
 * The previous migration used ENUM('pickup', 'dropoff') — 'dropoff' is wrong.
 * Biteship's origin_collection_method value is 'drop_off' (with underscore).
 *
 * For SQLite (dev): ENUM is stored as string, so this migration is a no-op
 * for existing SQLite dbs — but it documents the correct values.
 *
 * For MySQL (production): This changes the ENUM definition.
 * Run: npm run db:migrate
 */
module.exports = {
	async up(queryInterface, DataTypes) {
		const dialect = queryInterface.sequelize.getDialect();

		if (dialect === 'sqlite') {
			// SQLite does not enforce ENUM — strings are stored as-is.
			// Update any existing rows that have the wrong 'dropoff' value.
			await queryInterface.sequelize.query(
				`UPDATE book_donations SET method = 'drop_off' WHERE method = 'dropoff'`
			);
			return;
		}
		await queryInterface.changeColumn('book_donations', 'method', {
			type: DataTypes.STRING,
			allowNull: true,
		});

		await queryInterface.sequelize.query(
			`UPDATE book_donations SET method = 'drop_off' WHERE method = 'dropoff'`
		);

		await queryInterface.changeColumn('book_donations', 'method', {
			type: DataTypes.ENUM('pickup', 'drop_off'),
			allowNull: true,
			defaultValue: null,
			comment:
				'Metode pengiriman: pickup (kurir jemput) atau drop_off (donatur antar ke titik)',
		});
	},

	async down(queryInterface, DataTypes) {
		const dialect = queryInterface.sequelize.getDialect();

		if (dialect === 'sqlite') {
			await queryInterface.sequelize.query(
				`UPDATE book_donations SET method = 'dropoff' WHERE method = 'drop_off'`
			);
			return;
		}

		await queryInterface.changeColumn('book_donations', 'method', {
			type: DataTypes.STRING,
			allowNull: true,
		});

		await queryInterface.sequelize.query(
			`UPDATE book_donations SET method = 'dropoff' WHERE method = 'drop_off'`
		);

		await queryInterface.changeColumn('book_donations', 'method', {
			type: DataTypes.ENUM('pickup', 'dropoff'),
			allowNull: true,
			defaultValue: null,
		});
	},
};
