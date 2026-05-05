'use strict';
module.exports = {
	async up(queryInterface, DataTypes) {
		await queryInterface.addColumn('book_donations', 'method', {
			type: DataTypes.ENUM('pickup', 'dropoff'),
			allowNull: true,
			defaultValue: null,
			comment:
				'Metode pengiriman: pickup (kurir jemput) atau dropoff (donatur antar)',
		});

		await queryInterface.addColumn('book_donations', 'pickup_date', {
			type: DataTypes.DATEONLY,
			allowNull: true,
		});
		await queryInterface.addColumn('book_donations', 'pickup_time_slot', {
			type: DataTypes.STRING,
			allowNull: true,
			comment: 'Contoh: 08:00-10:00',
		});
		await queryInterface.addColumn('book_donations', 'pickup_note', {
			type: DataTypes.STRING,
			allowNull: true,
		});

		await queryInterface.addColumn('book_donations', 'dropoff_point_id', {
			type: DataTypes.STRING,
			allowNull: true,
		});
		await queryInterface.addColumn('book_donations', 'dropoff_point_name', {
			type: DataTypes.STRING,
			allowNull: true,
		});
		await queryInterface.addColumn('book_donations', 'dropoff_point_address', {
			type: DataTypes.TEXT,
			allowNull: true,
		});
	},

	async down(queryInterface) {
		await queryInterface.removeColumn('book_donations', 'method');
		await queryInterface.removeColumn('book_donations', 'pickup_date');
		await queryInterface.removeColumn('book_donations', 'pickup_time_slot');
		await queryInterface.removeColumn('book_donations', 'pickup_note');
		await queryInterface.removeColumn('book_donations', 'dropoff_point_id');
		await queryInterface.removeColumn('book_donations', 'dropoff_point_name');
		await queryInterface.removeColumn(
			'book_donations',
			'dropoff_point_address'
		);
	},
};
