import { Card } from '@/components/card';
import {
	Heading,
	HeadingDescription,
	HeadingTitle,
} from '@/components/ui/heading';
import { HeartHandshake, Gift, ClipboardList } from 'lucide-react';
import { Link } from 'react-router';

const Dashboard = () => {
	const menus = [
		{
			href: '/dashboard/financial-donations',
			title: 'Donasi Finansial',
			icon: HeartHandshake,
			description:
				'Lacak dan kelola donasi finansial yang diproses melalui payment gateway.',
		},
		{
			href: '/dashboard/book-donations',
			title: 'Donasi Buku',
			icon: Gift,
			description:
				'Pantau donasi buku, verifikasi data, dan kelola distribusinya.',
		},
		{
			href: '/dashboard/all-donations',
			title: 'Semua Donasi',
			icon: ClipboardList,
			description: 'Pantau semua aktivitas Donasi dan kelola datanya.',
		},
	];

	return (
		<div className='grid gap-8'>
			<Heading>
				<HeadingTitle>Dashboard</HeadingTitle>
				<HeadingDescription>
					Selamat datang di dashboard. Di sini Anda dapat mengelola donasi dan
					memantau dampaknya terhadap program literasi di Taman Mraen Mimpi.
				</HeadingDescription>
			</Heading>

			<div className='grid gap-6 lg:grid-cols-3'>
				{menus.map((menu) => {
					return (
						<Link key={menu.href} to={menu.href}>
							<Card
								content={{
									icon: menu.icon,
									title: menu.title,
									description: menu.description,
								}}
							/>
						</Link>
					);
				})}
			</div>
		</div>
	);
};

export default Dashboard;
