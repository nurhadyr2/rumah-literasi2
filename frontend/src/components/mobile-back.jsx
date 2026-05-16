import * as React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router';

const ROUTE_TITLES = {
	'/dashboard': 'Dashboard',
	'/dashboard/members': 'Members',
	'/dashboard/members/create': 'Create Member',
	'/dashboard/events': 'Events',
	'/dashboard/events/create': 'Create Event',
	'/dashboard/book-donations': 'Donasi Buku',
	'/dashboard/book-donations/create': 'Buat Donasi Buku',
	'/dashboard/book-donations/create/append': 'Tambah Buku',
	'/dashboard/financial-donations': 'Donasi Finansial',
	'/dashboard/financial-donations/create': 'Buat Donasi',
	'/dashboard/all-donations': 'Semua Donasi',
	'/dashboard/addresses': 'Alamat',
	'/dashboard/addresses/create': 'Tambah Alamat',
	'/dashboard/merchant': 'Merchant',
	'/dashboard/merchant/edit': 'Edit Merchant',
	'/dashboard/logs': 'Log Sistem',
	'/dashboard/profile': 'Profil',
	'/about': 'Tentang Kami',
	'/contact': 'Kontak',
	'/events': 'Acara',
	'/auth/signin': 'Masuk',
	'/auth/signup': 'Daftar',
	'/auth/otp': 'Verifikasi',
	'/auth/forgot-password': 'Lupa Password',
	'/auth/reset-password': 'Reset Password',
};

const DYNAMIC_PATTERNS = [
	{ pattern: /^\/dashboard\/members\/[^/]+\/edit$/, title: 'Edit Member' },
	{ pattern: /^\/dashboard\/events\/[^/]+\/edit$/, title: 'Edit Event' },
	{ pattern: /^\/dashboard\/events\/[^/]+$/, title: 'Detail Event' },
	{
		pattern: /^\/dashboard\/book-donations\/[^/]+\/edit$/,
		title: 'Edit Donasi Buku',
	},
	{
		pattern: /^\/dashboard\/book-donations\/create\/[^/]+\/edit$/,
		title: 'Edit Item Buku',
	},
	{
		pattern: /^\/dashboard\/book-donations\/[^/]+$/,
		title: 'Detail Donasi Buku',
	},
	{
		pattern: /^\/dashboard\/financial-donations\/[^/]+\/edit$/,
		title: 'Edit Donasi',
	},
	{
		pattern: /^\/dashboard\/financial-donations\/[^/]+$/,
		title: 'Detail Donasi',
	},
	{ pattern: /^\/dashboard\/addresses\/[^/]+\/edit$/, title: 'Edit Alamat' },
	{ pattern: /^\/dashboard\/addresses\/[^/]+$/, title: 'Detail Alamat' },
	{ pattern: /^\/dashboard\/logs\/[^/]+$/, title: 'Detail Log' },
	{ pattern: /^\/events\/[^/]+$/, title: 'Detail Acara' },
];

const getTitle = (pathname) => {
	if (ROUTE_TITLES[pathname]) return ROUTE_TITLES[pathname];
	for (const { pattern, title } of DYNAMIC_PATTERNS) {
		if (pattern.test(pathname)) return title;
	}
	return null;
};

const HIDE_BACK = [
	'/dashboard',
	'/dashboard/book-donations',
	'/dashboard/financial-donations',
	'/dashboard/all-donations',
	'/dashboard/addresses',
	'/dashboard/members',
	'/dashboard/events',
	'/dashboard/logs',
	'/dashboard/merchant',
	'/dashboard/profile',
	'/events',
	'/about',
	'/contact',
];

const MobileHeader = () => {
	const navigate = useNavigate();
	const location = useLocation();
	const pathname = location.pathname;
	const title = getTitle(pathname);

	if (!title) return null;

	const showBack = !HIDE_BACK.includes(pathname);

	return (
		<div className='sticky top-16 z-40 flex items-center justify-center px-4 py-3 bg-white border-b sm:hidden'>
			{showBack && (
				<button
					onClick={() => navigate(-1)}
					className='absolute left-4 flex items-center justify-center size-8 rounded-full hover:bg-zinc-100 transition-colors'>
					<ArrowLeft className='size-5' />
				</button>
			)}
			<span className='font-semibold text-sm'>{title}</span>
		</div>
	);
};

export { MobileHeader };
