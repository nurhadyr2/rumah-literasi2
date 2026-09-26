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

			const isStaff = [ROLES.ADMIN, ROLES.SUPERADMIN].includes(req.user.role);
			if (isStaff && (!status || status === PAYMENT_STATUS.PENDING)) {
				filters.status = { [Op.ne]: PAYMENT_STATUS.PENDING };
			}

			const paginate = searchService.paginate({ page, limit });
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
						page: paginate.page,
						limit: paginate.limit,
						pages: Math.ceil(result.count / paginate.limit),
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

			const donation = await FinancialDonation.findOne({
				where: { id, user_id: req.user.id },
			});

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

			const isStaff = [ROLES.ADMIN, ROLES.SUPERADMIN].includes(req.user.role);
			if (isStaff && financialDonation.status === PAYMENT_STATUS.PENDING) {
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

			const financialDonation = await FinancialDonation.findOne({
				where: { id, user_id: req.user.id },
			});

			if (!financialDonation)
				throw new ApiError(404, 'Financial donation not found');

			if (financialDonation.status !== PAYMENT_STATUS.PENDING) {
				throw new ApiError(
					400,
					'Donation can only be edited while awaiting payment'
				);
			}

			const amount = req.body.amount ?? financialDonation.amount;
			const amountChanged =
				Number(amount) !== Number(financialDonation.amount);

			await financialDonation.update({
				amount,
				notes: req.body.notes ?? financialDonation.notes,
				...(amountChanged && {
					payment_url: null,
					payment_expired_at: null,
				}),
			});

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

			const isStaff = [ROLES.ADMIN, ROLES.SUPERADMIN].includes(req.user.role);
			const financialDonation = await FinancialDonation.findOne({
				where: isStaff ? { id } : { id, user_id: req.user.id },
			});

			if (!financialDonation) {
				throw new ApiError(404, 'Financial donation not found');
			}

			if (isStaff) {
				if (financialDonation.status !== PAYMENT_STATUS.FAILED) {
					throw new ApiError(
						400,
						'Admin can only delete donations with failed status'
					);
				}
			} else if (financialDonation.status !== PAYMENT_STATUS.PENDING) {
				throw new ApiError(
					400,
					'Cannot delete donation unless the status is pending'
				);
			}

			if (isStaff) {
				await LogService.createLog(
					'Menghapus Donasi Finansial Gagal',
					req.user.id,
					'financial_donation',
					financialDonation.id,
					`${req.user.name} menghapus donasi gagal #${financialDonation.id}`,
					{
						donation_id: financialDonation.id,
						amount: financialDonation.amount,
						status: financialDonation.status,
						deleted_by: req.user.id,
					},
					req
				);
			}

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
