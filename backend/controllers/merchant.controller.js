const ApiError = require('../libs/error');
const ApiResponse = require('../libs/response');
const LogService = require('../libs/log-service');

const { Merchant, sequelize } = require('../models');
const biteship = require('../libs/biteship');

const MerchantController = {
	async get(req, res, next) {
		try {
			const merchant = await Merchant.findOne();
			if (!merchant) throw new ApiError(404, 'Merchant not found');

			return res.json(
				new ApiResponse('Merchant retrieved successfully', merchant)
			);
		} catch (error) {
			next(error);
		}
	},

	async update(req, res, next) {
		const t = await sequelize.transaction();
		try {
			const merchant = await Merchant.findOne({ transaction: t });
			if (!merchant) throw new ApiError(404, 'Merchant not found');

			await merchant.update(req.body, { transaction: t });

			await biteship.post('/locations/' + merchant.area_id, {
				name: merchant.name,
				contact_name: merchant.contact_name,
				contact_phone: merchant.contact_phone,
				address: merchant.address,
				note: merchant.note,
				postal_code: merchant.zipcode,
				latitude: merchant.latitude,
				longitude: merchant.longitude,
				type: 'destination',
			});

			await t.commit();

			await LogService.createLog(
				'Mengupdate Data Merchant',
				req.user?.id,
				'merchant',
				merchant.id,
				`${req.user?.name || 'System'} mengupdate data merchant "${merchant.name}"`,
				{ merchant_id: merchant.id, fields: Object.keys(req.body) },
				req
			);

			return res.json(
				new ApiResponse('Merchant updated successfully', merchant)
			);
		} catch (error) {
			if (!t.finished) await t.rollback();
			if (error.response) {
				return next(
					new ApiError(
						error.response.status || 500,
						error.response.data?.message || error.message,
						error.response.data
					)
				);
			}
			next(error);
		}
	},
};

module.exports = MerchantController;
