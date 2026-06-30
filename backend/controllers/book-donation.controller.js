const { ValidationError } = require('sequelize');

const ApiError = require('../libs/error');
const ApiResponse = require('../libs/response');
const SearchService = require('../libs/search-service');
const { bookDonationSchema } = require('../libs/schemas');
const { ROLES, PAYMENT_STATUS } = require('../libs/constant');
const LogService = require('../libs/log-service');

const DeliveryController = require('./delivery.controller');
const { BookDonation, Address, PaymentChannel, sequelize } = require('../models');

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
		const t = await sequelize.transaction();
		let biteshipDraftId = null;
		try {
			const validated = bookDonationSchema.parse(req.body.transaction);

			const { items, detail, courier, method, schedule } = validated;

			const address = await Address.scope({
				method: ['authorize', req.user],
			}).findOne({
				where: { id: detail.address_id },
				transaction: t,
			});

			if (!address) throw new ApiError(404, 'Address not found');

			const isPickup = method === 'pickup';
			const pickupSchedule =
				isPickup && schedule.type === 'pickup' ? schedule : null;
			const dropoffSchedule =
				!isPickup && schedule.type === 'drop_off' ? schedule : null;

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
				{ include: ['book_donation_items'], transaction: t }
			);

			const donation = await BookDonation.findOne({
				where: { id: created.id },
				include: ['user', 'address', 'book_donation_items'],
				transaction: t,
			});

			donation.method = method;
			donation.pickup_schedule = pickupSchedule;
			donation.dropoff_schedule = dropoffSchedule;
			donation.service_type = courier.service_type;

			const { data: draft } = await DeliveryController.draft(donation);
			biteshipDraftId = draft.id;

			await donation.update(
				{ order_id: draft.id, shipping_fee: draft.price },
				{ transaction: t }
			);

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
					courier_code: courier.courier_code,
					courier_service_code: courier.courier_service_code,
				},
				req
			);

			await t.commit();

			return res.json(
				new ApiResponse('Book donation submitted successfully', donation)
			);
		} catch (error) {
			if (!t.finished) await t.rollback();
			if (biteshipDraftId) {
				try {
					await DeliveryController.cancel({ order_id: biteshipDraftId });
				} catch (cleanupErr) {
					console.error(
						'Biteship draft cleanup failed:',
						biteshipDraftId,
						cleanupErr.response?.data || cleanupErr.message
					);
				}
			}
			console.error('Book donation create error:', {
				message: error.message,
				status: error.response?.status,
				biteship_response: error.response?.data,
				biteship_url: error.config?.url,
				biteship_payload: error.config?.data,
			});
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

	async pay(req, res, next) {
		try {
			const id = req.params.id;
			if (!id) throw new ApiError(400, 'ID is required');

			const donation = await BookDonation.scope({
				method: ['authorize', req.user],
			}).findOne({ where: { id } });

			if (!donation) throw new ApiError(404, 'Book donation not found');
			if (donation.status !== PAYMENT_STATUS.PENDING) {
				throw new ApiError(400, 'Donation is not awaiting payment');
			}
			if (!req.file) throw new ApiError(400, 'Payment proof is required');

			const channel = await PaymentChannel.findOne({
				where: { id: req.body.payment_channel_id, is_active: true },
			});
			if (!channel) throw new ApiError(400, 'Invalid payment channel');

			await donation.update({
				payment_channel_id: channel.id,
				payment_proof: req.file.path,
				paid_at: new Date(),
				status: PAYMENT_STATUS.WAITING_VERIFICATION,
			});

			await LogService.createLog(
				'book_donation_payment_uploaded',
				req.user.id,
				'book_donation',
				donation.id,
				`${req.user.name} mengunggah bukti pembayaran ongkir via ${channel.name}`,
				{
					donation_id: donation.id,
					payment_channel_id: channel.id,
					channel_name: channel.name,
				},
				req
			);

			return res.json(
				new ApiResponse('Payment proof uploaded successfully', donation)
			);
		} catch (error) {
			next(error);
		}
	},

	async verify(req, res, next) {
		const t = await sequelize.transaction();
		// Disiapkan untuk logging setelah commit (agar tidak ada log untuk aksi
		// yang ter-rollback). Diisi di dalam transaksi.
		let logPayload = null;
		try {
			const id = req.params.id;
			if (!id) throw new ApiError(400, 'ID is required');

			const approve = req.body.approve === true || req.body.approve === 'true';

			// Kunci baris donasi agar approve tidak bisa berjalan paralel.
			// Tanpa include supaya row lock aman di semua DB; relasi dimuat ulang.
			const locked = await BookDonation.scope({
				method: ['authorize', req.user, [ROLES.ADMIN]],
			}).findOne({
				where: { id },
				lock: t.LOCK.UPDATE,
				transaction: t,
			});

			if (!locked) throw new ApiError(404, 'Book donation not found');
			if (locked.status !== PAYMENT_STATUS.WAITING_VERIFICATION) {
				// Sudah diproses transaksi lain (atau klik ganda) — cegah double-charge.
				throw new ApiError(400, 'Donation is not awaiting verification');
			}

			const donation = await BookDonation.findOne({
				where: { id },
				include: ['user', 'address', 'book_donation_items'],
				transaction: t,
			});

			const oldStatus = donation.status;

			if (approve) {
				// Idempotensi: jika order sudah pernah ter-confirm, jangan confirm
				// (charge) ulang — cukup pakai data yang ada.
				let order;
				if (donation.tracking_id) {
					order = {
						id: donation.order_id,
						price: donation.shipping_fee,
						courier: { tracking_id: donation.tracking_id },
					};
				} else {
					try {
						const result = await DeliveryController.confirm(donation);
						order = result.data;
					} catch (err) {
						console.error(
							'Biteship confirm failed on approval:',
							donation.id,
							err.response?.data || err.message
						);
						throw new ApiError(
							502,
							'Gagal mengonfirmasi pengiriman ke Biteship. Status pembayaran tidak diubah.',
							err.response?.data
						);
					}
				}

				// Rekonsiliasi ongkir: bandingkan harga yang benar-benar di-charge
				// Biteship dengan yang tersimpan (dibayar donatur).
				const confirmedFee = Number(order.price);
				const hasConfirmedFee = Number.isFinite(confirmedFee);
				const feeMismatch =
					hasConfirmedFee && confirmedFee !== Number(donation.shipping_fee);

				await donation.update(
					{
						order_id: order.id,
						tracking_id:
							order.courier?.tracking_id || donation.tracking_id || null,
						shipping_fee: hasConfirmedFee
							? confirmedFee
							: donation.shipping_fee,
						status: PAYMENT_STATUS.SUCCESS,
						verified_at: new Date(),
						verified_by: req.user.id,
						acceptance_notes:
							req.body.acceptance_notes ?? donation.acceptance_notes,
					},
					{ transaction: t }
				);

				logPayload = {
					action: 'book_donation_payment_approved',
					message: `${req.user.name} menyetujui pembayaran & mengonfirmasi pengiriman donasi #${donation.id}`,
					metadata: {
						donation_id: donation.id,
						old_status: oldStatus,
						new_status: PAYMENT_STATUS.SUCCESS,
						order_id: order.id,
						tracking_id: donation.tracking_id,
						shipping_fee_charged: hasConfirmedFee ? confirmedFee : null,
						shipping_fee_mismatch: feeMismatch,
					},
				};
			} else {
				if (donation.order_id) {
					try {
						await DeliveryController.cancel(donation);
					} catch (err) {
						console.error(
							'Biteship cancel failed on rejection:',
							donation.id,
							err.response?.data || err.message
						);
					}
				}

				await donation.update(
					{
						status: PAYMENT_STATUS.FAILED,
						verified_at: new Date(),
						verified_by: req.user.id,
						acceptance_notes:
							req.body.acceptance_notes ?? donation.acceptance_notes,
					},
					{ transaction: t }
				);

				logPayload = {
					action: 'book_donation_payment_rejected',
					message: `${req.user.name} menolak pembayaran donasi #${donation.id}`,
					metadata: {
						donation_id: donation.id,
						old_status: oldStatus,
						new_status: PAYMENT_STATUS.FAILED,
					},
				};
			}

			await t.commit();

			if (logPayload) {
				await LogService.createLog(
					logPayload.action,
					req.user.id,
					'book_donation',
					donation.id,
					logPayload.message,
					logPayload.metadata,
					req
				);
			}

			return res.json(
				new ApiResponse(
					`Donation ${approve ? 'approved' : 'rejected'} successfully`,
					donation
				)
			);
		} catch (error) {
			if (!t.finished) await t.rollback();
			if (error instanceof ApiError) return next(error);
			next(error);
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
				include: ['user', 'address', 'book_donation_items', 'payment_channel'],
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

			// Whitelist: cegah penimpaan field revenue/order (order_id,
			// shipping_fee, tracking_id, verified_by, dll) lewat body mentah.
			const ALLOWED_UPDATE_FIELDS = ['status', 'acceptance_notes'];
			const payload = {};
			for (const field of ALLOWED_UPDATE_FIELDS) {
				if (req.body[field] !== undefined) payload[field] = req.body[field];
			}

			const oldStatus = donation.status;
			await donation.update(payload);

			if (payload.status && payload.status !== oldStatus) {
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
