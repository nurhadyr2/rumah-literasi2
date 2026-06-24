const ApiError = require('../libs/error');
const ApiResponse = require('../libs/response');
const LogService = require('../libs/log-service');

const { PaymentChannel } = require('../models');
const { ROLES } = require('../libs/constant');

const toBool = (value) => {
	if (typeof value === 'boolean') return value;
	if (value === undefined || value === null || value === '') return undefined;
	return ['true', '1', 'on', 'yes'].includes(String(value).toLowerCase());
};

const PaymentChannelController = {
	async index(req, res, next) {
		try {
			const where = {};
			if (req.user.role === ROLES.DONATUR) {
				where.is_active = true;
			}

			const channels = await PaymentChannel.findAll({
				where,
				order: [
					['type', 'ASC'],
					['name', 'ASC'],
				],
			});

			return res.json(
				new ApiResponse('Payment channels retrieved successfully', channels)
			);
		} catch (error) {
			next(error);
		}
	},

	async show(req, res, next) {
		try {
			const id = req.params.id;
			if (!id) throw new ApiError(400, 'ID is required');

			const channel = await PaymentChannel.findByPk(id);
			if (!channel) throw new ApiError(404, 'Payment channel not found');

			return res.json(
				new ApiResponse('Payment channel retrieved successfully', channel)
			);
		} catch (error) {
			next(error);
		}
	},

	async store(req, res, next) {
		try {
			const type = req.body.type;

			if (type === 'qr') {
				if (!req.file) throw new ApiError(400, 'QR image is required');
			} else {
				if (!req.body.account_number || !req.body.account_holder) {
					throw new ApiError(
						400,
						'Account number and account holder are required'
					);
				}
			}

			const channel = await PaymentChannel.create({
				type,
				name: req.body.name,
				account_number: type === 'qr' ? null : req.body.account_number,
				account_holder: type === 'qr' ? null : req.body.account_holder,
				instructions: req.body.instructions || null,
				is_active: toBool(req.body.is_active) ?? true,
				logo: req.file ? req.file.path : null,
			});

			await LogService.createLog(
				'Menambah Channel Pembayaran',
				req.user.id,
				'payment_channel',
				channel.id,
				`${req.user.name} menambah channel pembayaran "${channel.name}" (${channel.type})`,
				{ payment_channel_id: channel.id, type: channel.type },
				req
			);

			return res.json(
				new ApiResponse('Payment channel created successfully', channel)
			);
		} catch (error) {
			next(error);
		}
	},

	async update(req, res, next) {
		try {
			const id = req.params.id;
			if (!id) throw new ApiError(400, 'ID is required');

			const channel = await PaymentChannel.findByPk(id);
			if (!channel) throw new ApiError(404, 'Payment channel not found');

			const payload = {};
			['type', 'name', 'account_number', 'account_holder', 'instructions'].forEach(
				(field) => {
					if (req.body[field] !== undefined) payload[field] = req.body[field];
				}
			);
			const active = toBool(req.body.is_active);
			if (active !== undefined) payload.is_active = active;
			if (req.file) payload.logo = req.file.path;

			const effectiveType = payload.type ?? channel.type;
			const effectiveLogo = payload.logo ?? channel.logo;
			const effectiveNumber = payload.account_number ?? channel.account_number;
			const effectiveHolder = payload.account_holder ?? channel.account_holder;

			if (effectiveType === 'qr') {
				if (!effectiveLogo) throw new ApiError(400, 'QR image is required');
				payload.account_number = null;
				payload.account_holder = null;
			} else if (!effectiveNumber || !effectiveHolder) {
				throw new ApiError(
					400,
					'Account number and account holder are required'
				);
			}

			await channel.update(payload);

			await LogService.createLog(
				'Mengupdate Channel Pembayaran',
				req.user.id,
				'payment_channel',
				channel.id,
				`${req.user.name} mengupdate channel pembayaran "${channel.name}"`,
				{ payment_channel_id: channel.id, fields: Object.keys(payload) },
				req
			);

			return res.json(
				new ApiResponse('Payment channel updated successfully', channel)
			);
		} catch (error) {
			next(error);
		}
	},

	async destroy(req, res, next) {
		try {
			const id = req.params.id;
			if (!id) throw new ApiError(400, 'ID is required');

			const channel = await PaymentChannel.findByPk(id);
			if (!channel) throw new ApiError(404, 'Payment channel not found');

			const deleted = channel.toJSON();
			await channel.destroy();

			await LogService.createLog(
				'Menghapus Channel Pembayaran',
				req.user.id,
				'payment_channel',
				deleted.id,
				`${req.user.name} menghapus channel pembayaran "${deleted.name}"`,
				{ payment_channel_id: deleted.id },
				req
			);

			return res.json(
				new ApiResponse('Payment channel deleted successfully', channel)
			);
		} catch (error) {
			next(error);
		}
	},
};

module.exports = PaymentChannelController;
