const { ValidationError } = require('sequelize');

const ApiError = require('../libs/error');
const ApiResponse = require('../libs/response');
const SearchService = require('../libs/search-service');
const { bookDonationSchema } = require('../libs/schemas');
const { ROLES, PAYMENT_STATUS, DONATION_TYPES } = require('../libs/constant');
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
				method: ['authorize', req.user, [ROLES.ADMIN]],
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

			const { items, detail, courier, method, schedule } = validated;

			const address = await Address.scope({
				method: ['authorize', req.user],
			}).findOne({ where: { id: detail.address_id } });

			if (!address) throw new ApiError(404, 'Address not found');

			const pickupSchedule = method === 'pickup' ? schedule : null;
			const dropoffSchedule = method === 'drop_off' ? schedule : null;

			const created = await BookDonation.create(
				{
					user_id: req.user.id,
					address_id: address.id,
					method,
					pickup_date: pickupSchedule?.date || null,
					pickup_time_slot: pickupSchedule?.time_slot || null,
					pickup_note: pickupSchedule?.note || null,
					dropoff_point_id: dropoffSchedule?.point_id || null,
					dropoff_point_name: dropoffSchedule?.point_name || null,
					dropoff_point_address: dropoffSchedule?.point_address || null,
					estimated_value: detail.estimated_value,
					length: detail.length,
					width: detail.width,
					height: detail.height,
					weight: detail.weight,
					order_id: null,
					tracking_id: null,
					shipping_eta: courier.duration,
					courier_code: courier.courier_code,
					courier_service_code: courier.courier_service_code,
					book_donation_items: items,
					status: PAYMENT_STATUS.PENDING,
				},
				{ include: ['book_donation_items'] }
			);

			const donation = await BookDonation.findOne({
				where: { id: created.id },
				include: ['user', 'address', 'book_donation_items'],
			});

			donation.method = method;
			donation.pickup_schedule = pickupSchedule;
			donation.dropoff_schedule = dropoffSchedule;

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
			await donation.update({ payment_url: payment.redirect_url });

			await LogService.createLog(
				'book_donation_created',
				req.user.id,
				'book_donation',
				donation.id,
				`Book donation #${donation.id} created by ${req.user.name} via ${method}`,
				{
					user_id: req.user.id,
					donation_id: donation.id,
					method,
					order_id: donation.order_id,
					shipping_fee: donation.shipping_fee,
					status: donation.status,
				},
				req
			);

			await donation.save();

			return res.json(
				new ApiResponse('Book donation submitted successfully', donation)
			);
		} catch (error) {
			console.error(JSON.stringify(error, null, 2));
			if (error instanceof ApiError) return next(error);
			if (error.name === 'ZodError') {
				return next(
					new ApiError(
						400,
						'Validasi gagal: ' + error.issues.map((i) => i.message).join(', ')
					)
				);
			}
			return next(
				new ApiError(
					error.response?.status || 500,
					error.response?.data?.message || error.message,
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
			}).findOne({ where: { id } });

			if (!donation) throw new ApiError(404, 'Book donation not found');

			const oldStatus = donation.status;
			await donation.update(req.body);

			if (req.body.status && req.body.status !== oldStatus) {
				await LogService.createLog(
					'book_donation_status_updated',
					req.user.id,
					'book_donation',
					donation.id,
					`${req.user.name} updated status from ${oldStatus} to ${donation.status}`,
					{
						donation_id: donation.id,
						old_status: oldStatus,
						new_status: donation.status,
					},
					req
				);
			}

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
				include: ['user', 'address', 'book_donation_items'],
			});

			if (!donation) throw new ApiError(404, 'Book donation not found');

			if (donation.status !== PAYMENT_STATUS.PENDING) {
				throw new ApiError(
					400,
					'Cannot delete donation unless status is pending'
				);
			}

			const deletedData = donation.toJSON();

			if (donation.order_id) {
				try {
					await DeliveryController.cancel(donation);
				} catch (err) {
					console.error('Biteship cancel error:', err.message);
				}
			}

			await donation.destroy();

			await LogService.createLog(
				'book_donation_deleted',
				req.user.id,
				'book_donation',
				deletedData.id,
				`${req.user.name} deleted book donation #${deletedData.id}`,
				{ donation_id: deletedData.id, deleted_by: req.user.id },
				req
			);

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
			}).findOne({ where: { id } });

			if (!donation) throw new ApiError(404, 'Book donation not found');
			if (!donation.tracking_id)
				throw new ApiError(404, 'Tracking ID not available');

			const { data: tracking } = await DeliveryController.track(donation);

			return res.json(
				new ApiResponse('Tracking retrieved successfully', tracking)
			);
		} catch (error) {
			next(error);
		}
	},
};

module.exports = BookDonationController;
