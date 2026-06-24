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
import PaymentChannelForm from '@/components/payments/form-payment-channel';

const CreatePaymentChannel = () => {
	const { mutate } = useSWRConfig();
	const navigate = useNavigate();
	const [submitting, setSubmitting] = React.useState(false);

	const onSubmit = async (form) => {
		try {
			setSubmitting(true);
			await axios.post('/payment-channels', form, {
				headers: { 'Content-Type': 'multipart/form-data' },
			});
			toast('Channel pembayaran dibuat');
			mutate('/payment-channels');
			navigate('/dashboard/payment-channels');
		} catch (err) {
			toast.error('Gagal membuat channel', {
				description: err.response?.data?.message || err.message,
			});
		} finally {
			setSubmitting(false);
		}
	};

	return (
		<div className='grid gap-8'>
			<Heading>
				<HeadingTitle>Tambah Channel Pembayaran</HeadingTitle>
				<HeadingDescription>
					Tambahkan bank atau e-wallet tujuan pembayaran donasi.
				</HeadingDescription>
			</Heading>

			<PaymentChannelForm
				action={onSubmit}
				label='Simpan Channel'
				submitting={submitting}
			/>
		</div>
	);
};

export default CreatePaymentChannel;
