import { Store } from 'lucide-react';

import {
	Gift,
	MapPin,
	UsersRound,
	Phone,
	Instagram,
	Facebook,
	HeartHandshake,
	Bolt,
	Calendar,
	Twitter,
	Mail,
	Globe,
	Home,
} from 'lucide-react';

export const ROLES = {
	GUEST: 'Guest',
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
		label: 'General',
		submenus: [
			{
				href: '/dashboard',
				label: 'Dashboard',
				icon: Home,
				roles: null,
			},
			{
				href: '/dashboard/events',
				label: 'Manage Events',
				icon: Calendar,
				roles: [ROLES.ADMIN, ROLES.SUPERADMIN],
			},
			{
				href: '/dashboard/book-donations',
				label: 'Book Donation',
				icon: Gift,
				roles: [ROLES.GUEST, ROLES.ADMIN,, ROLES.SUPERADMIN],
			},
			{
				href: '/dashboard/financial-donations',
				label: 'Financial Donations',
				icon: HeartHandshake,
				roles: [ROLES.GUEST, ROLES.ADMIN, ROLES.SUPERADMIN],
			},
		],
	},
	{
		id: 'configuration',
		label: 'Configuration',
		submenus: [
			{
				href: '/dashboard/members',
				label: 'Members',
				icon: UsersRound,
				roles: [ROLES.SUPERADMIN],
			},
			{
				href: '/dashboard/addresses',
				label: 'Addresses',
				icon: MapPin,
				roles: [ROLES.GUEST, ROLES.SUPERADMIN],
			},
			{
				href: '/dashboard/merchant',
				label: 'Merchant',
				icon: Store,
				roles: [ROLES.ADMIN, ROLES.SUPERADMIN],
			},
			{
				href: '/dashboard/logs',
				label: 'Logs',
				icon: Bolt,
				roles: [ROLES.ADMIN, ROLES.SUPERADMIN],
			},
		],
	},
];

export const WIDGET_NAV = [
	{
		href: '/',
		label: 'Home',
	},

	{
		href: '/about',
		label: 'About Us',
	},
	{
		href: '/contact',
		label: 'Contact and Support',
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
		icon: Facebook,
	},
];

export const ERROR_MESSAGES = {
	401: 'You are not authenticated, please login to access this resource',
	403: 'You are not authorized to access this resource',
	404: 'Resource not found, please try again later',
	429: 'You have exceeded the rate limit, try again later',
	500: 'Internal server error, try again later',
};

export const PAYMENT_STATUS = {
	PENDING: 'Pending',
	SUCCESS: 'Success',
	FAILED: 'Failed',
};

export const DEFAULT_LOCATION = {
	latitude: -6.1741855,
	longitude: 106.8283465,
};
