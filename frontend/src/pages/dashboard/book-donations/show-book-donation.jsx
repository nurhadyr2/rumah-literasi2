import * as React from 'react';
import useSWR from 'swr';
import { Link, useParams } from 'react-router';
import { ArrowLeft } from 'lucide-react';

import { currency } from '@/libs/utils';
import { useAuth } from '@/hooks/use-auth';
import { ROLES } from '@/libs/constant';

import {
	Heading,
	HeadingDescription,
	HeadingSubtitle,
	HeadingTitle,
} from '@/components/ui/heading';
import { DonationItem } from '@/components/book-donations/donation-item-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Map } from '@/components/map';
import { Loading } from '@/components/loading';
import { Error } from '@/components/error';

const ShowBookDonation = () => {
	const { id } = useParams();
	const { user, loading } = useAuth();

	const {
		error,
		data: result,
		isLoading: fetching,
	} = useSWR('/book-donations/' + id);

	const allowed = React.useMemo(() => {
		if (loading) return false;
		return [ROLES.ADMIN, ROLES.SUPERADMIN].includes(user.role);
	}, [user, loading]);

	return (
		<div className='grid gap-8'>
			<Heading>
				<HeadingTitle>Detail Donasi Buku</HeadingTitle>
				<HeadingDescription>
					Lihat dan kelola detail donasi buku ini.
				</HeadingDescription>
			</Heading>

			<Error error={!fetching && error} />
			<Loading loading={fetching} />

			{result && (
				<>
					<HeadingSubtitle>Item Donasi</HeadingSubtitle>

					<div className='grid items-start grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5'>
						{result.data.book_donation_items.map((item) => (
							<div key={item.id} className='relative group'>
								<DonationItem item={item} />
							</div>
						))}
					</div>

					<HeadingSubtitle>Detail Donasi</HeadingSubtitle>

					<div className='grid gap-6 lg:grid-cols-2'>
						<div>
							<Label htmlFor='member'>Anggota</Label>
							<Input
								disabled
								type='text'
								defaultValue={result.data.user.name}
							/>
						</div>
						<div>
							<Label htmlFor='amount'>Estimasi Nilai</Label>
							<Input
								disabled
								type='text'
								defaultValue={currency(result.data.estimated_value)}
							/>
						</div>

						<div>
							<Label htmlFor='weight'>Total Berat</Label>
							<Input
								disabled
								type='text'
								defaultValue={result.data.weight + ' kg'}
							/>
						</div>

						<div>
							<Label htmlFor='length'>Panjang</Label>
							<Input
								disabled
								type='text'
								defaultValue={result.data.length + ' cm'}
							/>
						</div>

						<div>
							<Label htmlFor='width'>Lebar</Label>
							<Input
								disabled
								type='text'
								defaultValue={result.data.width + ' cm'}
							/>
						</div>

						<div>
							<Label htmlFor='height'>Tinggi</Label>
							<Input
								disabled
								type='text'
								defaultValue={result.data.height + ' cm'}
							/>
						</div>

						<div className='col-span-full'>
							<Label htmlFor='delivery_address'>Alamat Pengiriman</Label>
							<Input
								disabled
								type='text'
								defaultValue={result.data.address.name}
							/>
						</div>

						<div className='col-span-full'>
							<Label htmlFor='street_address'>Alamat Jalan</Label>
							<Textarea
								disabled
								defaultValue={result.data.address.street_address}
							/>
						</div>

						<div className='col-span-full'>
							<Label htmlFor='location'>Lokasi</Label>
							<Map
								location={{
									latitude: result.data.address.latitude,
									longitude: result.data.address.longitude,
								}}
								className='w-full aspect-banner'
								readonly
							/>
						</div>
					</div>

					<HeadingSubtitle>Informasi Kurir</HeadingSubtitle>

					<div className='grid gap-6 lg:grid-cols-2'>
						<div>
							<Label htmlFor='courier_code'>Perusahaan Kurir</Label>
							<Input
								disabled
								type='text'
								className='uppercase'
								defaultValue={result.data.courier_code}
							/>
						</div>

						<div>
							<Label htmlFor='courier_service_code'>Jenis Kurir</Label>
							<Input
								disabled
								type='text'
								className='uppercase'
								defaultValue={result.data.courier_service_code}
							/>
						</div>

						<div>
							<Label htmlFor='shipping_fee'>Biaya Pengiriman</Label>
							<Input
								disabled
								type='text'
								defaultValue={currency(result.data.shipping_fee)}
							/>
						</div>

						<div>
							<Label htmlFor='shipping_eta'>Estimasi Pengiriman</Label>
							<Input
								disabled
								type='text'
								defaultValue={result.data.shipping_eta}
							/>
						</div>
					</div>

					<HeadingSubtitle>Informasi Pelacakan</HeadingSubtitle>

					<div className='grid gap-6 lg:grid-cols-2'>
						<div>
							<Label htmlFor='order-id'>ID Pesanan</Label>
							<Input disabled type='text' defaultValue={result.data.order_id} />
						</div>
						<div>
							<Label htmlFor='tracking-id'>ID Pelacakan</Label>
							<Input
								disabled
								type='text'
								defaultValue={result.data.tracking_id}
							/>
						</div>
					</div>

					{result.data.tracking_id && (
						<div className='flex items-center gap-2 mt-4'>
							<Link
								to={`https://biteship.com/track/${result.data.tracking_id}`}
								target='_blank'
								rel='noreferrer'>
								<Button variant='outline'>Lihat Tracking di Biteship</Button>
							</Link>
						</div>
					)}

					<HeadingSubtitle>Manajemen Status</HeadingSubtitle>

					<div>
						<Label htmlFor='status'>Status Saat Ini</Label>
						<Input disabled type='text' defaultValue={result.data.status} />
					</div>

					<div className='col-span-full'>
						<Label htmlFor='acceptance-notes'>Catatan Penerimaan</Label>
						<Textarea
							disabled
							type='text'
							defaultValue={result.data.acceptance_notes}
						/>
					</div>

					<div className='col-span-full'>
						<div className='flex flex-wrap items-center gap-2'>
							<Link to='/dashboard/book-donations'>
								<Button variant='outline'>
									<ArrowLeft className='size-4 sm:mr-2' />
									<span className='hidden sm:inline'>Kembali</span>
								</Button>
							</Link>

							{result.data.status === 'pending ' && (
								<Link
									to={result.data.payment_url}
									target='_blank'
									rel='noreferrer'>
									<Button variant='primary'>Selesaikan Pembayaran</Button>
								</Link>
							)}

							{allowed && (
								<Link
									to={'/dashboard/book-donations/' + result.data.id + '/edit'}>
									<Button>Edit Donasi</Button>
								</Link>
							)}
						</div>
					</div>
				</>
			)}
		</div>
	);
};

export default ShowBookDonation;