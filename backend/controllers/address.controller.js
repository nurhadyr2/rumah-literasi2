const ApiError = require('../libs/error');
const ApiResponse = require('../libs/response');
const SearchService = require('../libs/search-service');

const { Address, sequelize } = require('../models');
const { ROLES } = require('../libs/constant');
const { Op } = require('sequelize');
const biteship = require('../libs/biteship');

const searchService = new SearchService(sequelize);

const AddressController = {
	async index(req, res, next) {
		try {
			const { search, page, limit, status } = req.query;
			const address = Address.scope({ method: ['authorize', req.user] });

			const filters = {};
			if (status) filters.is_default = status === 'default';

			const paginate = searchService.paginate({ page, limit });
			const result = await searchService.search(
				address,
				search,
				filters,
				{ page, limit },
				['user', 'province', 'city', 'district'],
				[
					'$user.name$',
					'$user.email$',
					'contact_name',
					'contact_phone',
					'street_address',
					'zipcode',
				]
			);

			return res.json(
				new ApiResponse('Addresses retrieved successfully', {
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
		let createdAreaId = null;
		const t = await sequelize.transaction();
		try {
			const addresses = await Address.scope({
				method: ['authorize', req.user],
			}).findAll({ transaction: t });

			if (addresses.length >= 10) {
				throw new ApiError(
					400,
					"You've reached the maximum limit of addresses"
				);
			}

			const { data } = await biteship.post('/locations', {
				name: req.body.name,
				contact_name: req.body.contact_name,
				contact_phone: req.body.contact_phone,
				address: req.body.street_address,
				note: req.body.note,
				postal_code: req.body.zipcode,
				latitude: req.body.latitude,
				longitude: req.body.longitude,
				type: 'origin',
			});
			createdAreaId = data.id;

			const address = await Address.create(
				{
					...req.body,
					user_id: req.user.id,
					area_id: data.id,
					is_default: addresses.length === 0,
				},
				{ transaction: t }
			);

			await t.commit();
			return res.json(new ApiResponse('Address created successfully', address));
		} catch (error) {
			if (!t.finished) await t.rollback();
			if (createdAreaId) {
				try {
					await biteship.delete('/locations/' + createdAreaId);
				} catch (cleanupErr) {
					console.error(
						'Biteship cleanup failed for orphan location',
						createdAreaId,
						cleanupErr.response?.data || cleanupErr.message
					);
				}
			}
			if (error.response) {
				return next(
					new ApiError(
						error.response.status || 500,
						error.response.data?.message || error.message,
						error.response.data
					)
				);
			}
			next(error);
		}
	},

	async setDefault(req, res, next) {
		try {
			const id = req.params.id;
			if (!id) throw new ApiError(400, 'ID is required');

			const address = await Address.scope({
				method: ['authorize', req.user],
			}).findOne({
				where: { id },
			});

			if (!address) throw new ApiError(404, 'Address not found');
			await Address.scope({
				method: ['authorize', req.user],
			}).update(
				{ is_default: false },
				{
					where: {
						user_id: req.user.id,
						id: { [Op.ne]: id },
					},
				}
			);
			await address.update({ is_default: true });
			await address.save();

			return res.json(
				new ApiResponse('Default address updated successfully', address)
			);
		} catch (error) {
			next(error);
		}
	},

	async show(req, res, next) {
		try {
			const id = req.params.id;
			if (!id) throw new ApiError(400, 'ID is required');

			const address = await Address.scope({
				method: ['authorize', req.user],
			}).findOne({
				where: { id },
				include: ['user', 'province', 'city', 'district'],
			});

			if (!address) throw new ApiError(404, 'Address not found');
			return res.json(
				new ApiResponse('Address retrieved successfully', address)
			);
		} catch (error) {
			next(error);
		}
	},

	async update(req, res, next) {
		const t = await sequelize.transaction();
		try {
			const id = req.params.id;
			if (!id) throw new ApiError(400, 'ID is required');

			const address = await Address.scope({
				method: ['authorize', req.user],
			}).findOne({
				where: { id },
				transaction: t,
			});

			if (!address) throw new ApiError(404, 'Address not found');

			await address.update(req.body, { transaction: t });
			await biteship.post('/locations/' + address.area_id, {
				name: req.body.name,
				contact_name: req.body.contact_name,
				contact_phone: req.body.contact_phone,
				address: req.body.street_address,
				note: req.body.note,
				postal_code: req.body.zipcode,
				latitude: req.body.latitude,
				longitude: req.body.longitude,
			});

			await t.commit();
			return res.json(new ApiResponse('Address updated successfully', address));
		} catch (error) {
			if (!t.finished) await t.rollback();
			if (error.response) {
				return next(
					new ApiError(
						error.response.status || 500,
						error.response.data?.message || error.message,
						error.response.data
					)
				);
			}
			next(error);
		}
	},

	async destroy(req, res, next) {
		const t = await sequelize.transaction();
		try {
			const id = req.params.id;
			if (!id) throw new ApiError(400, 'ID is required');

			const address = await Address.scope({
				method: ['authorize', req.user],
			}).findOne({
				where: { id },
				transaction: t,
			});

			if (!address) throw new ApiError(404, 'Address not found');

			const areaId = address.area_id;
			await address.destroy({ transaction: t });

			try {
				await biteship.delete('/locations/' + areaId);
			} catch (biteErr) {
				if (biteErr.response?.status !== 404) {
					throw biteErr;
				}
			}

			await t.commit();
			return res.json(new ApiResponse('Address deleted successfully', address));
		} catch (error) {
			if (!t.finished) await t.rollback();
			if (error.response) {
				return next(
					new ApiError(
						error.response.status || 500,
						error.response.data?.message || error.message,
						error.response.data
					)
				);
			}
			next(error);
		}
	},
};

module.exports = AddressController;
