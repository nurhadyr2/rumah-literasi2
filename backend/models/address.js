'use strict';
const { Model } = require('sequelize');
const { scope } = require('../middleware/authorize');

module.exports = (sequelize, DataTypes) => {
	class Address extends Model {
		/**
		 * Helper method for defining associations.
		 * This method is not a part of Sequelize lifecycle.
		 * The `models/index` file will call this method automatically.
		 */
		static associate(models) {
			this.belongsTo(models.User, {
				foreignKey: 'user_id',
				as: 'user',
			});
			this.belongsTo(models.Province, {
				foreignKey: 'province_id',
				as: 'province',
			});
			this.belongsTo(models.City, {
				foreignKey: 'city_id',
				as: 'city',
			});
			this.belongsTo(models.District, {
				foreignKey: 'district_id',
				as: 'district',
			});
		}
	}
	Address.init(
		{
			id: {
				allowNull: false,
				autoIncrement: true,
				primaryKey: true,
				type: DataTypes.INTEGER,
			},
			area_id: {
				allowNull: true,
				type: DataTypes.STRING,
			},
			name: {
				allowNull: false,
				type: DataTypes.STRING,
				validate: {
					notEmpty: true,
				},
			},
			contact_name: {
				allowNull: false,
				type: DataTypes.STRING,
				validate: {
					notEmpty: true,
				},
			},
			contact_phone: {
				allowNull: false,
				type: DataTypes.STRING,
				validate: {
					notEmpty: true,
				},
			},
			street_address: {
				allowNull: false,
				type: DataTypes.STRING,
				validate: {
					notEmpty: true,
				},
			},
			latitude: {
				allowNull: false,
				type: DataTypes.FLOAT,
				validate: {
					notEmpty: true,
				},
			},
			longitude: {
				allowNull: false,
				type: DataTypes.FLOAT,
				validate: {
					notEmpty: true,
				},
			},
			province_id: {
				allowNull: false,
				type: DataTypes.STRING,
				validate: {
					notEmpty: true,
				},
			},
			city_id: {
				allowNull: false,
				type: DataTypes.STRING,
				validate: {
					notEmpty: true,
				},
			},
			district_id: {
				allowNull: false,
				type: DataTypes.STRING,
				validate: {
					notEmpty: true,
				},
			},
			zipcode: {
				allowNull: false,
				type: DataTypes.STRING,
				validate: {
					notEmpty: true,
					isNumeric: true,
					len: [5],
				},
			},
			note: {
				allowNull: true,
				type: DataTypes.STRING,
			},
			formatted_address: {
				allowNull: true,
				type: DataTypes.TEXT,
			},
			location_source: {
				allowNull: true,
				type: DataTypes.STRING,
				validate: {
					isIn: [
						[
							'geocoded',
							'manual_drag',
							'centroid_fallback',
							'user_location',
						],
					],
				},
			},
			is_location_confirmed: {
				allowNull: false,
				type: DataTypes.BOOLEAN,
				defaultValue: false,
			},
			is_default: {
				allowNull: false,
				type: DataTypes.BOOLEAN,
				defaultValue: false,
			},
			user_id: {
				allowNull: false,
				type: DataTypes.INTEGER,
				validate: {
					notEmpty: true,
				},
			},
		},
		{
			sequelize,
			modelName: 'Address',
			tableName: 'addresses',
			underscored: true,
			scopes: scope,
		}
	);
	return Address;
};
