'use strict';
const argon2 = require('argon2');
const { v4: uuidv4 } = require('uuid');
const { ROLES } = require('../libs/constant');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
	async up(queryInterface, Sequelize) {
		/**
		 * Add seed commands here.
		 *
		 * Example:
		 * await queryInterface.bulkInsert('People', [{
		 *   name: 'John Doe',
		 *   isBetaMember: false
		 * }], {});
		 */
		const hashed = await argon2.hash('password');

		try {
			await queryInterface.bulkInsert(
				'users',
				[
					{
						uuid: uuidv4(),
						name: 'Super Administrator',
						email: 'superadmin@example.com',
						password: hashed,
						role: ROLES.SUPERADMIN,
						is_verified: true,
						created_at: new Date(),
						updated_at: new Date(),
					},
					{
						uuid: uuidv4(),
						name: 'Administrator',
						email: 'admin@example.com',
						password: hashed,
						role: ROLES.ADMIN,
						is_verified: true,
						created_at: new Date(),
						updated_at: new Date(),
					},
					{
						uuid: uuidv4(),
						name: 'Guest',
						email: 'guest@example.com',
						password: hashed,
						role: ROLES.GUEST,
						is_verified: true,
						created_at: new Date(),
						updated_at: new Date(),
					},
				],
				{}
			);
		} catch (error) {
			console.log('Error seeding users:', error);
		}
	},

	async down(queryInterface, Sequelize) {
		/**
		 * Add commands to revert seed here.
		 *
		 * Example:
		 * await queryInterface.bulkDelete('People', null, {});
		 */
	},
};
