const midtrans = require('../libs/midtrans');
const ApiError = require('../libs/error');
const LogService = require('../libs/log-service');

const { FinancialDonation, BookDonation } = require('../models');
const { PAYMENT_STATUS, DONATION_TYPES } = require('../libs/constant');
const DeliveryController = require('./delivery.controller');

const IGNORE = 204;
const MIDTRANS_SERVER_KEY = process.env.MIDTRANS_SERVER_KEY;
const ACTIVATE_PAYMENT = process.env.ACTIVATE_PAYMENT == 'true';

const PaymentController = {
	async midtrans(donation, user, type) {
		const callback = new URL(process.env.MIDTRANS_CALLBACK_URL);
		callback.searchParams.append('type', type);

		const isBook = type === DONATION_TYPES.BOOK;
		const amount = isBook ? donation.shipping_fee : donation.amount;

		if (ACTIVATE_PAYMENT) {
			return await midtrans.post(
				'/transactions',
				{
					transaction_details: {
						order_id: donation.uuid,
						gross_amount: amount,
						customer_details: {
							email: user.email,
						},
					},
				},
				{
					headers: {
						'X-Override-Notification': callback.toString(),
					},
				}
			);
		}

		return new Promise((resolve) => {
			resolve({
				data: {
					redirect_url: 'http://example.com',
				},
			});
		});
	},

	async callback(req, res, next) {
		try {
			const crypto = require('crypto');
			const {
				order_id,
				signature_key,
				status_code,
				gross_amount,
				transaction_status,
			} = req.body;

			const calculated = crypto
				.createHash('sha512')
				.update(order_id + status_code + gross_amount + MIDTRANS_SERVER_KEY)
				.digest('hex');

			console.log({
				order_id,
				status_code,
				gross_amount,
				signature_key,
				calculated,
			});

			if (calculated !== signature_key) return res.sendStatus(204);
			const statuses = ['settlement', 'cancel', 'failure', 'expire'];
			if (!statuses.includes(transaction_status)) return res.sendStatus(204);

			const book = req.query.type === DONATION_TYPES.BOOK;
			const model = book ? BookDonation : FinancialDonation;
			const includes = book
				? ['user', 'address', 'book_donation_items']
				: ['user'];

			const donation = await model.findOne({
				where: { uuid: order_id },
				include: includes,
			});

			if (!donation) return res.sendStatus(204);
			if (donation.status !== PAYMENT_STATUS.PENDING) {
				return res.sendStatus(IGNORE);
			}

			const amount = book ? donation.shipping_fee : donation.amount;
			if (!Number(gross_amount) === amount) return res.sendStatus(204);

			switch (true) {
				case book && transaction_status === 'settlement':
					const { data: order } = await DeliveryController.confirm(donation);
					await donation.update({
						order_id: order.id,
						tracking_id: order.courier.tracking_id,
					});

					await LogService.createLog(
						'Book donation confirmed',
						donation.user_id,
						'Book Donation',
						donation.id,
						`Order confirmed for donation ${donation.id}`,
						{
							order_id: order.id,
							donation_id: donation.id,
							tracking_id: order.courier.tracking_id,
						}
					);
					break;
				case book && transaction_status === 'cancel':
				case book && transaction_status === 'failure':
				case book && transaction_status === 'expire':
					const { data: cancelled } = await DeliveryController.cancel(donation);
					await donation.update({
						order_id: cancelled.id,
					});

					await LogService.createLog(
						'Book donation cancelled',
						donation.user_id,
						'Book Donation',
						donation.id,
						`Draft order cancelled for donation ${donation.id}`,
						{
							donation_id: donation.id,
							order_id: cancelled.id,
						}
					);
					break;
				default:
					break;
			}

			const mapper = {
				settlement: PAYMENT_STATUS.SUCCESS,
				cancel: PAYMENT_STATUS.FAILED,
				failure: PAYMENT_STATUS.FAILED,
				expire: PAYMENT_STATUS.FAILED,
			};

			const old = donation.status;
			const status = mapper[transaction_status];
			await donation.update({
				status: status,
			});

			const resource = book ? 'Book' : 'Financial';
			await LogService.createLog(
				'Payment status changed',
				donation.user_id,
				resource,
				donation.id,
				`Payment status for ${resource} changed from ${old} to ${status}`,
				{
					donation_id: donation.id,
					donation_type: req.query.type,
					old_status: old,
					new_status: status,
					transaction_status,
					gross_amount,
				},
				req
			);

			return res.sendStatus(200);
		} catch (error) {
			console.log(JSON.stringify(error, null, 2));
			if (error instanceof ApiError) return next(error);
			return next(
				new ApiError(
					error.response?.status || 500,
					error.response?.data.message || error.message,
					error.response?.data
				)
			);
		}
	},
};

module.exports = PaymentController;
