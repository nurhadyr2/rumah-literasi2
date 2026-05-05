'use strict';
const { Model } = require('sequelize');
const { scope } = require('../middleware/authorize');
const { PAYMENT_STATUS } = require('../libs/constant');

module.exports = (sequelize, DataTypes) => {
	class BookDonation extends Model {
		static associate(models) {
			this.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' });
			this.belongsTo(models.Address, {
				foreignKey: 'address_id',
				as: 'address',
			});
			this.hasMany(models.BookDonationItem, {
				foreignKey: 'book_donation_id',
				as: 'book_donation_items',
			});
		}
	}

	BookDonation.init(
		{
			uuid: {
				allowNull: false,
				type: DataTypes.STRING,
				defaultValue: DataTypes.UUIDV4,
				validate: { notEmpty: true },
			},
			status: {
				allowNull: false,
				type: DataTypes.ENUM,
				values: [
					PAYMENT_STATUS.PENDING,
					PAYMENT_STATUS.SUCCESS,
					PAYMENT_STATUS.FAILED,
				],
				defaultValue: PAYMENT_STATUS.PENDING,
				validate: { notEmpty: true },
			},

			method: {
				allowNull: true,
				type: DataTypes.ENUM('pickup', 'drop_off'),
				comment: 'pickup = kurir jemput, dropoff = donatur antar ke titik',
			},

			pickup_date: {
				allowNull: true,
				type: DataTypes.DATEONLY,
			},
			pickup_time_slot: {
				allowNull: true,
				type: DataTypes.STRING,
				comment: 'Contoh: 08:00-10:00',
			},
			pickup_note: {
				allowNull: true,
				type: DataTypes.STRING,
			},

			dropoff_point_id: {
				allowNull: true,
				type: DataTypes.STRING,
			},
			dropoff_point_name: {
				allowNull: true,
				type: DataTypes.STRING,
			},
			dropoff_point_address: {
				allowNull: true,
				type: DataTypes.TEXT,
			},

			payment_url: { allowNull: true, type: DataTypes.STRING },
			user_id: { allowNull: false, type: DataTypes.INTEGER },
			address_id: { allowNull: false, type: DataTypes.INTEGER },
			estimated_value: { allowNull: false, type: DataTypes.INTEGER },
			length: { allowNull: true, type: DataTypes.FLOAT },
			width: { allowNull: true, type: DataTypes.FLOAT },
			height: { allowNull: true, type: DataTypes.FLOAT },
			weight: { allowNull: true, type: DataTypes.FLOAT },
			media: { allowNull: true, type: DataTypes.STRING },
			acceptance_notes: {
				allowNull: true,
				type: DataTypes.STRING,
				defaultValue: '',
			},
			order_id: { allowNull: true, type: DataTypes.STRING },
			tracking_id: { allowNull: true, type: DataTypes.STRING },
			shipping_fee: { allowNull: true, type: DataTypes.FLOAT },
			shipping_eta: { allowNull: true, type: DataTypes.STRING },
			courier_code: { allowNull: true, type: DataTypes.STRING },
			courier_service_code: { allowNull: true, type: DataTypes.STRING },
		},
		{
			sequelize,
			modelName: 'BookDonation',
			tableName: 'book_donations',
			underscored: true,
			scopes: scope,
		}
	);

	return BookDonation;
};
