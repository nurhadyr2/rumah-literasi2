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
import { ROLES } from '@/libs/constant';

const ShowDonation = () => {
	const { id } = useParams();
	const { user, loading: loading } = useAuth();

	const {
		error,
		data: result,
		isLoading: fetching,
	} = useSWR('/financial-donations/' + id);

	const allowed = React.useMemo(() => {
		if (loading) return false;
		return [ROLES.ADMIN, ROLES.SUPERADMIN].includes(user.role);
	}, [user, loading]);

	return (
		<div className='grid gap-8'>
			<Heading>
				<HeadingTitle>Detail Donasi Finansial</HeadingTitle>
				<HeadingDescription>
					Detail informasi donasi finansial untuk mendukung kegiatan literasi
					baca-tulis di Mraen Mimpi
				</HeadingDescription>
			</Heading>

			<Error error={!fetching && error} />
			<Loading loading={fetching} />

			{result && (
				<div className='grid gap-6 lg:grid-cols-2'>
					<div className='col-span-full'>
						<Label htmlFor='amount'>Amount</Label>
						<Input disabled type='number' defaultValue={result.data.amount} />
					</div>

					<div className='col-span-full'>
						<Label htmlFor='notes'>Notes</Label>
						<Textarea disabled type='text' defaultValue={result.data.notes} />
					</div>

					<div>
						<Label htmlFor='status'>Status</Label>
						<Input disabled type='text' defaultValue={result.data.status} />
					</div>

					<div className='col-span-full'>
						<Label htmlFor='acceptance-notes'>Acceptance Notes</Label>
						<Textarea
							disabled
							type='text'
							defaultValue={result.data.acceptance_notes}
						/>
					</div>

					<div className='col-span-full'>
						<div className='flex flex-wrap items-center gap-2'>
							<Link to='/dashboard/financial-donations'>
								<Button variant='outline'>
									<ArrowLeft className='size-4 sm:mr-2' />
									<span className='hidden sm:inline'>Back</span>
								</Button>
							</Link>

							{result.data.status === 'pending ' && (
								<Link
									to={result.data.payment_url}
									target='_blank'
									rel='noreferrer'>
									<Button variant='primary'>Complete Payment</Button>
								</Link>
							)}

							{allowed && (
								<Link
									to={
										'/dashboard/financial-donations/' + result.data.id + '/edit'
									}>
									<Button>Edit Donation</Button>
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
