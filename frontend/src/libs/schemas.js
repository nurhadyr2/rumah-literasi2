import * as z from 'zod';

export const itemSchema = z.object({
	title: z.string().nonempty(),
	author: z.string().nonempty(),
	publisher: z.string().nonempty(),
	year: z.coerce.number(),
	amount: z.coerce.number().min(1),
});

export const detailSchema = z.object({
	address_id: z.string().nonempty(),
	package_size: z.enum(['small', 'medium', 'large']),
	estimated_value: z.coerce.number().min(1),
	length: z.coerce.number().min(1),
	width: z.coerce.number().min(1),
	height: z.coerce.number().min(1),
	weight: z.coerce.number().min(1),
});

export const courierSchema = z.object({
	company: z.string().nonempty(),
	courier_code: z.string().nonempty(),
	courier_service_code: z.string().nonempty(),
	shipping_fee: z.number(),
	duration: z.string().nonempty(),
	type: z.string().nonempty(),
});

export const pickupScheduleSchema = z.object({
	type: z.literal('pickup'),
	date: z.string().nonempty('Tanggal pickup wajib diisi'),
	time_slot: z.string().nonempty('Waktu pickup wajib dipilih'),
	note: z.string().optional(),
});

export const dropoffScheduleSchema = z.object({
	type: z.literal('dropoff'),
	point_id: z.string().nonempty('Pilih titik drop off'),
	point_name: z.string().nonempty(),
	point_address: z.string().nonempty(),
});

export const scheduleSchema = z.discriminatedUnion('type', [
	pickupScheduleSchema,
	dropoffScheduleSchema,
]);

export const bookDonationSchema = z.object({
	items: z.array(itemSchema).min(1),
	detail: detailSchema,
	courier: courierSchema,
	method: z.enum(['pickup', 'dropoff']),
	schedule: scheduleSchema,
});
