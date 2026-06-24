'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
	async up(queryInterface) {
		const now = new Date();

		const channels = [
			{
				type: 'bank',
				name: 'BCA',
				account_number: '1234567890',
				account_holder: 'Rumah Literasi',
				instructions: 'Transfer ke rekening BCA atas nama Rumah Literasi.',
				is_active: true,
			},
			{
				type: 'bank',
				name: 'Mandiri',
				account_number: '0987654321',
				account_holder: 'Rumah Literasi',
				instructions: null,
				is_active: true,
			},
			{
				type: 'ewallet',
				name: 'GoPay',
				account_number: '081234567890',
				account_holder: 'Rumah Literasi',
				instructions: 'Kirim ke nomor GoPay atas nama Rumah Literasi.',
				is_active: true,
			},
			{
				type: 'ewallet',
				name: 'DANA',
				account_number: '081234567890',
				account_holder: 'Rumah Literasi',
				instructions: null,
				is_active: true,
			},
		].map((c) => ({ ...c, logo: null, created_at: now, updated_at: now }));

		await queryInterface.bulkInsert('payment_channels', channels, {});
	},

	async down(queryInterface) {
		await queryInterface.bulkDelete('payment_channels', null, {});
	},
};
