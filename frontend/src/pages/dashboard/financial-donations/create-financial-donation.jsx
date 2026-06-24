import * as React from 'react';
import { toast } from 'sonner';
import { useSWRConfig } from 'swr';

import axios from '@/libs/axios';

import {
	Heading,
	HeadingDescription,
	HeadingTitle,
} from '@/components/ui/heading';

import FinancialDonationForm from '@/components/financial-donations/form-financial-donation';
import { useNavigate } from 'react-router';

const CreateDonation = () => {
	const { mutate } = useSWRConfig();
	const navigate = useNavigate();

	const onSubmit = async (data) => {
		try {
			const { data: result } = await axios.post('/financial-donations', data);
			toast('Donasi finansial dibuat', {
				description: 'Lanjutkan dengan memilih metode pembayaran.',
			});

			mutate('/financial-donations');
			navigate('/dashboard/financial-donations/' + result.data.id + '/pay');
		} catch (error) {
			toast.error('Failed to create donation', {
				description: error.response?.data?.message || error.message,
			});
			console.error(error);
		}
	};

	return (
		<div className='grid gap-8'>
			<Heading>
				<HeadingTitle>Create Donasi Finansial</HeadingTitle>
				<HeadingDescription>
					Buat donasi finansial untuk mendukung kegiatan literasi baca-tulis di Taman Mraen Mimpi. Donasi Anda akan digunakan untuk membeli buku, alat tulis, dan perlengkapan lainnya yang dibutuhkan untuk menjalankan program-program literasi kami. Terima kasih atas dukungan Anda!
				</HeadingDescription>
			</Heading>

			<FinancialDonationForm action={onSubmit} label='Create Donation' />
		</div>
	);
};

export default CreateDonation;
