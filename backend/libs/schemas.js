const { z } = require('zod');

const itemSchema = z.object({
	title: z.string().nonempty(),
	author: z.string().nonempty(),
	publisher: z.string().nonempty(),
	year: z.coerce.number(),
	amount: z.coerce.number().min(1),
});

const detailSchema = z.object({
	address_id: z.string().nonempty(),
	package_size: z.enum(['small', 'medium', 'large']),
	estimated_value: z.coerce.number().min(1),
	length: z.coerce.number().min(1),
	width: z.coerce.number().min(1),
	height: z.coerce.number().min(1),
	weight: z.coerce.number().min(1),
});

const courierSchema = z.object({
	company: z.string().nonempty(),
	courier_code: z.string().nonempty(),
	courier_service_code: z.string().nonempty(),
	shipping_fee: z.number(),
	duration: z.string().nonempty(),
	type: z.string().nonempty(),
});

const pickupScheduleSchema = z.object({
	type: z.literal('pickup'),
	date: z.string().nonempty(),
	time_slot: z.string().nonempty(),
	note: z.string().optional(),
});

const dropoffScheduleSchema = z.object({
	type: z.literal('drop_off'),
	point_id: z.string().nonempty(),
	point_name: z.string().nonempty(),
	point_address: z.string().nonempty(),
});

const scheduleSchema = z.discriminatedUnion('type', [
	pickupScheduleSchema,
	dropoffScheduleSchema,
]);

const bookDonationSchema = z.object({
	items: z.array(itemSchema).min(1),
	detail: detailSchema,
	courier: courierSchema,
	method: z.enum(['pickup', 'drop_off']),
	schedule: scheduleSchema,
});

module.exports = {
	itemSchema,
	detailSchema,
	courierSchema,
	pickupScheduleSchema,
	dropoffScheduleSchema,
	scheduleSchema,
	bookDonationSchema,
};
