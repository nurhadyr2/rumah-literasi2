import { useNavigate } from 'react-router';
import { useDonation } from '@/stores/use-donation';

import {
	Heading,
	HeadingDescription,
	HeadingTitle,
} from '@/components/ui/heading';

import DonationItemForm from '@/components/book-donations/donation-item-form';

const AppendItem = () => {
	const { append } = useDonation();
	const navigate = useNavigate();

	const onSubmit = async (data) => {
		try {
			append(data);
			navigate('/dashboard/book-donations/create');
		} catch (error) {
			console.error(error);
		}
	};

	return (
		<div className='grid gap-8'>
			<Heading>
				<HeadingTitle>Tambah Donasi Item</HeadingTitle>
				<HeadingDescription>
					Tambahkan item buku yang ingin didonasikan ke dalam daftar donasi Anda. Pastikan untuk mengisi informasi buku dengan lengkap dan akurat agar dapat membantu kami dalam proses distribusi buku kepada mereka yang membutuhkan.
				</HeadingDescription>
			</Heading>

			<DonationItemForm action={onSubmit} label='Append Item' />
		</div>
	);
};

export default AppendItem;
