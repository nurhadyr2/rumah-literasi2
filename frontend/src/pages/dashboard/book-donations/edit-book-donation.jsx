import { toast } from 'sonner';
import useSWR, { useSWRConfig } from 'swr';
import { useParams, useNavigate } from 'react-router';

import axios from '@/libs/axios';

import {
	Heading,
	HeadingDescription,
	HeadingTitle,
} from '@/components/ui/heading';
import { Loading } from '@/components/loading';
import { Error } from '@/components/error';
import BookDonationForm from '@/components/book-donations/form-book-donation';

const EditBookDonationMain = () => {
	const { id } = useParams();
	const navigate = useNavigate();
	const { mutate } = useSWRConfig();

	const {
		error,
		data: result,
		isLoading: loading,
	} = useSWR('/book-donations/' + id);

	const onSubmit = async (data) => {
		try {
			await axios.put('/book-donations/' + result.data.id, data);
			toast('Book donation updated', {
				description: 'Successfully updated book donation',
			});

			mutate('/book-donations');
			mutate('/book-donations/' + id);
			navigate('/dashboard/book-donations/');
		} catch (error) {
			toast.error('Failed to update book donation', {
				description: error.response?.data?.message || error.message,
			});
			console.error(error);
		}
	};

	return (
		<div className='grid gap-8'>
			<Heading>
				<HeadingTitle>Edit Donasi Buku</HeadingTitle>
				<HeadingDescription>
					Perbarui status donasi buku ini.
				</HeadingDescription>
			</Heading>

			<Error error={!loading && error} />
			<Loading loading={loading} />

			{result && (
				<BookDonationForm
					initial={result.data}
					action={onSubmit}
					label='Update Status'
				/>
			)}
		</div>
	);
};

export default EditBookDonationMain;
