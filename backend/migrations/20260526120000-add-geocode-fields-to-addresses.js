'use strict';
module.exports = {
	async up(queryInterface, DataTypes) {
		await queryInterface.addColumn('addresses', 'formatted_address', {
			type: DataTypes.TEXT,
			allowNull: true,
			comment:
				'Alamat lengkap hasil geocoding (display_name dari Nominatim) untuk audit & analytics',
		});

		await queryInterface.addColumn('addresses', 'location_source', {
			type: DataTypes.STRING,
			allowNull: true,
			comment:
				'Sumber lat/lng final: geocoded | manual_drag | centroid_fallback | user_location',
		});

		await queryInterface.addColumn('addresses', 'is_location_confirmed', {
			type: DataTypes.BOOLEAN,
			allowNull: false,
			defaultValue: false,
			comment:
				'True jika user secara eksplisit mengkonfirmasi posisi marker di peta',
		});
	},

	async down(queryInterface) {
		await queryInterface.removeColumn('addresses', 'formatted_address');
		await queryInterface.removeColumn('addresses', 'location_source');
		await queryInterface.removeColumn('addresses', 'is_location_confirmed');
	},
};
