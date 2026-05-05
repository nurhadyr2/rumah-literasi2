import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { bookDonationSchema } from '@/libs/schemas';

export const STEPS = {
	ITEMS: 'items',
	METHOD: 'method',
	DETAIL: 'detail',
	COURIER: 'courier',
	SCHEDULE: 'schedule',
	REVIEW: 'review',
};

export const DELIVERY_METHODS = {
	PICKUP: 'pickup',
	DROPOFF: 'drop_off',
};

const initial = [];

export const useDonation = create(
	persist(
		(set, get) => ({
			step: STEPS.ITEMS,
			items: initial,
			method: null,
			detail: null,
			courier: null,
			schedule: null,

			route: (step) => set({ step }),
			setMethod: (method) => set({ method, courier: null, schedule: null }),
			setDetail: (detail) => set({ detail }),
			setCourier: (courier) => set({ courier }),
			setSchedule: (schedule) => set({ schedule }),

			append: (item) =>
				set((state) => ({
					items: [...state.items, { id: new Date().getTime(), ...item }],
				})),

			update: (id, updated) =>
				set((state) => ({
					items: state.items.map((item) =>
						item.id === id ? { ...item, ...updated } : item
					),
				})),

			remove: (id) =>
				set((state) => ({
					items: state.items.filter((item) => item.id !== id),
				})),

			purge: () => set({ items: [] }),

			reset: () =>
				set({
					step: STEPS.ITEMS,
					items: [],
					method: null,
					detail: null,
					courier: null,
					schedule: null,
				}),

			validate: () => {
				const { items, detail, courier, method, schedule } = get();
				return bookDonationSchema.parse({
					items,
					detail,
					courier,
					method,
					schedule,
				});
			},
		}),
		{ name: 'book-donation-storage' }
	)
);
