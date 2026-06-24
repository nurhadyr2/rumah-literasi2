'use strict';

module.exports = {
	async up(queryInterface, DataTypes) {
		await queryInterface.createTable('payment_channels', {
			id: {
				allowNull: false,
				autoIncrement: true,
				primaryKey: true,
				type: DataTypes.INTEGER,
			},
			type: {
				allowNull: false,
				type: DataTypes.ENUM('bank', 'ewallet'),
				comment: 'bank = transfer rekening, ewallet = dompet digital',
			},
			name: {
				allowNull: false,
				type: DataTypes.STRING,
				comment: 'Contoh: BCA, Mandiri, GoPay, DANA',
			},
			account_number: {
				allowNull: false,
				type: DataTypes.STRING,
				comment: 'Nomor rekening / nomor e-wallet tujuan',
			},
			account_holder: {
				allowNull: false,
				type: DataTypes.STRING,
				comment: 'Nama pemilik rekening / e-wallet',
			},
			logo: {
				allowNull: true,
				type: DataTypes.STRING,
			},
			instructions: {
				allowNull: true,
				type: DataTypes.TEXT,
				comment: 'Instruksi pembayaran opsional untuk donatur',
			},
			is_active: {
				allowNull: false,
				type: DataTypes.BOOLEAN,
				defaultValue: true,
			},
			created_at: {
				allowNull: false,
				type: DataTypes.DATE,
				defaultValue: DataTypes.NOW,
			},
			updated_at: {
				allowNull: false,
				type: DataTypes.DATE,
				defaultValue: DataTypes.NOW,
			},
		});
	},

	async down(queryInterface) {
		await queryInterface.dropTable('payment_channels');
	},
};
