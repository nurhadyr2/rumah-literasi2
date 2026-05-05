'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
	class BookDonationItem extends Model {
		static associate(models) {
			this.belongsTo(models.BookDonation, {
				foreignKey: 'book_donation_id',
				as: 'book_donation',
			});
		}
	}
	BookDonationItem.init(
		{
			id: {
				allowNull: false,
				autoIncrement: true,
				primaryKey: true,
				type: DataTypes.INTEGER,
			},
			title: {
				allowNull: false,
				type: DataTypes.STRING,
				validate: {
					notEmpty: true,
				},
			},
			author: {
				allowNull: false,
				type: DataTypes.STRING,
				validate: {
					notEmpty: true,
				},
			},
			publisher: {
				allowNull: false,
				type: DataTypes.STRING,
				validate: {
					notEmpty: true,
				},
			},
			year: {
				allowNull: false,
				type: DataTypes.INTEGER,
				validate: {
					notEmpty: true,
				},
			},
			amount: {
				allowNull: false,
				type: DataTypes.INTEGER,
				validate: {
					notEmpty: true,
				},
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
				validate: {
					notEmpty: true,
				},
			},
		},
		{
			sequelize,
			modelName: 'BookDonationItem',
			tableName: 'book_donation_items',
			underscored: true,
		}
	);
	return BookDonationItem;
};