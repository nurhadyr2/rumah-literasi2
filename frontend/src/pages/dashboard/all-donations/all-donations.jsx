import { Link } from 'react-router';
import { HeartHandshake, Gift } from 'lucide-react';

import { Card } from '@/components/card';
import {
	Heading,
	HeadingDescription,
	HeadingTitle,
} from '@/components/ui/heading';

const AllDonations = () => {
	const menus = [
		{
			href: '/dashboard/all-donations/financial',
			title: 'Donasi Finansial',
			icon: HeartHandshake,
			description: 'Daftar lengkap donasi uang dan ekspor ke Excel.',
		},
		{
			href: '/dashboard/all-donations/book',
			title: 'Donasi Buku',
			icon: Gift,
			description:
				'Daftar lengkap donasi buku beserta item dan ekspor ke Excel.',
		},
	];

	return (
		<div className='grid gap-8'>
			<Heading>
				<HeadingTitle>Semua Donasi</HeadingTitle>
				<HeadingDescription>
					Pilih jenis donasi yang ingin dilihat dan diekspor.
				</HeadingDescription>
			</Heading>

			<div className='grid gap-6 lg:grid-cols-2'>
				{menus.map((menu) => (
					<Link key={menu.href} to={menu.href}>
						<Card
							content={{
								icon: menu.icon,
								title: menu.title,
								description: menu.description,
							}}
						/>
					</Link>
				))}
			</div>
		</div>
	);
};

export default AllDonations;
