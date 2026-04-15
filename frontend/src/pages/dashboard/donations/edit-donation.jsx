import * as React from 'react';

import useSWR from 'swr';
import { toast } from 'sonner';
import { useParams, useNavigate } from 'react-router';

import axios from '@/libs/axios';

import {
	Heading,
	HeadingDescription,
	HeadingTitle,
} from '@/components/ui/heading';

import DonationForm from '@/components/donations/form-donation';
import { Loading } from '@/components/loading';
import { Error } from '@/components/error';

const EditDonation = () => {
	const { id } = useParams();
	const navigate = useNavigate();

	const {
		error,
		mutate,
		data: result,
		isLoading: loading,
	} = useSWR('/donations/' + id);

	const onSubmit = async (data) => {
		try {
			await axios.put('/donations/' + result.data.id, data);

			toast('Donation updated', {
				description: 'Successfully updated donation',
			});

			mutate();
			navigate('/dashboard/donations');
		} catch (error) {
			toast.error('Failed to update donation', {
				description: error.response.data.message || error.message,
			});
			console.error(error);
		}
	};

	return (
		<div className='grid gap-8'>
			<Heading>
				<HeadingTitle>Edit Donasi</HeadingTitle>
				<HeadingDescription>
					Perbarui informasi donasi finansial untuk mendukung kegiatan literasi baca-tulis di Taman Mraen Mimpi
				</HeadingDescription>
			</Heading>

			<Error error={!loading && error} />
			<Loading loading={loading} />

			{result && (
				<DonationForm
					initial={result.data}
					action={onSubmit}
					label='Update Donation'
				/>
			)}
		</div>
	);
};

export default EditDonation;
