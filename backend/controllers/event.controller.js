const ApiError = require('../libs/error');
const ApiResponse = require('../libs/response');
const SearchService = require('../libs/search-service');
const LogService = require('../libs/log-service');

const { Event, sequelize } = require('../models');

const searchService = new SearchService(sequelize);

const EventController = {
	async index(req, res, next) {
		try {
			const { search, page, limit, status } = req.query;

			const filters = {};
			if (status) filters.status = status;

			const paginate = searchService.paginate({ page, limit });
			const result = await searchService.search(
				Event,
				search,
				filters,
				{ page, limit },
				['user'],
				['title', 'description', 'location']
			);

			return res.json(
				new ApiResponse('Events retrieved successfully', {
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
			const event = await Event.create({
				...req.body,
				media: req.file?.path || null,
				user_id: req.user.id,
			});

			await LogService.createLog(
				'Membuat Data Event Baru',
				req.user?.id,
				'event',
				event.id,
				`${req.user?.name || 'System'} created event ${event.title}`,
				{
					event_id: event.id,
					title: event.title,
					location: event.location,
					date: event.date,
				},
				req
			);

			return res.json(new ApiResponse('Event created successfully', event));
		} catch (error) {
			next(error);
		}
	},
	async show(req, res, next) {
		try {
			const id = req.params.id;
			if (!id) throw new ApiError(400, 'ID is required');

			const event = await Event.findOne({
				where: { id },
				include: ['user'],
			});

			if (!event) throw new ApiError(404, 'Event not found');
			return res.json(new ApiResponse('Event retrieved successfully', event));
		} catch (error) {
			next(error);
		}
	},

	async update(req, res, next) {
		try {
			const id = req.params.id;
			if (!id) throw new ApiError(400, 'ID is required');

			const event = await Event.findOne({
				where: { id },
			});

			if (!event) throw new ApiError(404, 'Event not found');

			const oldData = event.toJSON();

			await event.update({
				...req.body,
				media: req.file ? req.file.path : event.media,
			});

			await LogService.createLog(
				'Mengupdate Data Event',
				req.user?.id,
				'event',
				event.id,
				`${req.user?.name || 'System'} updated event ${event.title}`,
				{
					before: oldData,
					after: event.toJSON(),
				},
				req
			);

			return res.json(new ApiResponse('Event updated successfully', event));
		} catch (error) {
			next(error);
		}
	},

	async destroy(req, res, next) {
		try {
			const id = req.params.id;
			if (!id) throw new ApiError(400, 'ID is required');

			const event = await Event.findOne({
				where: { id },
			});

			if (!event) throw new ApiError(404, 'Event not found');

			const deletedData = event.toJSON();

			await event.destroy();

			await LogService.createLog(
				'Menghapus Data Event',
				req.user?.id,
				'event',
				event.id,
				`${req.user?.name || 'System'} deleted event ${event.title}`,
				{
					event_id: event.id,
					title: deletedData.title,
					location: deletedData.location,
				},
				req
			);

			return res.json(new ApiResponse('Event deleted successfully', event));
		} catch (error) {
			next(error);
		}
	},
};

module.exports = EventController;
