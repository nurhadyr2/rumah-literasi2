// ============================================================
// show-financial-donation.jsx
// ============================================================
import * as React from 'react';
import useSWR from 'swr';
import { Link, useParams } from 'react-router';
import { ArrowLeft } from 'lucide-react';

import {
	Heading,
	HeadingDescription,
	HeadingTitle,
} from '@/components/ui/heading';

import { Loading } from '@/components/loading';
import { Error } from '@/components/error';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import { ROLES, PAYMENT_STATUS, PAYMENT_STATUS_LABELS } from '@/libs/constant';
import PaymentProofActions from '@/components/payments/payment-proof-actions';

const ShowDonation = () => {
	const { id } = useParams();
	const { user, loading: loading } = useAuth();

	const {
		error,
		data: result,
		isLoading: fetching,
		mutate,
	} = useSWR('/financial-donations/' + id);

	const allowed = React.useMemo(() => {
		if (loading) return false;
		return [ROLES.ADMIN, ROLES.SUPERADMIN].includes(user.role);
	}, [user, loading]);

	const isOwner = !loading && user?.id === result?.data?.user_id;

	return (
		<div className='grid gap-8'>
			<Heading>
				<HeadingTitle>Detail Donasi Finansial</HeadingTitle>
				<HeadingDescription>
					Lihat detail informasi donasi finansial untuk mendukung kegiatan literasi baca-tulis di Taman Mraen Mimpi.
				</HeadingDescription>
			</Heading>

			<Error error={!fetching && error} />
			<Loading loading={fetching} />

			{result && (
				<div className='grid gap-6 lg:grid-cols-2'>
					<div className='col-span-full'>
						<Label htmlFor='amount'>Jumlah</Label>
						<Input disabled type='number' defaultValue={result.data.amount} />
					</div>

					<div className='col-span-full'>
						<Label htmlFor='notes'>Catatan</Label>
						<Textarea disabled defaultValue={result.data.notes} />
					</div>

					<div>
						<Label htmlFor='status'>Status</Label>
						<Input
							disabled
							type='text'
							defaultValue={
								PAYMENT_STATUS_LABELS[result.data.status] || result.data.status
							}
						/>
					</div>

					<div className='col-span-full'>
						<Label htmlFor='acceptance-notes'>Catatan Penerimaan</Label>
						<Textarea
							disabled
							defaultValue={result.data.acceptance_notes}
						/>
					</div>

					<PaymentProofActions
						type='financial'
						donation={result.data}
						isAdmin={allowed}
						onDone={mutate}
					/>

					<div className='col-span-full'>
						<div className='flex flex-wrap items-center gap-2'>
							<Link to='/dashboard/financial-donations'>
								<Button variant='outline'>
									<ArrowLeft className='size-4 sm:mr-2' />
									<span className='hidden sm:inline'>Kembali</span>
								</Button>
							</Link>

							{isOwner && result.data.status === PAYMENT_STATUS.PENDING && (
								<Link to={'/dashboard/financial-donations/' + result.data.id + '/pay'}>
									<Button variant='primary'>Selesaikan Pembayaran</Button>
								</Link>
							)}

							{allowed && (
								<Link
									to={
										'/dashboard/financial-donations/' + result.data.id + '/edit'
									}>
									<Button>Edit Donasi</Button>
								</Link>
							)}
						</div>
					</div>
				</div>
			)}
		</div>
	);
};

export default ShowDonation;