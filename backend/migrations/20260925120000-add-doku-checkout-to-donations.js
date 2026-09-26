'use strict';

const TABLES = ['financial_donations', 'book_donations'];

module.exports = {
	async up(queryInterface, Sequelize) {
		for (const table of TABLES) {
			await queryInterface.addColumn(table, 'invoice_number', {
				allowNull: true,
				type: Sequelize.STRING(64),
			});
			await queryInterface.addColumn(table, 'payment_method', {
				allowNull: true,
				type: Sequelize.STRING,
			});
			await queryInterface.addColumn(table, 'payment_expired_at', {
				allowNull: true,
				type: Sequelize.DATE,
			});
			await queryInterface.addIndex(table, ['invoice_number']);
		}
	},

	async down(queryInterface) {
		for (const table of TABLES) {
			await queryInterface.removeIndex(table, ['invoice_number']);
			await queryInterface.removeColumn(table, 'payment_expired_at');
			await queryInterface.removeColumn(table, 'payment_method');
			await queryInterface.removeColumn(table, 'invoice_number');
		}
	},
};
