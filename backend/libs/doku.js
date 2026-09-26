const crypto = require('crypto');
const axios = require('axios');

const ApiError = require('./error');

const BASE_URL = (
	process.env.DOKU_BASE_URL || 'https://api-sandbox.doku.com'
).replace(/\/+$/, '');
const CLIENT_ID = process.env.DOKU_CLIENT_ID;
const SECRET_KEY = process.env.DOKU_SECRET_KEY;
const PAYMENT_DUE_MINUTES = Number(process.env.DOKU_PAYMENT_DUE_MINUTES) || 60;
const TIMEOUT_MS = Number(process.env.DOKU_TIMEOUT_MS) || 45000;

const CHECKOUT_PATH = '/checkout/v1/payment';
const STATUS_PATH = '/orders/v1/status/';

const isConfigured = () => Boolean(CLIENT_ID && SECRET_KEY);

const digest = (body) =>
	crypto.createHash('sha256').update(body, 'utf8').digest('base64');

const generateSignature = ({
	clientId = CLIENT_ID,
	requestId,
	timestamp,
	target,
	body,
}) => {
	const components = [
		`Client-Id:${clientId}`,
		`Request-Id:${requestId}`,
		`Request-Timestamp:${timestamp}`,
		`Request-Target:${target}`,
	];
	if (body !== undefined && body !== null && body !== '') {
		components.push(`Digest:${digest(body)}`);
	}

	const hmac = crypto
		.createHmac('sha256', SECRET_KEY)
		.update(components.join('\n'))
		.digest('base64');

	return `HMACSHA256=${hmac}`;
};

const timestampNow = () => new Date().toISOString().replace(/\.\d{3}Z$/, 'Z');

const buildHeaders = (target, body) => {
	const requestId = crypto.randomUUID();
	const timestamp = timestampNow();

	return {
		'Client-Id': CLIENT_ID,
		'Request-Id': requestId,
		'Request-Timestamp': timestamp,
		Signature: generateSignature({ requestId, timestamp, target, body }),
	};
};

const ensureConfigured = () => {
	if (!isConfigured()) {
		throw new ApiError(503, 'Pembayaran online (DOKU) belum dikonfigurasi');
	}
};

const createCheckout = async ({
	invoiceNumber,
	amount,
	customer,
	lineItems,
	callbackUrl,
}) => {
	ensureConfigured();

	const payload = {
		order: {
			amount,
			invoice_number: invoiceNumber,
			currency: 'IDR',
			...(callbackUrl && {
				callback_url: callbackUrl,
				callback_url_cancel: callbackUrl,
				callback_url_result: callbackUrl,
			}),
			...(lineItems?.length && { line_items: lineItems }),
		},
		payment: {
			payment_due_date: PAYMENT_DUE_MINUTES,
		},
		...(customer && { customer }),
	};

	if (process.env.DOKU_NOTIFICATION_URL) {
		payload.additional_info = {
			override_notification_url: process.env.DOKU_NOTIFICATION_URL,
		};
	}

	const body = JSON.stringify(payload);
	const { data } = await axios.post(BASE_URL + CHECKOUT_PATH, body, {
		headers: {
			...buildHeaders(CHECKOUT_PATH, body),
			'Content-Type': 'application/json',
		},
		timeout: TIMEOUT_MS,
	});

	return data.response;
};

const checkStatus = async (invoiceNumber) => {
	ensureConfigured();

	const target = STATUS_PATH + encodeURIComponent(invoiceNumber);
	const { data } = await axios.get(BASE_URL + target, {
		headers: buildHeaders(target),
		timeout: TIMEOUT_MS,
	});

	return data;
};

const verifyNotification = ({ headers, rawBody, target }) => {
	if (!isConfigured()) return false;

	const clientId = headers['client-id'];
	const requestId = headers['request-id'];
	const timestamp = headers['request-timestamp'];
	const signature = headers['signature'];

	if (!clientId || !requestId || !timestamp || !signature) return false;
	if (clientId !== CLIENT_ID) return false;

	const expected = generateSignature({
		clientId,
		requestId,
		timestamp,
		target,
		body: rawBody,
	});

	const a = Buffer.from(String(signature));
	const b = Buffer.from(expected);
	return a.length === b.length && crypto.timingSafeEqual(a, b);
};

const parseExpiredDate = (value) => {
	const match = /^(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})$/.exec(
		String(value || '')
	);
	if (!match) return null;
	const [, y, mo, d, h, mi, s] = match;
	return new Date(`${y}-${mo}-${d}T${h}:${mi}:${s}+07:00`);
};

module.exports = {
	isConfigured,
	createCheckout,
	checkStatus,
	verifyNotification,
	generateSignature,
	parseExpiredDate,
	PAYMENT_DUE_MINUTES,
};
