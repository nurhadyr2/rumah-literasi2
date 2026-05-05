import * as React from 'react';
import useSWR from 'swr';
import { Link, useParams } from 'react-router';
import {
	ArrowLeft,
	Truck,
	MapPin,
	CalendarDays,
	Clock,
	ExternalLink,
} from 'lucide-react';

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
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Map } from '@/components/map';
import { Loading } from '@/components/loading';
import { Error } from '@/components/error';

const statusVariant = (status) => {
	const s = (status || '').toLowerCase();
	if (s === 'success') return 'success';
	if (s === 'failed' || s === 'expired') return 'destructive';
	return 'outline';
};

const DeliveryMethodSection = ({ donation }) => {
	const isPickup = donation.method === 'pickup';

	return (
		<div>
			<HeadingSubtitle className='mb-4'>
				Metode & Jadwal Pengiriman
			</HeadingSubtitle>

			<div className='border border-zinc-200 rounded-2xl overflow-hidden'>
				<div className='flex items-center gap-3 px-4 py-3 bg-zinc-50 border-b border-zinc-100'>
					{isPickup ? (
						<Truck className='size-4 text-primary-500 flex-none' />
					) : (
						<MapPin className='size-4 text-primary-500 flex-none' />
					)}
					<span className='font-semibold text-sm'>
						{isPickup ? 'Pickup' : 'Drop Off'}
					</span>
					<Badge variant='primary' className='ml-auto text-xs'>
						{isPickup ? 'Kurir datang ke lokasi' : 'Antar ke titik drop off'}
					</Badge>
				</div>

				<div className='p-4 grid gap-3 text-sm'>
					{isPickup ? (
						<>
							{donation.pickup_date && (
								<div className='flex items-center gap-2 text-zinc-600'>
									<CalendarDays className='size-4 text-primary-400 flex-none' />
									<span className='font-medium text-zinc-800 w-28'>
										Tanggal Pickup
									</span>
									<span>{donation.pickup_date}</span>
								</div>
							)}
							{donation.pickup_time_slot && (
								<div className='flex items-center gap-2 text-zinc-600'>
									<Clock className='size-4 text-primary-400 flex-none' />
									<span className='font-medium text-zinc-800 w-28'>Waktu</span>
									<span>{donation.pickup_time_slot.replace('-', ' – ')}</span>
								</div>
							)}
							{donation.pickup_note && (
								<div className='flex items-start gap-2 text-zinc-600'>
									<span className='font-medium text-zinc-800 w-28 flex-none'>
										Catatan Kurir
									</span>
									<span>{donation.pickup_note}</span>
								</div>
							)}
						</>
					) : (
						<>
							{donation.dropoff_point_name && (
								<div className='flex items-start gap-2 text-zinc-600'>
									<MapPin className='size-4 text-primary-400 flex-none mt-0.5' />
									<div>
										<p className='font-medium text-zinc-800'>
											{donation.dropoff_point_name}
										</p>
										{donation.dropoff_point_address && (
											<p className='text-zinc-500 text-xs mt-0.5'>
												{donation.dropoff_point_address}
											</p>
										)}
									</div>
								</div>
							)}
						</>
					)}
				</div>
			</div>
		</div>
	);
};

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
					<div className='flex items-center gap-3'>
						<Badge variant={statusVariant(result.data.status)}>
							{result.data.status}
						</Badge>
						{result.data.tracking_id && (
							<a
								href={`https://biteship.com/track/${result.data.tracking_id}`}
								target='_blank'
								rel='noreferrer'
								className='flex items-center gap-1 text-xs text-primary-500 hover:underline'>
								<ExternalLink className='size-3' />
								Lacak di Biteship
							</a>
						)}
					</div>

					<div>
						<HeadingSubtitle className='mb-4'>Item Donasi</HeadingSubtitle>
						<div className='grid items-start grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5'>
							{result.data.book_donation_items.map((item) => (
								<DonationItem key={item.id} item={item} />
							))}
						</div>
					</div>

					{result.data.method && (
						<DeliveryMethodSection donation={result.data} />
					)}

					<div>
						<HeadingSubtitle className='mb-4'>Detail Paket</HeadingSubtitle>
						<div className='grid gap-4 lg:grid-cols-2'>
							<div>
								<Label>Anggota</Label>
								<Input disabled defaultValue={result.data.user.name} />
							</div>
							<div>
								<Label>Estimasi Nilai</Label>
								<Input
									disabled
									defaultValue={currency(result.data.estimated_value)}
								/>
							</div>
							<div>
								<Label>Berat</Label>
								<Input disabled defaultValue={result.data.weight + ' kg'} />
							</div>
							<div>
								<Label>Panjang</Label>
								<Input disabled defaultValue={result.data.length + ' cm'} />
							</div>
							<div>
								<Label>Lebar</Label>
								<Input disabled defaultValue={result.data.width + ' cm'} />
							</div>
							<div>
								<Label>Tinggi</Label>
								<Input disabled defaultValue={result.data.height + ' cm'} />
							</div>
							<div className='col-span-full'>
								<Label>Alamat Pengiriman</Label>
								<Input disabled defaultValue={result.data.address?.name} />
							</div>
							<div className='col-span-full'>
								<Label>Alamat Jalan</Label>
								<Textarea
									disabled
									defaultValue={result.data.address?.street_address}
								/>
							</div>
							{result.data.address && (
								<div className='col-span-full'>
									<Label>Lokasi</Label>
									<Map
										location={{
											latitude: result.data.address.latitude,
											longitude: result.data.address.longitude,
										}}
										className='w-full aspect-banner'
										readonly
									/>
								</div>
							)}
						</div>
					</div>

					<div>
						<HeadingSubtitle className='mb-4'>Informasi Kurir</HeadingSubtitle>
						<div className='grid gap-4 lg:grid-cols-2'>
							<div>
								<Label>Perusahaan Kurir</Label>
								<Input
									disabled
									className='uppercase'
									defaultValue={result.data.courier_code}
								/>
							</div>
							<div>
								<Label>Jenis Kurir</Label>
								<Input
									disabled
									className='uppercase'
									defaultValue={result.data.courier_service_code}
								/>
							</div>
							<div>
								<Label>Biaya Pengiriman</Label>
								<Input
									disabled
									defaultValue={currency(result.data.shipping_fee)}
								/>
							</div>
							<div>
								<Label>Estimasi Pengiriman</Label>
								<Input disabled defaultValue={result.data.shipping_eta} />
							</div>
						</div>
					</div>

					<div>
						<HeadingSubtitle className='mb-4'>
							Informasi Pelacakan
						</HeadingSubtitle>
						<div className='grid gap-4 lg:grid-cols-2'>
							<div>
								<Label>ID Pesanan</Label>
								<Input disabled defaultValue={result.data.order_id || '—'} />
							</div>
							<div>
								<Label>ID Pelacakan</Label>
								<Input disabled defaultValue={result.data.tracking_id || '—'} />
							</div>
						</div>
					</div>

					<div>
						<HeadingSubtitle className='mb-4'>Manajemen Status</HeadingSubtitle>
						<div className='grid gap-4'>
							<div>
								<Label>Status Saat Ini</Label>
								<Input disabled defaultValue={result.data.status} />
							</div>
							{result.data.acceptance_notes && (
								<div>
									<Label>Catatan Penerimaan</Label>
									<Textarea
										disabled
										defaultValue={result.data.acceptance_notes}
									/>
								</div>
							)}
						</div>
					</div>

					<div className='flex flex-wrap items-center gap-2'>
						<Link to='/dashboard/book-donations'>
							<Button variant='outline'>
								<ArrowLeft className='size-4 mr-2' />
								Kembali
							</Button>
						</Link>

						{result.data.status === 'Pending' && result.data.payment_url && (
							<a
								href={result.data.payment_url}
								target='_blank'
								rel='noreferrer'>
								<Button>Selesaikan Pembayaran</Button>
							</a>
						)}

						{allowed && (
							<Link
								to={'/dashboard/book-donations/' + result.data.id + '/edit'}>
								<Button variant='outline'>Edit Donasi</Button>
							</Link>
						)}
					</div>
				</>
			)}
		</div>
	);
};

export default ShowBookDonation;
