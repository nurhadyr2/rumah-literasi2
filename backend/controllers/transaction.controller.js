const moment = require('moment');

const ApiError = require('../libs/error');
const ApiResponse = require('../libs/response');
const { Transaction, TransactionItem, sequelize } = require('../models');
const DeliveryController = require('./delivery.controller');
const { Op } = require('sequelize');
const { ROLES } = require('../libs/constant');

const TransactionController = {
	async index(req, res, next) {
		try {
			const transactions = await Transaction.scope({
				method: ['authorize', req.user, [ROLES.ADMIN]],
			}).findAll({
				include: ['user', 'transaction_items'],
			});

			return res.json(
				new ApiResponse('Transactions retrieved successfully', transactions)
			);
		} catch (error) {
			next(error);
		}
	},

	async store(req, res, next) {
		try {
			const { books, ...rest } = req.body;
			if (books.length === 0) throw new ApiError(400, 'Books are required');

			const duration = 14;
			const borrowed_date = new moment().format('YYYY-MM-DD');
			const deadline_date = moment(borrowed_date)
				.add(duration, 'days')
				.format('YYYY-MM-DD');

			const transaction = await Transaction.create(
				{
					...rest,
					borrowed_date,
					deadline_date,
					user_id: req.user.id,
					transaction_items: books.map((book) => ({
						book_id: book.id,
						amount: book.amount,
					})),
				},
				{
					include: ['transaction_items'],
				}
			);

			return res.json(new ApiResponse('Books added successfully', transaction));
		} catch (error) {
			next(error);
		}
	},

	async status(req, res, next) {
		try {
			const uuid = req.params.uuid;
			if (!uuid) throw new ApiError(400, 'UUID is required');

			const status = req.body.status;
			if (!status) throw new ApiError(400, 'Status is required');

			const transaction = await Transaction.findOne({
				where: { uuid },
				include: [
					'user',
					{
						model: TransactionItem,
						as: 'transaction_items',
						include: ['book'],
					},
				],
			});

			if (!transaction) throw new ApiError(404, 'Transaction not found');

			const result = await sequelize.transaction(async (tx) => {
				switch (status) {
					case 'approved':
						const result = await DeliveryController.order(transaction);
						await transaction.update(
							{ status, ...result },
							{ transaction: tx }
						);
						break;
					default:
						await transaction.update({ status }, { transaction: tx });
				}

				await transaction.save();
				return transaction;
			});

			const message = 'Transaction ' + status + ' successfully';
			return res.json(new ApiResponse(message, result));
		} catch (error) {
			next(error);
		}
	},

	async show(req, res, next) {
		try {
			const uuid = req.params.uuid;
			if (!uuid) throw new ApiError(400, 'UUID is required');

			const transaction = await Transaction.scope({
				method: ['authorize', req.user, [ROLES.ADMIN]],
			}).findOne({
				where: { uuid },
				include: [
					'user',
					{
						model: TransactionItem,
						as: 'transaction_items',
						include: ['book'],
					},
				],
			});

			if (!transaction) throw new ApiError(404, 'Transaction not found');
			return res.json(
				new ApiResponse('Transaction retrieved successfully', transaction)
			);
		} catch (error) {
			next(error);
		}
	},

	async track(req, res, next) {
		try {
			const uuid = req.params.uuid;
			if (!uuid) throw new ApiError(400, 'UUID is required');

			const transaction = await Transaction.scope({
				method: ['authorize', req.user, [ROLES.ADMIN]],
			}).findOne({
				where: {
					uuid,
					status: {
						[Op.in]: ['approved', 'completed'],
					},
				},
			});

			if (!transaction) throw new ApiError(404, 'Transaction not found');
			const result = await DeliveryController.track(transaction.tracking_id);

			return res.json(
				new ApiResponse('Transaction tracking successfully', result)
			);
		} catch (error) {
			next(error);
		}
	},

	async update(req, res, next) {
		try {
			const uuid = req.params.uuid;
			if (!uuid) throw new ApiError(400, 'UUID is required');

			const transaction = await Transaction.findOne({
				where: { uuid },
			});

			if (!transaction) throw new ApiError(404, 'Transaction not found');
			await transaction.update(req.body);
			await transaction.save();

			return res.json(
				new ApiResponse('Transaction updated successfully', transaction)
			);
		} catch (error) {
			next(error);
		}
	},

	async destroy(req, res, next) {
		try {
			const uuid = req.params.uuid;
			if (!uuid) throw new ApiError(400, 'UUID is required');

			const transaction = await Transaction.findOne({
				where: { uuid },
			});

			if (!transaction) throw new ApiError(404, 'Transaction not found');
			const pending = transaction.status === 'pending';
			if (!pending) {
				throw new ApiError(
					400,
					'Cannot delete transaction unless the status is pending'
				);
			}

			await transaction.destroy();

			return res.json(
				new ApiResponse('Transaction deleted successfully', transaction)
			);
		} catch (error) {
			next(error);
		}
	},
};

module.exports = TransactionController;
