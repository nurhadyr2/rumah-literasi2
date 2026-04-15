import * as React from 'react';
import { toast } from 'sonner';
import { useSWRConfig } from 'swr';
import { useNavigate } from 'react-router';

import axios from '@/libs/axios';

import {
	Heading,
	HeadingDescription,
	HeadingTitle,
} from '@/components/ui/heading';

import AddressForm from '@/components/addresses/form-address';

const CreateAddress = () => {
	const navigate = useNavigate();
	const { mutate } = useSWRConfig();

	const onSubmit = async (data) => {
		try {
			await axios.post('/addresses', data, {
				headers: { 'Content-Type': 'application/json' },
			});
			toast('Alamat berhasil dibuat', {
				description: 'Alamat berhasil ditambahkan',
			});

			mutate('/addresses');
			navigate('/dashboard/addresses');
		} catch (error) {
			toast.error('Gagal membuat alamat', {
				description: error.response?.data?.message || error.message,
			});
			console.error(error);
		}
	};

	return (
		<div className='grid gap-8'>
			<Heading>
				<HeadingTitle>Buat Alamat</HeadingTitle>
				<HeadingDescription>
					Tambahkan alamat baru ke profil Anda dengan nama (seperti Rumah,
					Kantor, dll.) untuk donasi buku dan aktivitas lainnya.
				</HeadingDescription>
			</Heading>

			<AddressForm action={onSubmit} label='Buat Alamat' />
		</div>
	);
};

export default CreateAddress;