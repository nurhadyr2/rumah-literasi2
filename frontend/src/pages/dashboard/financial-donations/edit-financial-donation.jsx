import * as React from 'react';
import { toast } from 'sonner';
import useSWR, { useSWRConfig } from 'swr';
import { useParams, useNavigate } from 'react-router';

import axios from '@/libs/axios';

import {
	Heading,
	HeadingDescription,
	HeadingTitle,
} from '@/components/ui/heading';
import FinancialDonationForm from '@/components/financial-donations/form-financial-donation';
import { Loading } from '@/components/loading';
import { Error } from '@/components/error';

const EditDonation = () => {
	const { id } = useParams();
	const navigate = useNavigate();
	const { mutate } = useSWRConfig();

	const {
		error,
		data: result,
		isLoading: loading,
	} = useSWR('/financial-donations/' + id);

	const onSubmit = async (data) => {
		try {
			await axios.put('/financial-donations/' + result.data.id, data);
			toast('Financial donation updated', {
				description: 'Successfully updated donation',
			});

			mutate('/financial-donations');
			mutate('/financial-donations/' + id);
			navigate('/dashboard/financial-donations/');
		} catch (error) {
			toast.error('Failed to update donation', {
				description: error.response?.data?.message || error.message,
			});
			console.error(error);
		}
	};

	return (
		<div className='grid gap-8'>
			<Heading>
				<HeadingTitle>Edit Donasi Finansial</HeadingTitle>
				<HeadingDescription>
					Perbarui informasi donasi finansial untuk mendukung kegiatan literasi baca-tulis di Mraen Mimpi
				</HeadingDescription>
			</Heading>

			<Error error={!loading && error} />
			<Loading loading={loading} />

			{result && (
				<FinancialDonationForm
					initial={result.data}
					action={onSubmit}
					label='Update Donation'
				/>
			)}
		</div>
	);
};

export default EditDonation;
