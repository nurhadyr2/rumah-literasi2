import { useParams, useNavigate } from 'react-router';
import { useDonation } from '@/stores/use-donation';

import {
	Heading,
	HeadingDescription,
	HeadingTitle,
} from '@/components/ui/heading';

import DonationItemForm from '@/components/book-donations/donation-item-form';

const UpdateBook = () => {
	const { id } = useParams();
	const navigate = useNavigate();
	const { items, update } = useDonation();

	const onSubmit = async (data) => {
		try {
			update(Number(id), data);
			navigate('/dashboard/book-donations/create');
		} catch (error) {
			console.error(error);
		}
	};

	if (!id || !items.find((item) => item.id === Number(id))) {
		return <Navigate to='/dashboard/book-donations/create' />;
	}

	return (
		<div className='grid gap-8'>
			<Heading>
				<HeadingTitle>Edit Donasi Item</HeadingTitle>
				<HeadingDescription>
					Perbarui informasi item buku yang ingin didonasikan. Pastikan untuk mengisi informasi buku dengan lengkap dan akurat agar dapat membantu kami dalam proses distribusi buku kepada mereka yang membutuhkan.
				</HeadingDescription>
			</Heading>

			<DonationItemForm
				initial={items.find((item) => item.id === Number(id))}
				action={onSubmit}
				label='Update Item'
			/>
		</div>
	);
};

export default UpdateBook;
