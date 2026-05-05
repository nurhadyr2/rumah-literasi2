'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
	async up(queryInterface, DataTypes) {
		await queryInterface.createTable('book_donation_items', {
			id: {
				allowNull: false,
				autoIncrement: true,
				primaryKey: true,
				type: DataTypes.INTEGER,
			},

			title: {
				allowNull: false,
				type: DataTypes.STRING,
			},
			author: {
				allowNull: false,
				type: DataTypes.STRING,
			},
			publisher: {
				allowNull: false,
				type: DataTypes.STRING,
			},
			year: {
				allowNull: false,
				type: DataTypes.INTEGER,
			},

			amount: {
				allowNull: false,
				type: DataTypes.INTEGER,
			},
			book_donation_id: {
				allowNull: false,
				type: DataTypes.INTEGER,
				references: {
					model: 'book_donations',
					key: 'id',
				},
				onUpdate: 'CASCADE',
				onDelete: 'CASCADE',
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
	async down(queryInterface, Sequelize) {
		await queryInterface.dropTable('book_donation_items');
	},
};
