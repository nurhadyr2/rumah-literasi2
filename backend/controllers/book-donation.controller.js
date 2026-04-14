const { ValidationError } = require('sequelize');

const ApiError = require('../libs/error');
const ApiResponse = require('../libs/response');
const SearchService = require('../libs/search-service');
const { bookDonationSchema } = require('../libs/schemas');
const { ROLES, PAYMENT_STATUS, DONATION_TYPES } = require('../libs/constant');
const { Op } = require('sequelize');
const LogService = require('../libs/log-service');

const PaymentController = require('./payment.controller');
const DeliveryController = require('./delivery.controller');
const { BookDonation, Address, sequelize } = require('../models');

const searchService = new SearchService(sequelize);

const BookDonationController = {
	async index(req, res, next) {
		try {
			const { search, page, limit, status } = req.query;

			const donations = BookDonation.scope({
				method: ['authorize', req.user, ROLES.ADMIN],
			});

			const filters = {};
			if (status) filters.status = status;

			const paginate = searchService.paginate({ page, limit });
			const result = await searchService.search(
				donations,
				search,
				filters,
				{ page, limit },
				['user', 'address', 'book_donation_items'],
				[
					'$user.name$',
					'$user.email$',
					'$address.name$',
					'$address.street_address$',
					'acceptance_notes',
				]
			);

			return res.json(
				new ApiResponse('Book donations retrieved successfully', {
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
			const validated = bookDonationSchema.parse(req.body.transaction);
			const address = await Address.scope({
				method: ['authorize', req.user],
			}).findOne({
				where: {
					id: validated.detail.address_id,
				},
			});
			if (!address) throw new ApiError(404, 'Address not found');

			const created = await BookDonation.create(
				{
					user_id: req.user.id,
					address_id: address.id,
					estimated_value: validated.detail.estimated_value,
					length: validated.detail.length,
					width: validated.detail.width,
					height: validated.detail.height,
					weight: validated.detail.weight,
					order_id: null,
					tracking_id: null,
					shipping_eta: validated.courier.duration,
					courier_code: validated.courier.courier_code,
					courier_service_code: validated.courier.courier_service_code,
					book_donation_items: validated.items,
					status: PAYMENT_STATUS.PENDING,
				},
				{
					include: ['book_donation_items'],
				}
			);

			const donation = await BookDonation.findOne({
				where: { id: created.id },
				include: ['user', 'address', 'book_donation_items'],
			});
			const { data: draft } = await DeliveryController.draft(donation);
			await donation.update({
				order_id: draft.id,
				shipping_fee: draft.price,
			});

			const { data: payment } = await PaymentController.midtrans(
				donation,
				req.user,
				DONATION_TYPES.BOOK
			);
			await donation.update({
				payment_url: payment.redirect_url,
			});

			await LogService.createLog(
				'book_donation_created',
				req.user.id,
				'book_donation',
				donation.id,
				`Book donation #${donation.id} created by user ${req.user.name}`,
				{
					user_id: req.user.id,
					donation_id: donation.id,
					amount: donation.shipping_fee,
					order_id: donation.order_id,
					status: donation.status,
				},
				req
			);

			await donation.save();
			return res.json(
				new ApiResponse('Book donation submitted successfully', donation)
			);
		} catch (error) {
			console.log(JSON.stringify(error, null, 2));
			if (error instanceof ApiError) return next(error);
			if (error instanceof ValidationError) {
				return next(
					new ApiError(
						400,
						'Failed to submit book donation',
						error.issues.map((issue) => issue.message).join(', ')
					)
				);
			}
			return next(
				new ApiError(
					error.response?.status || 500,
					error.response?.data.message || error.message,
					error.response?.data
				)
			);
		}
	},

	async show(req, res, next) {
		try {
			const id = req.params.id;
			if (!id) throw new ApiError(400, 'ID is required');

			const donation = await BookDonation.scope({
				method: ['authorize', req.user, [ROLES.ADMIN]],
			}).findOne({
				where: { id },
				include: ['user', 'address', 'book_donation_items'],
			});
			if (!donation) throw new ApiError(404, 'Book donation not found');

			return res.json(
				new ApiResponse('Book donation retrieved successfully', donation)
			);
		} catch (error) {
			next(error);
		}
	},

	async update(req, res, next) {
		try {
			const id = req.params.id;
			if (!id) throw new ApiError(400, 'ID is required');

			const donation = await BookDonation.scope({
				method: ['authorize', req.user, [ROLES.ADMIN]],
			}).findOne({
				where: { id },
			});
			if (!donation) throw new ApiError(404, 'Book donation not found');

			await donation.update({
				...req.body,
			});
			return res.json(
				new ApiResponse('Book donation updated successfully', donation)
			);
		} catch (error) {
			next(error);
		}
	},

	async destroy(req, res, next) {
		try {
			const id = req.params.id;
			if (!id) throw new ApiError(400, 'ID is required');

			const donation = await BookDonation.scope({
				method: ['authorize', req.user, [ROLES.ADMIN]],
			}).findOne({
				where: { id },
			});

			if (!donation) throw new ApiError(404, 'Book donation not found');
			if (donation.status !== PAYMENT_STATUS.PENDING) {
				throw new ApiError(
					400,
					'Cannot delete bookDonation unless the status is pending'
				);
			}

			if (donation.order_id) await DeliveryController.cancel(donation);
			await donation.destroy();
			return res.json(
				new ApiResponse('Book donation deleted successfully', donation)
			);
		} catch (error) {
			next(error);
		}
	},

	async track(req, res, next) {
		try {
			const { id } = req.params;
			if (!id) throw new ApiError(400, 'ID is required');

			const donation = await BookDonation.scope({
				method: ['authorize', req.user, [ROLES.ADMIN]],
			}).findOne({
				where: { id },
			});

			if (!donation) throw new ApiError(404, 'Book donation not found');
			if (!donation.tracking_id) {
				throw new ApiError(404, 'Tracking ID not available');
			}

			const { data: tracking } = await DeliveryController.track(donation);

			return res.json(
				new ApiResponse(
					'Book donation tracking retrieved successfully',
					tracking
				)
			);
		} catch (error) {
			next(error);
		}
	},
};

module.exports = BookDonationController;
