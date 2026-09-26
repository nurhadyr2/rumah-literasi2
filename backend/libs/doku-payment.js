const ApiError = require('./error');
const LogService = require('./log-service');
const Doku = require('./doku');
const { PAYMENT_STATUS } = require('./constant');
const { FinancialDonation, BookDonation } = require('../models');

const TYPES = {
	financial: {
		model: FinancialDonation,
		prefix: 'FD',
		resource: 'financial_donation',
		label: 'Donasi Finansial',
		path: 'financial-donations',
		amountOf: (donation) => Number(donation.amount),
	},
	book: {
		model: BookDonation,
		prefix: 'BD',
		resource: 'book_donation',
		label: 'Ongkir Donasi Buku',
		path: 'book-donations',
		amountOf: (donation) => Math.round(Number(donation.shipping_fee)),
	},
};

const sanitizeText = (value, fallback, maxLength = 255) => {
	const text = String(value || '')
		.replace(/[^a-zA-Z0-9 .\-/+,=_:'@%()]/g, '')
		.replace(/\s+/g, ' ')
		.trim()
		.slice(0, maxLength);
	return text || fallback;
};

const INVOICE_PATTERN = /^(FD|BD)(\d+)T\d+$/;

const buildInvoiceNumber = (config, donation) =>
	`${config.prefix}${donation.id}T${Date.now()}`;

const parseInvoiceNumber = (invoiceNumber) => {
	const match = INVOICE_PATTERN.exec(String(invoiceNumber || ''));
	if (!match) return null;

	const type = match[1] === 'FD' ? 'financial' : 'book';
	return { type, id: Number(match[2]) };
};

const callbackUrlFor = (config, donation) => {
	const base = process.env.DOKU_CALLBACK_BASE_URL || process.env.APP_ORIGIN;
	if (!base) return undefined;

	try {
		return new URL(
			`/dashboard/${config.path}/${donation.id}/pay`,
			base
		).toString();
	} catch {
		return undefined;
	}
};

const dokuErrorMessage = (error) => {
	const data = error.response?.data;
	if (Array.isArray(data?.error_messages) && data.error_messages.length) {
		return data.error_messages.join(', ');
	}
	return data?.message?.toString() || error.message;
};

const hasActiveCheckout = (donation) =>
	Boolean(
		donation.payment_url &&
			donation.invoice_number &&
			donation.payment_expired_at &&
			new Date(donation.payment_expired_at).getTime() > Date.now() + 60 * 1000
	);

const DokuPayment = {
	TYPES,
	parseInvoiceNumber,
	hasActiveCheckout,

	async createCheckout(type, donation, user) {
		const config = TYPES[type];

		if (donation.status !== PAYMENT_STATUS.PENDING) {
			throw new ApiError(400, 'Donation is not awaiting payment');
		}

		const amount = config.amountOf(donation);
		if (!Number.isFinite(amount) || amount <= 0) {
			throw new ApiError(400, 'Nominal pembayaran tidak valid');
		}

		if (hasActiveCheckout(donation)) return donation;

		const invoiceNumber = buildInvoiceNumber(config, donation);

		let response;
		try {
			response = await Doku.createCheckout({
				invoiceNumber,
				amount,
				callbackUrl: callbackUrlFor(config, donation),
				customer: {
					id: String(user.id),
					name: sanitizeText(user.name, 'Donatur'),
					email: user.email,
				},
				lineItems: [
					{
						id: String(donation.id),
						name: sanitizeText(
							`${config.label} No. ${donation.id}`,
							config.label
						),
						quantity: 1,
						price: amount,
					},
				],
			});
		} catch (error) {
			if (error instanceof ApiError) throw error;
			console.error(
				'DOKU create checkout failed:',
				invoiceNumber,
				error.response?.data || error.message
			);
			throw new ApiError(
				502,
				`Gagal membuat pembayaran DOKU: ${dokuErrorMessage(error)}`,
				error.response?.data
			);
		}

		const paymentUrl = response?.payment?.url;
		if (!paymentUrl) {
			throw new ApiError(502, 'DOKU tidak mengembalikan URL pembayaran');
		}

		const expiredAt =
			Doku.parseExpiredDate(response.payment.expired_date) ||
			new Date(Date.now() + Doku.PAYMENT_DUE_MINUTES * 60 * 1000);

		await donation.update({
			invoice_number: invoiceNumber,
			payment_url: paymentUrl,
			payment_expired_at: expiredAt,
		});

		return donation;
	},

	async applyStatus({ invoiceNumber, status, amount, channel, paidAt, source }) {
		const parsed = parseInvoiceNumber(invoiceNumber);
		if (!parsed) return { handled: false, reason: 'unknown_invoice' };

		const config = TYPES[parsed.type];
		const donation = await config.model.findByPk(parsed.id);
		if (!donation) return { handled: false, reason: 'donation_not_found' };

		if (donation.status !== PAYMENT_STATUS.PENDING) {
			return { handled: false, reason: 'already_processed', donation };
		}

		const normalized = String(status || '').toUpperCase();

		if (normalized === 'SUCCESS') {
			const expected = config.amountOf(donation);
			const paid = Number(amount);
			const hasPaidAmount = Number.isFinite(paid) && paid > 0;
			const amountMismatch = hasPaidAmount && paid !== expected;

			const payload = {
				status:
					parsed.type === 'financial'
						? PAYMENT_STATUS.SUCCESS
						: PAYMENT_STATUS.WAITING_VERIFICATION,
				invoice_number: invoiceNumber,
				payment_method: channel || donation.payment_method || null,
				paid_at: paidAt ? new Date(paidAt) : new Date(),
			};
			if (parsed.type === 'financial') {
				payload.verified_at = new Date();
				if (amountMismatch) payload.amount = paid;
			}

			const [affected] = await config.model.update(payload, {
				where: { id: donation.id, status: PAYMENT_STATUS.PENDING },
			});
			if (!affected) {
				return { handled: false, reason: 'already_processed', donation };
			}

			await donation.reload();

			await LogService.createLog(
				`${config.resource}_payment_doku_success`,
				donation.user_id,
				config.resource,
				donation.id,
				`Pembayaran ${config.label} #${donation.id} berhasil via DOKU (${payload.payment_method || '-'})`,
				{
					donation_id: donation.id,
					invoice_number: invoiceNumber,
					channel: payload.payment_method,
					paid_amount: hasPaidAmount ? paid : null,
					expected_amount: expected,
					amount_mismatch: amountMismatch,
					new_status: payload.status,
					source,
				}
			);

			return { handled: true, donation };
		}

		if (normalized === 'EXPIRED') {
			if (donation.invoice_number === invoiceNumber) {
				await donation.update({
					payment_url: null,
					payment_expired_at: null,
				});
			}
			return { handled: true, donation };
		}

		return { handled: false, reason: 'ignored_status', donation };
	},

	async syncStatus(donation) {
		if (donation.status !== PAYMENT_STATUS.PENDING || !donation.invoice_number) {
			return donation;
		}
		if (!Doku.isConfigured()) return donation;

		let data;
		try {
			data = await Doku.checkStatus(donation.invoice_number);
		} catch (error) {
			if (error.response?.status !== 404) {
				console.error(
					'DOKU check status failed:',
					donation.invoice_number,
					error.response?.data || error.message
				);
			}
			return donation;
		}

		const transactionStatus = String(data?.transaction?.status || '').toUpperCase();
		const orderStatus = String(data?.order?.status || '').toUpperCase();
		const status =
			transactionStatus === 'SUCCESS'
				? 'SUCCESS'
				: transactionStatus === 'EXPIRED' || orderStatus === 'ORDER_EXPIRED'
					? 'EXPIRED'
					: transactionStatus;

		const result = await DokuPayment.applyStatus({
			invoiceNumber: donation.invoice_number,
			status,
			amount: data?.order?.amount,
			channel: data?.channel?.id,
			paidAt: data?.transaction?.date,
			source: 'check_status',
		});

		if (result.handled) await donation.reload();
		return donation;
	},
};

module.exports = DokuPayment;
