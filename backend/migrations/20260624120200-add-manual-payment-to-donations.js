'use strict';

const { PAYMENT_STATUS } = require('../libs/constant');

const TABLES = ['financial_donations', 'book_donations'];

const NEW_COLUMNS = {
	payment_channel_id: { allowNull: true, type: 'INTEGER' },
	payment_proof: { allowNull: true, type: 'STRING' },
	paid_at: { allowNull: true, type: 'DATE' },
	verified_at: { allowNull: true, type: 'DATE' },
	verified_by: { allowNull: true, type: 'INTEGER' },
};

const STATUS_VALUES = [
	PAYMENT_STATUS.PENDING,
	PAYMENT_STATUS.WAITING_VERIFICATION,
	PAYMENT_STATUS.SUCCESS,
	PAYMENT_STATUS.FAILED,
];

const OLD_STATUS_VALUES = [
	PAYMENT_STATUS.PENDING,
	PAYMENT_STATUS.SUCCESS,
	PAYMENT_STATUS.FAILED,
];

module.exports = {
	async up(queryInterface, DataTypes) {
		for (const table of TABLES) {
			for (const [name, def] of Object.entries(NEW_COLUMNS)) {
				await queryInterface.addColumn(table, name, {
					allowNull: def.allowNull,
					type: DataTypes[def.type],
				});
			}

			await queryInterface.changeColumn(table, 'status', {
				type: DataTypes.ENUM(...STATUS_VALUES),
				allowNull: false,
				defaultValue: PAYMENT_STATUS.PENDING,
			});
		}
	},

	async down(queryInterface, DataTypes) {
		for (const table of TABLES) {
			await queryInterface.changeColumn(table, 'status', {
				type: DataTypes.ENUM(...OLD_STATUS_VALUES),
				allowNull: false,
				defaultValue: PAYMENT_STATUS.PENDING,
			});

			for (const name of Object.keys(NEW_COLUMNS)) {
				await queryInterface.removeColumn(table, name);
			}
		}
	},
};
