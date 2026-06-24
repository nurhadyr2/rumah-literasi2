'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
	class PaymentChannel extends Model {
		static associate(models) {
			this.hasMany(models.FinancialDonation, {
				foreignKey: 'payment_channel_id',
				as: 'financial_donations',
			});
			this.hasMany(models.BookDonation, {
				foreignKey: 'payment_channel_id',
				as: 'book_donations',
			});
		}
	}

	PaymentChannel.init(
		{
			type: {
				allowNull: false,
				type: DataTypes.ENUM('bank', 'ewallet', 'qr'),
				validate: {
					notEmpty: true,
					isIn: [['bank', 'ewallet', 'qr']],
				},
			},
			name: {
				allowNull: false,
				type: DataTypes.STRING,
				validate: { notEmpty: true },
			},
			account_number: {
				allowNull: true,
				type: DataTypes.STRING,
			},
			account_holder: {
				allowNull: true,
				type: DataTypes.STRING,
			},
			logo: {
				allowNull: true,
				type: DataTypes.STRING,
			},
			instructions: {
				allowNull: true,
				type: DataTypes.TEXT,
			},
			is_active: {
				allowNull: false,
				type: DataTypes.BOOLEAN,
				defaultValue: true,
			},
		},
		{
			sequelize,
			modelName: 'PaymentChannel',
			tableName: 'payment_channels',
			underscored: true,
			timestamps: true,
		}
	);

	return PaymentChannel;
};
