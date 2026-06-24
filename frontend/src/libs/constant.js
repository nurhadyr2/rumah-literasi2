import { ClipboardList, Store, Landmark } from 'lucide-react';

import {
	Gift,
	MapPin,
	UsersRound,
	Phone,
	Instagram,
	Music2,
	HeartHandshake,
	Bolt,
	Calendar,
	Twitter,
	Mail,
	Globe,
	Home,
	LayoutList,
} from 'lucide-react';

export const ROLES = {
	DONATUR: 'Donatur',
	ADMIN: 'Admin',
	SUPERADMIN: 'Superadmin',
};

export const STEPS = {
	ITEMS: 0,
	DETAIL: 1,
	COURIER: 2,
	REVIEW: 3,
};

export const SIDEBAR_MENUS = [
	{
		id: 'general',
		label: 'Umum',
		submenus: [
			{
				href: '/dashboard',
				label: 'Dashboard',
				icon: Home,
				roles: null,
			},
			{
				href: '/dashboard/events',
				label: 'Kelola Event',
				icon: Calendar,
				roles: [ROLES.ADMIN, ROLES.SUPERADMIN],
			},
			{
				href: '/dashboard/book-donations',
				label: 'Donasi Buku',
				icon: Gift,
				roles: [ROLES.DONATUR, ROLES.ADMIN, ROLES.SUPERADMIN],
			},
			{
				href: '/dashboard/financial-donations',
				label: 'Donasi Finansial',
				icon: HeartHandshake,
				roles: [ROLES.DONATUR, ROLES.ADMIN, ROLES.SUPERADMIN],
			},
			{
				href: '/dashboard/all-donations',
				label: 'Semua Donasi',
				icon: ClipboardList,
				roles: [ROLES.ADMIN, ROLES.SUPERADMIN],
			},
		],
	},
	{
		id: 'configuration',
		label: 'Konfigurasi',
		submenus: [
			{
				href: '/dashboard/members',
				label: 'Anggota',
				icon: UsersRound,
				roles: [ROLES.SUPERADMIN],
			},
			{
				href: '/dashboard/addresses',
				label: 'Alamat',
				icon: MapPin,
				roles: [ROLES.DONATUR, ROLES.ADMIN, ROLES.SUPERADMIN],
			},
			{
				href: '/dashboard/merchant',
				label: 'Merchant',
				icon: Store,
				roles: [ROLES.ADMIN, ROLES.SUPERADMIN],
			},
			{
				href: '/dashboard/payment-channels',
				label: 'Channel Pembayaran',
				icon: Landmark,
				roles: [ROLES.SUPERADMIN],
			},
			{
				href: '/dashboard/logs',
				label: 'Log Sistem',
				icon: Bolt,
				roles: [ROLES.ADMIN, ROLES.SUPERADMIN],
			},
		],
	},
];

export const WIDGET_NAV = [
	{
		href: '/',
		label: 'Beranda',
	},
	{
		href: '/about',
		label: 'Tentang Kami',
	},
	{
		href: '/contact',
		label: 'Kontak & Bantuan',
	},
];

export const WIDGET_CONTACT = [
	{
		href: 'https://mraenmimpi.com',
		label: 'mraenmimpi.com',
		icon: Globe,
	},
	{
		href: 'tel:+6285755478336',
		label: '+6285755478336',
		icon: Phone,
	},
	{
		href: 'mailto:mraenmimpi.com@gmail.com',
		label: 'mraenmimpi@gmail.com',
		icon: Mail,
	},
];

export const WIDGET_SOCIAL = [
	{
		href: 'https://instagram.com/MraenMimpi',
		label: '@MraenMimpi',
		icon: Instagram,
	},
	{
		href: 'https://twitter.com/MraenMimpi?t=AWguXhdAm1dMg_8EvKn-1g&s=09',
		label: '@MraenMimpi',
		icon: Twitter,
	},
	{
		href: 'https://www.tiktok.com/@mraenmimpi',
		label: 'Mraen Mimpi',
		icon: Music2,
	},
];

export const ERROR_MESSAGES = {
	401: 'Anda belum login, silakan login terlebih dahulu',
	403: 'Anda tidak memiliki izin untuk mengakses sumber ini',
	404: 'Data tidak ditemukan',
	429: 'Terlalu banyak permintaan, coba lagi nanti',
	500: 'Terjadi kesalahan server, coba lagi nanti',
};

export const PAYMENT_STATUS = {
	PENDING: 'Pending',
	WAITING_VERIFICATION: 'WaitingVerification',
	SUCCESS: 'Success',
	FAILED: 'Failed',
};

export const PAYMENT_STATUS_LABELS = {
	Pending: 'Menunggu Pembayaran',
	WaitingVerification: 'Menunggu Verifikasi',
	Success: 'Berhasil',
	Failed: 'Gagal',
};

export const DEFAULT_LOCATION = {
	latitude: -6.1741855,
	longitude: 106.8283465,
};
