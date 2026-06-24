import * as React from 'react';
import useSWR, { useSWRConfig } from 'swr';
import { toast } from 'sonner';
import { useNavigate, useParams } from 'react-router';

import axios from '@/libs/axios';
import {
	Heading,
	HeadingDescription,
	HeadingTitle,
} from '@/components/ui/heading';
import { Loading } from '@/components/loading';
import { Error } from '@/components/error';
import PaymentChannelForm from '@/components/payments/form-payment-channel';

const EditPaymentChannel = () => {
	const { id } = useParams();
	const { mutate } = useSWRConfig();
	const navigate = useNavigate();
	const [submitting, setSubmitting] = React.useState(false);

	const { data, error, isLoading } = useSWR('/payment-channels/' + id);

	const onSubmit = async (form) => {
		try {
			setSubmitting(true);
			await axios.put('/payment-channels/' + id, form, {
				headers: { 'Content-Type': 'multipart/form-data' },
			});
			toast('Channel pembayaran diperbarui');
			mutate('/payment-channels');
			navigate('/dashboard/payment-channels');
		} catch (err) {
			toast.error('Gagal memperbarui channel', {
				description: err.response?.data?.message || err.message,
			});
		} finally {
			setSubmitting(false);
		}
	};

	const initial = data?.data && {
		type: data.data.type,
		name: data.data.name,
		account_number: data.data.account_number || '',
		account_holder: data.data.account_holder || '',
		instructions: data.data.instructions || '',
		is_active: data.data.is_active ? 'true' : 'false',
		logo: data.data.logo || null,
	};

	return (
		<div className='grid gap-8'>
			<Heading>
				<HeadingTitle>Edit Channel Pembayaran</HeadingTitle>
				<HeadingDescription>
					Perbarui detail channel pembayaran donasi.
				</HeadingDescription>
			</Heading>

			<Error error={!isLoading && error} />
			<Loading loading={isLoading} />

			{initial && (
				<PaymentChannelForm
					initial={initial}
					action={onSubmit}
					label='Perbarui Channel'
					submitting={submitting}
				/>
			)}
		</div>
	);
};

export default EditPaymentChannel;
