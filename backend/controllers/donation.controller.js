const ApiError = require('../libs/error');
const ApiResponse = require('../libs/response');
const LogService = require('../libs/log-service');

const { Donation } = require('../models');
const { ROLES } = require('../libs/constant');
const PaymentController = require('./payment.controller');

const DonationController = {
	async index(req, res, next) {
		try {
			const donations = await Donation.scope({
				method: ['authorize', req.user, [ROLES.ADMIN]],
			}).findAll({
				include: 'user',
			});

			return res.json(
				new ApiResponse('Donations retrieved successfully', donations)
			);
		} catch (error) {
			next(error);
		}
	},

	async store(req, res, next) {
		try {
			const donation = await Donation.create({
				...req.body,
				user_id: req.user.id,
			});

			const { data } = await PaymentController.midtrans(donation, req.user);
			donation.payment_url = data.redirect_url;
			donation.status = 'pending';
			await donation.save();

			await LogService.createLog(
				'Membuat Donasi Baru',
				req.user.id,
				'donation',
				donation.id,
				`${req.user.name} membuat donasi #${donation.id}`,
				{ donation_id: donation.id, amount: donation.amount },
				req
			);

			return res.json(
				new ApiResponse('Donation created successfully', donation)
			);
		} catch (error) {
			next(error);
		}
	},

	async show(req, res, next) {
		try {
			const id = req.params.id;
			if (!id) throw new ApiError(400, 'ID is required');

			const donation = await Donation.scope({
				method: ['authorize', req.user, [ROLES.ADMIN]],
			}).findOne({
				where: { id },
				include: 'user',
			});

			if (!donation) throw new ApiError(404, 'Donation not found');
			return res.json(
				new ApiResponse('Donation retrieved successfully', donation)
			);
		} catch (error) {
			next(error);
		}
	},

	async update(req, res, next) {
		try {
			const id = req.params.id;
			if (!id) throw new ApiError(400, 'ID is required');

			const donation = await Donation.scope({
				method: ['authorize', req.user, [ROLES.ADMIN]],
			}).findOne({
				where: { id },
			});

			if (!donation) throw new ApiError(404, 'Donation not found');
			const oldStatus = donation.status;
			await donation.update(req.body);
			await donation.save();

			await LogService.createLog(
				'Mengupdate Donasi',
				req.user.id,
				'donation',
				donation.id,
				`${req.user.name} mengupdate donasi #${donation.id}`,
				{
					donation_id: donation.id,
					old_status: oldStatus,
					new_status: donation.status,
				},
				req
			);

			return res.json(
				new ApiResponse('Donation updated successfully', donation)
			);
		} catch (error) {
			next(error);
		}
	},

	async destroy(req, res, next) {
		try {
			const id = req.params.id;
			if (!id) throw new ApiError(400, 'ID is required');

			const donation = await Donation.scope({
				method: ['authorize', req.user, [ROLES.ADMIN]],
			}).findOne({
				where: { id },
			});

			if (!donation) throw new ApiError(404, 'Donation not found');
			const pending = donation.status === 'pending';
			if (!pending) {
				throw new ApiError(
					400,
					'Cannot delete donation unless the status is pending'
				);
			}

			const deleted = donation.toJSON();
			await donation.destroy();

			await LogService.createLog(
				'Menghapus Donasi',
				req.user.id,
				'donation',
				deleted.id,
				`${req.user.name} menghapus donasi #${deleted.id}`,
				{ donation_id: deleted.id },
				req
			);

			return res.json(
				new ApiResponse('Donation deleted successfully', donation)
			);
		} catch (error) {
			next(error);
		}
	},
};

module.exports = DonationController;
