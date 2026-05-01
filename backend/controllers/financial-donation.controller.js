const ApiError = require('../libs/error');
const ApiResponse = require('../libs/response');
const SearchService = require('../libs/search-service');
const { ROLES, PAYMENT_STATUS, DONATION_TYPES } = require('../libs/constant');
const { FinancialDonation, sequelize } = require('../models');
const { Op } = require('sequelize');
const PaymentController = require('./payment.controller');
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
				...req.body,
				user_id: req.user.id,
			});

			const { data } = await PaymentController.midtrans(
				financialDonation,
				req.user,
				DONATION_TYPES.FINANCIAL
			);

			await financialDonation.update({
				payment_url: data.redirect_url,
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

	async show(req, res, next) {
		try {
			const id = req.params.id;
			if (!id) throw new ApiError(400, 'ID is required');

			const financialDonation = await FinancialDonation.scope({
				method: ['authorize', req.user, [ROLES.ADMIN]],
			}).findOne({
				where: { id },
				include: 'user',
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
