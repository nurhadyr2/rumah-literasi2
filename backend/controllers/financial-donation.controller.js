const ApiError = require('../libs/error');
const ApiResponse = require('../libs/response');
const SearchService = require('../libs/search-service');
const { ROLES, PAYMENT_STATUS } = require('../libs/constant');
const { FinancialDonation, PaymentChannel, sequelize } = require('../models');
const { Op } = require('sequelize');
const LogService = require('../libs/log-service');

const searchService = new SearchService(sequelize);

const FinancialDonationController = {
	async index(req, res, next) {
		try {
			const { search, page, limit, status } = req.query;

			const fd = FinancialDonation.scope({
				method: ['authorize', req.user, [ROLES.ADMIN]],
			});

			const filters = {};
			if (status) filters.status = status;
			const result = await searchService.search(
				fd,
				search,
				filters,
				{ page, limit },
				['user'],
				['$user.name$', '$user.email$', 'notes', 'acceptance_notes']
			);

			return res.json(
				new ApiResponse('Financial donations retrieved successfully', {
					rows: result.rows,
					pagination: {
						total: result.count,
						page: result.page,
						limit: result.limit,
						pages: Math.ceil(result.count / result.limit),
					},
				})
			);
		} catch (error) {
			next(error);
		}
	},

	async store(req, res, next) {
		try {
			const financialDonation = await FinancialDonation.create({
				amount: req.body.amount,
				notes: req.body.notes || null,
				user_id: req.user.id,
				status: PAYMENT_STATUS.PENDING,
			});

			await LogService.createLog(
				'New financial donation created',
				req.user.id,
				'Financial Donation',
				financialDonation.id,
				`${req.user.name} created a financial donation of Rp ${financialDonation.amount}`,
				{
					user_id: req.user.id,
					donation_id: financialDonation.id,
					amount: financialDonation.amount,
					status: financialDonation.status,
				},
				req
			);

			return res.json(
				new ApiResponse(
					'Financial donation created successfully',
					financialDonation
				)
			);
		} catch (error) {
			next(error);
		}
	},

	async pay(req, res, next) {
		try {
			const id = req.params.id;
			if (!id) throw new ApiError(400, 'ID is required');

			const donation = await FinancialDonation.scope({
				method: ['authorize', req.user],
			}).findOne({ where: { id } });

			if (!donation) throw new ApiError(404, 'Financial donation not found');
			if (donation.status !== PAYMENT_STATUS.PENDING) {
				throw new ApiError(
					400,
					'Donation is not awaiting payment'
				);
			}
			if (!req.file) throw new ApiError(400, 'Payment proof is required');

			const channel = await PaymentChannel.findOne({
				where: { id: req.body.payment_channel_id, is_active: true },
			});
			if (!channel) throw new ApiError(400, 'Invalid payment channel');

			await donation.update({
				payment_channel_id: channel.id,
				payment_proof: req.file.path,
				paid_at: new Date(),
				status: PAYMENT_STATUS.WAITING_VERIFICATION,
			});

			await LogService.createLog(
				'Bukti pembayaran donasi finansial diunggah',
				req.user.id,
				'financial_donation',
				donation.id,
				`${req.user.name} mengunggah bukti pembayaran via ${channel.name}`,
				{
					donation_id: donation.id,
					payment_channel_id: channel.id,
					channel_name: channel.name,
				},
				req
			);

			return res.json(
				new ApiResponse('Payment proof uploaded successfully', donation)
			);
		} catch (error) {
			next(error);
		}
	},

	async verify(req, res, next) {
		try {
			const id = req.params.id;
			if (!id) throw new ApiError(400, 'ID is required');

			const approve = req.body.approve === true || req.body.approve === 'true';

			const donation = await FinancialDonation.scope({
				method: ['authorize', req.user, [ROLES.ADMIN]],
			}).findOne({ where: { id } });

			if (!donation) throw new ApiError(404, 'Financial donation not found');
			if (donation.status !== PAYMENT_STATUS.WAITING_VERIFICATION) {
				throw new ApiError(400, 'Donation is not awaiting verification');
			}

			const oldStatus = donation.status;
			const status = approve ? PAYMENT_STATUS.SUCCESS : PAYMENT_STATUS.FAILED;

			await donation.update({
				status,
				verified_at: new Date(),
				verified_by: req.user.id,
				acceptance_notes: req.body.acceptance_notes ?? donation.acceptance_notes,
			});

			await LogService.createLog(
				approve
					? 'Pembayaran donasi finansial disetujui'
					: 'Pembayaran donasi finansial ditolak',
				req.user.id,
				'financial_donation',
				donation.id,
				`${req.user.name} ${approve ? 'menyetujui' : 'menolak'} pembayaran donasi #${donation.id}`,
				{
					donation_id: donation.id,
					old_status: oldStatus,
					new_status: status,
					verified_by: req.user.id,
				},
				req
			);

			return res.json(
				new ApiResponse(
					`Donation ${approve ? 'approved' : 'rejected'} successfully`,
					donation
				)
			);
		} catch (error) {
			next(error);
		}
	},

	async show(req, res, next) {
		try {
			const id = req.params.id;
			if (!id) throw new ApiError(400, 'ID is required');

			const financialDonation = await FinancialDonation.scope({
				method: ['authorize', req.user, [ROLES.ADMIN]],
			}).findOne({
				where: { id },
				include: ['user', 'payment_channel'],
			});

			if (!financialDonation) {
				throw new ApiError(404, 'Financial donation not found');
			}

			return res.json(
				new ApiResponse(
					'Financial donation retrieved successfully',
					financialDonation
				)
			);
		} catch (error) {
			next(error);
		}
	},

	async update(req, res, next) {
		try {
			const id = req.params.id;
			if (!id) throw new ApiError(400, 'ID is required');

			const financialDonation = await FinancialDonation.scope({
				method: ['authorize', req.user, [ROLES.ADMIN]],
			}).findOne({
				where: { id },
			});

			if (!financialDonation)
				throw new ApiError(404, 'Financial donation not found');

			const oldData = financialDonation.toJSON();
			const oldStatus = financialDonation.status;

			await financialDonation.update(req.body);

			if (req.body.status && req.body.status !== oldStatus) {
				await LogService.createLog(
					'Status Donasi Finansial di Update',
					req.user.id,
					'financial_donation',
					financialDonation.id,
					`${req.user.name} updated status from ${oldStatus} to ${financialDonation.status}`,
					{
						donation_id: financialDonation.id,
						old_status: oldStatus,
						new_status: financialDonation.status,
						updated_by: req.user.id,
						updated_by_name: req.user.name,
					},
					req
				);
			}

			return res.json(
				new ApiResponse(
					'Financial donation updated successfully',
					financialDonation
				)
			);
		} catch (error) {
			next(error);
		}
	},
	async destroy(req, res, next) {
		try {
			const id = req.params.id;
			if (!id) throw new ApiError(400, 'ID is required');

			const financialDonation = await FinancialDonation.scope({
				method: ['authorize', req.user, [ROLES.ADMIN]],
			}).findOne({
				where: { id },
			});

			if (!financialDonation) {
				throw new ApiError(404, 'Financial donation not found');
			}

			const pending = financialDonation.status === PAYMENT_STATUS.PENDING;
			if (!pending) {
				throw new ApiError(
					400,
					'Cannot delete donation unless the status is pending'
				);
			}

			const oldData = financialDonation.toJSON();

			await LogService.createLog(
				'Menghapus Data Donasi Finansial ',
				req.user.id,
				'financial_donation',
				financialDonation.id,
				`${req.user.name} deleted financial donation of Rp ${financialDonation.amount}`,
				{
					deleted_by: req.user.id,
					deleted_by_name: req.user.name,
					donation_id: financialDonation.id,
					amount: financialDonation.amount,
					status: financialDonation.status,
					data: oldData,
				},
				req
			);

			await financialDonation.destroy();

			return res.json(
				new ApiResponse(
					'Financial donation deleted successfully',
					financialDonation
				)
			);
		} catch (error) {
			next(error);
		}
	},
};

module.exports = FinancialDonationController;
