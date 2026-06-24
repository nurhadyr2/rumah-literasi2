'use strict';

module.exports = {
	async up(queryInterface, DataTypes) {
		await queryInterface.changeColumn('payment_channels', 'type', {
			type: DataTypes.ENUM('bank', 'ewallet', 'qr'),
			allowNull: false,
		});

		await queryInterface.changeColumn('payment_channels', 'account_number', {
			type: DataTypes.STRING,
			allowNull: true,
		});
		await queryInterface.changeColumn('payment_channels', 'account_holder', {
			type: DataTypes.STRING,
			allowNull: true,
		});
	},

	async down(queryInterface, DataTypes) {
		await queryInterface.changeColumn('payment_channels', 'account_number', {
			type: DataTypes.STRING,
			allowNull: false,
		});
		await queryInterface.changeColumn('payment_channels', 'account_holder', {
			type: DataTypes.STRING,
			allowNull: false,
		});
		await queryInterface.changeColumn('payment_channels', 'type', {
			type: DataTypes.ENUM('bank', 'ewallet'),
			allowNull: false,
		});
	},
};
