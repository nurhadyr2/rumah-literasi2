const ApiError = require('../libs/error');
const ApiResponse = require('../libs/response');
const Doku = require('../libs/doku');
const DokuPayment = require('../libs/doku-payment');

const findOwnedDonation = async (type, req) => {
	const id = req.params.id;
	if (!id) throw new ApiError(400, 'ID is required');

	const donation = await DokuPayment.TYPES[type].model.findOne({
		where: { id, user_id: req.user.id },
	});
	if (!donation) throw new ApiError(404, 'Donation not found');

	return donation;
};

const DokuPaymentController = {
	checkout(type) {
		return async (req, res, next) => {
			try {
				const donation = await findOwnedDonation(type, req);
				await DokuPayment.createCheckout(type, donation, req.user);

				return res.json(
					new ApiResponse('Payment checkout created successfully', {
						id: donation.id,
						status: donation.status,
						invoice_number: donation.invoice_number,
						payment_url: donation.payment_url,
						payment_expired_at: donation.payment_expired_at,
					})
				);
			} catch (error) {
				next(error);
			}
		};
	},

	status(type) {
		return async (req, res, next) => {
			try {
				const donation = await findOwnedDonation(type, req);
				await DokuPayment.syncStatus(donation);

				return res.json(
					new ApiResponse('Payment status retrieved successfully', {
						id: donation.id,
						status: donation.status,
						invoice_number: donation.invoice_number,
						payment_method: donation.payment_method,
						payment_url: donation.payment_url,
						payment_expired_at: donation.payment_expired_at,
						paid_at: donation.paid_at,
					})
				);
			} catch (error) {
				next(error);
			}
		};
	},

	async notification(req, res, next) {
		try {
			const target =
				process.env.DOKU_NOTIFICATION_PATH || req.originalUrl.split('?')[0];
			const rawBody =
				req.rawBody !== undefined
					? req.rawBody.toString('utf8')
					: JSON.stringify(req.body);

			const valid = Doku.verifyNotification({
				headers: req.headers,
				rawBody,
				target,
			});
			if (!valid) {
				return res.status(401).json({ message: 'Invalid signature' });
			}

			const body = req.body || {};
			const transactionStatus = body.transaction?.status;
			const orderStatus = String(body.order?.status || '').toUpperCase();

			const result = await DokuPayment.applyStatus({
				invoiceNumber: body.order?.invoice_number,
				status:
					orderStatus === 'ORDER_EXPIRED' ? 'EXPIRED' : transactionStatus,
				amount: body.order?.amount,
				channel: body.channel?.id,
				paidAt: body.transaction?.date,
				source: 'notification',
			});

			if (!result.handled && result.reason !== 'ignored_status') {
				console.warn('DOKU notification not applied:', {
					invoice_number: body.order?.invoice_number,
					status: transactionStatus,
					reason: result.reason,
				});
			}

			return res.json({ success: true });
		} catch (error) {
			next(error);
		}
	},
};

module.exports = DokuPaymentController;
