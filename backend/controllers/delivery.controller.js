const crypto = require('crypto');

const biteship = require('../libs/biteship');
const ApiError = require('../libs/error');
const ApiResponse = require('../libs/response');
const { Merchant, Address } = require('../models');

const PICKUP_COURIERS = [
	'sicepat',
	'anteraja',
	'jnt',
	'lion',
	'sap',
	'idexpress',
	'tiki',
	'pos',
];

const DeliveryController = {
	async draft(donation) {
		const merchant = await Merchant.findOne();
		if (!merchant) throw new Error('Merchant data not found in database');

		const isPickup = donation.method === 'pickup';

		if (isPickup && !PICKUP_COURIERS.includes(donation.courier_code)) {
			throw new ApiError(400, 'Kurir tidak mendukung pickup');
		}

		let deliveryType = 'now';
		if (isPickup && donation.pickup_schedule) {
			deliveryType = 'scheduled';
		}

		const body = {
			origin_contact_name: donation.address.contact_name,
			origin_contact_phone: donation.address.contact_phone,
			origin_contact_email: donation.address.contact_email || undefined,
			origin_address: donation.address.street_address,
			origin_postal_code: donation.address.zipcode,
			origin_latitude: donation.address.latitude,
			origin_longitude: donation.address.longitude,
			origin_note: donation.address.note || '',

			destination_contact_name: merchant.name,
			destination_contact_phone: merchant.phone,
			destination_contact_email: merchant.email,
			destination_address: merchant.address,
			destination_postal_code: merchant.zipcode,
			destination_latitude: merchant.latitude,
			destination_longitude: merchant.longitude,
			destination_note: 'Book donation delivery',

			courier_company: donation.courier_code,
			courier_type: donation.courier_service_code,

			delivery_type: deliveryType,
			collection_method: isPickup ? 'pickup' : 'dropoff',

			order_note: 'Book donation order',
			reference_id: `DONATION-${Date.now()}`,

			items: [
				{
					name: 'Book',
					description: `Book donation for ${merchant.name}`,
					value: Number(donation.estimated_value),
					length: Number(donation.length),
					width: Number(donation.width),
					height: Number(donation.height),
					weight: Number(donation.weight),
					quantity: 1,
				},
			],
		};

		if (isPickup && deliveryType === 'scheduled') {
			const [start, end] = donation.pickup_schedule.time_slot.split('-');

			body.pickup_date = donation.pickup_schedule.date;
			body.pickup_time_window_start = start;
			body.pickup_time_window_end = end;

			if (donation.pickup_schedule.note) {
				body.origin_note = donation.pickup_schedule.note;
			}
		}

		if (!isPickup && donation.dropoff_schedule) {
			body.dropoff_point_id = donation.dropoff_schedule.point_id;
		}

		return await biteship.post('draft_orders', body);
	},

	async confirm(donation) {
		if (!donation.order_id) throw new Error('No draft order found');
		return await biteship.post(`draft_orders/${donation.order_id}/confirm`);
	},

	async cancel(donation) {
		if (!donation.order_id) throw new Error('No draft order found');
		return await biteship.delete(`draft_orders/${donation.order_id}`);
	},

	async track(donation) {
		return await biteship.get(`trackings/${donation.tracking_id}`);
	},

	async rates(req, res, next) {
		try {
			const { detail, method } = req.body;

			const merchant = await Merchant.findOne();
			if (!merchant) throw new ApiError(404, 'Merchant data not found');

			const address = await Address.scope({
				method: ['authorize', req.user],
			}).findOne({ where: { id: detail.address_id } });

			if (!address) throw new ApiError(404, 'Address data not found');
			if (!address.zipcode)
				throw new ApiError(400, 'Address zipcode is required');

			const courierTypes =
				req.app.locals.BITESHIP_COURIERS ||
				process.env.BITESHIP_API_COURIER ||
				'gojek,anteraja,jnt,jne,sicepat';

			const body = {
				origin_postal_code: address.zipcode,
				destination_latitude: merchant.latitude,
				destination_longitude: merchant.longitude,
				couriers: courierTypes,
				items: [
					{
						name: 'Book',
						description: `Book donation for ${merchant.name}`,
						value: Number(detail.estimated_value),
						length: Number(detail.length),
						width: Number(detail.width),
						height: Number(detail.height),
						weight: Number(detail.weight),
						quantity: 1,
					},
				],
			};

			const { data } = await biteship.post('rates/couriers', body);

			const pricings = (data.pricing || []).map((p) => ({
				id: crypto.randomUUID(),

				courier_name: p.courier_name,
				courier_code: p.courier_code,
				courier_service_name: p.courier_service_name,
				courier_service_code: p.courier_service_code,

				price: p.price,
				duration: p.duration,

				available_collection_method: p.available_collection_method || [],

				raw: p, // optional debug
			}));

			return res.json(
				new ApiResponse('Couriers fetched successfully', pricings)
			);
		} catch (error) {
			console.log('BITESHIP ERROR:', error.response?.data);

			if (error instanceof ApiError) return next(error);

			return next(
				new ApiError(
					error.response?.status || 500,
					error.response?.data?.message || error.message,
					error.response?.data
				)
			);
		}
	},
	async dropoffPoints(req, res, next) {
		try {
			const { detail } = req.body;

			const address = await Address.scope({
				method: ['authorize', req.user],
			}).findOne({ where: { id: detail.address_id } });

			if (!address) throw new ApiError(404, 'Address not found');

			const { data } = await biteship.get('couriers/collection_points', {
				params: {
					latitude: address.latitude,
					longitude: address.longitude,
					limit: 20,
				},
			});

			const points = (data.collection_points || []).map((point) => ({
				id: point.id,
				name: point.name,
				address: point.address,
				latitude: point.latitude,
				longitude: point.longitude,
				courier_code: point.courier_code,
				open_hours: point.open_hours || null,
			}));

			return res.json(
				new ApiResponse('Drop off points fetched successfully', points)
			);
		} catch (error) {
			if (error instanceof ApiError) return next(error);

			return next(
				new ApiError(
					error.response?.status || 500,
					error.response?.data?.message || error.message,
					error.response?.data
				)
			);
		}
	},
};

module.exports = DeliveryController;
