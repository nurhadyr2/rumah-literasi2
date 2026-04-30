const ApiError = require('../libs/error');
const ApiResponse = require('../libs/response');
const SearchService = require('../libs/search-service');
const LogService = require('../libs/log-service');

const { User, sequelize } = require('../models');

const searchService = new SearchService(sequelize);

const UserController = {
	async index(req, res, next) {
		try {
			const { search, page, limit, role } = req.query;

			const filters = {};
			if (role) filters.role = role;

			const paginate = searchService.paginate({ page, limit });
			const result = await searchService.search(
				User,
				search,
				filters,
				{ page, limit },
				[],
				['name', 'email']
			);

			return res.json(
				new ApiResponse('Users retrieved successfully', {
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
			const password = req.body.password;
			if (!password) throw new ApiError(400, 'Password is required');

			const user = await User.create(req.body);
			await LogService.createLog(
				'anggota_create',
				req.user?.id,
				'user',
				user.id,
				`${req.user?.name || 'System'} created user ${user.name}`,
				{
					created_user_id: user.id,
					name: user.name,
					email: user.email,
					role: user.role,
				},
				req
			);

			return res.json(new ApiResponse('User created successfully', user));
		} catch (error) {
			next(error);
		}
	},

	async show(req, res, next) {
		try {
			const uuid = req.params.uuid;
			if (!uuid) throw new ApiError(400, 'UUID is required');

			const user = await User.findOne({
				where: { uuid },
				include: ['financial_donations', 'book_donations'],
			});

			if (!user) throw new ApiError(404, 'User not found');
			return res.json(new ApiResponse('User retrieved successfully', user));
		} catch (error) {
			next(error);
		}
	},

	async update(req, res, next) {
		try {
			const uuid = req.params.uuid;
			if (!uuid) throw new ApiError(400, 'UUID is required');

			const user = await User.findOne({
				where: { uuid },
			});

			if (!user) throw new ApiError(404, 'User not found');

			const oldData = user.toJSON();

			await user.update(req.body);

			await LogService.createLog(
				'anggota_update',
				req.user?.id,
				'user',
				user.id,
				`${req.user?.name || 'System'} updated user ${user.name}`,
				{
					before: oldData,
					after: user.toJSON(),
				},
				req
			);

			return res.json(new ApiResponse('User updated successfully', user));
		} catch (error) {
			next(error);
		}
	},

	async destroy(req, res, next) {
		try {
			const uuid = req.params.uuid;
			if (!uuid) throw new ApiError(400, 'UUID is required');

			const user = await User.findOne({
				where: { uuid },
			});

			if (!user) throw new ApiError(404, 'User not found');

			const deletedData = user.toJSON();

			await user.destroy();

			await LogService.createLog(
				'anggota_delete',
				req.user?.id,
				'user',
				user.id,
				`${req.user?.name || 'System'} deleted user ${user.name}`,
				{
					deleted_user_id: user.id,
					name: deletedData.name,
					email: deletedData.email,
				},
				req
			);

			return res.json(new ApiResponse('User deleted successfully', user));
		} catch (error) {
			next(error);
		}
	},
};

module.exports = UserController;
