const ApiError = require('../libs/error');
const ApiResponse = require('../libs/response');
const LogService = require('../libs/log-service');

const { Gift } = require('../models');
const { ROLES } = require('../libs/constant');

const GiftController = {
	async index(req, res, next) {
		try {
			const gifts = await Gift.scope({
				method: ['authorize', req.user, [ROLES.ADMIN]],
			}).findAll({
				include: 'user',
			});
			return res.json(new ApiResponse('Gifts retrieved successfully', gifts));
		} catch (error) {
			next(error);
		}
	},

	async store(req, res, next) {
		try {
			const gift = await Gift.create({
				...req.body,
				user_id: req.user.id,
			});

			await LogService.createLog(
				'Menambah Gift Baru',
				req.user.id,
				'gift',
				gift.id,
				`${req.user.name} menambah gift "${gift.name || gift.id}"`,
				{ gift_id: gift.id },
				req
			);

			return res.json(new ApiResponse('Gift created successfully', gift));
		} catch (error) {
			next(error);
		}
	},

	async show(req, res, next) {
		try {
			const id = req.params.id;
			if (!id) throw new ApiError(400, 'ID is required');

			const gift = await Gift.scope({
				method: ['authorize', req.user, [ROLES.ADMIN]],
			}).findOne({
				where: { id },
				include: 'user',
			});

			if (!gift) throw new ApiError(404, 'Gift not found');
			return res.json(new ApiResponse('Gift retrieved successfully', gift));
		} catch (error) {
			next(error);
		}
	},

	async update(req, res, next) {
		try {
			const id = req.params.id;
			if (!id) throw new ApiError(400, 'ID is required');

			const gift = await Gift.scope({
				method: ['authorize', req.user, [ROLES.ADMIN]],
			}).findOne({
				where: { id },
			});

			if (!gift) throw new ApiError(404, 'Gift not found');
			const oldStatus = gift.status;
			await gift.update(req.body);
			await gift.save();

			await LogService.createLog(
				'Mengupdate Gift',
				req.user.id,
				'gift',
				gift.id,
				`${req.user.name} mengupdate gift #${gift.id}`,
				{
					gift_id: gift.id,
					old_status: oldStatus,
					new_status: gift.status,
					fields: Object.keys(req.body),
				},
				req
			);

			return res.json(new ApiResponse('Gift updated successfully', gift));
		} catch (error) {
			next(error);
		}
	},

	async destroy(req, res, next) {
		try {
			const id = req.params.id;
			if (!id) throw new ApiError(400, 'ID is required');

			const gift = await Gift.scope({
				method: ['authorize', req.user, [ROLES.ADMIN]],
			}).findOne({
				where: { id },
			});

			if (!gift) throw new ApiError(404, 'Gift not found');
			const pending = gift.status === 'pending';
			if (!pending) {
				throw new ApiError(
					400,
					'Cannot delete gift unless the status is pending'
				);
			}

			const deleted = gift.toJSON();
			await gift.destroy();

			await LogService.createLog(
				'Menghapus Gift',
				req.user.id,
				'gift',
				deleted.id,
				`${req.user.name} menghapus gift #${deleted.id}`,
				{ gift_id: deleted.id },
				req
			);

			return res.json(new ApiResponse('Gift deleted successfully', gift));
		} catch (error) {
			next(error);
		}
	},
};

module.exports = GiftController;
