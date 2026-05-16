import * as React from 'react';
import useSWR, { useSWRConfig } from 'swr';
import { toast } from 'sonner';
import { useNavigate } from 'react-router';
import { ArrowLeft, Truck, MapPin, CalendarDays, Clock } from 'lucide-react';

import axios from '@/libs/axios';
import { animate, currency } from '@/libs/utils';
import { bookDonationSchema } from '@/libs/schemas';
import { useDonation, STEPS, DELIVERY_METHODS } from '@/stores/use-donation';
import { useConfirm } from '@/hooks/use-confirm';

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
import { Badge } from '@/components/ui/badge';

const displayWeight = (weight) => {
	if (!weight && weight !== 0) return '—';
	return `${Number(weight)} gram`;
};

const ReviewBookDonation = () => {
	const navigate = useNavigate();
	const { confirm } = useConfirm();
	const { mutate } = useSWRConfig();
	const [loading, setLoading] = React.useState(false);

	const { items, detail, courier, method, schedule, reset, route } =
		useDonation();

	const {
		data: selected,
		error: selectedError,
		isLoading: selectedLoading,
	} = useSWR('/addresses/' + detail?.address_id);

	const onSubmit = async () => {
		try {
			bookDonationSchema.parse({ items, detail, courier, method, schedule });
		} catch (error) {
			toast.error('Data tidak lengkap', {
				description: 'Beberapa informasi belum diisi. Silakan periksa kembali.',
			});
			return;
		}

		confirm({
			title: 'Konfirmasi Donasi Buku',
			description:
				'Donasi akan diproses dan tidak dapat dibatalkan. Lanjutkan?',
		})
			.then(async () => {
				setLoading(true);
				try {
					const { data: result } = await axios.post('/book-donations', {
						transaction: { items, detail, courier, method, schedule },
					});

					toast.success('Donasi buku berhasil dikirim');

					reset();
					if (result.data.payment_url) {
						window.open(result.data.payment_url, '_blank');
					}
					animate();
					mutate('/book-donations');
					navigate('/dashboard/book-donations');
				} catch (error) {
					toast.error('Gagal mengirim donasi', {
						description: error.response?.data?.message || error.message,
					});
				} finally {
					setLoading(false);
				}
			})
			.catch(() => {});
	};

	const onPrevious = () => route(STEPS.SCHEDULE);

	return (
		<div className='grid gap-8'>
			<div>
				<HeadingSubtitle className='mb-4'>Item Donasi</HeadingSubtitle>
				<div className='grid items-start grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5'>
					{items.map((item) => (
						<DonationItem key={item.id} item={item} />
					))}
				</div>
			</div>

			<div>
				<HeadingSubtitle className='mb-4'>
					Metode & Jadwal Pengiriman
				</HeadingSubtitle>
				<div className='border border-zinc-200 rounded-2xl overflow-hidden'>
					<div className='flex items-center gap-3 p-4 border-b border-zinc-100 bg-zinc-50'>
						{method === DELIVERY_METHODS.PICKUP ? (
							<Truck className='size-5 text-primary-500' />
						) : (
							<MapPin className='size-5 text-primary-500' />
						)}
						<span className='font-semibold capitalize'>
							{method === DELIVERY_METHODS.PICKUP ? 'Pickup' : 'Drop Off'}
						</span>
						<Badge variant='primary' className='ml-auto'>
							{method === DELIVERY_METHODS.PICKUP
								? 'Kurir ke lokasi Anda'
								: 'Antar ke titik drop off'}
						</Badge>
					</div>

					<div className='p-4 grid gap-3 text-sm'>
						{method === DELIVERY_METHODS.PICKUP && schedule && (
							<>
								<div className='flex items-center gap-2 text-zinc-600'>
									<CalendarDays className='size-4 text-primary-400 flex-none' />
									<span className='font-medium text-zinc-800'>Tanggal:</span>
									{schedule.date}
								</div>
								<div className='flex items-center gap-2 text-zinc-600'>
									<Clock className='size-4 text-primary-400 flex-none' />
									<span className='font-medium text-zinc-800'>Waktu:</span>
									{schedule.time_slot}
								</div>
								{schedule.note && (
									<div className='flex items-start gap-2 text-zinc-600'>
										<span className='font-medium text-zinc-800 flex-none'>
											Catatan:
										</span>
										{schedule.note}
									</div>
								)}
							</>
						)}

						{method === DELIVERY_METHODS.DROPOFF && schedule && (
							<>
								<div className='flex items-start gap-2 text-zinc-600'>
									<MapPin className='size-4 text-primary-400 flex-none mt-0.5' />
									<div>
										<p className='font-medium text-zinc-800'>
											{schedule.point_name}
										</p>
										<p className='text-zinc-500'>{schedule.point_address}</p>
									</div>
								</div>
							</>
						)}
					</div>
				</div>
			</div>

			<div>
				<HeadingSubtitle className='mb-4'>Detail Paket</HeadingSubtitle>
				<Error error={!selectedLoading && selectedError} />
				<Loading loading={selectedLoading} />

				{!selectedLoading && !selectedError && (
					<div className='grid gap-4 lg:grid-cols-2'>
						<div>
							<Label>Alamat Pengambilan</Label>
							<Input disabled defaultValue={selected?.data?.name} />
						</div>
						<div>
							<Label>Perkiraan Nilai</Label>
							<Input
								disabled
								defaultValue={currency(detail?.estimated_value)}
							/>
						</div>
						<div>
							<Label>Berat</Label>
							<Input disabled defaultValue={displayWeight(detail?.weight)} />
						</div>
						<div className='col-span-full'>
							<Label>Alamat Lengkap</Label>
							<Textarea
								disabled
								defaultValue={selected?.data?.street_address}
							/>
						</div>
						<div className='grid grid-cols-3 gap-4 col-span-full'>
							<div>
								<Label>Panjang</Label>
								<Input disabled defaultValue={detail?.length + ' cm'} />
							</div>
							<div>
								<Label>Lebar</Label>
								<Input disabled defaultValue={detail?.width + ' cm'} />
							</div>
							<div>
								<Label>Tinggi</Label>
								<Input disabled defaultValue={detail?.height + ' cm'} />
							</div>
						</div>
						{selected?.data && (
							<div className='col-span-full'>
								<Label>Lokasi</Label>
								<Map
									location={{
										latitude: selected.data.latitude,
										longitude: selected.data.longitude,
									}}
									className='w-full aspect-banner'
									readonly
								/>
							</div>
						)}
					</div>
				)}
			</div>

			<div>
				<HeadingSubtitle className='mb-4'>Informasi Kurir</HeadingSubtitle>
				<div className='grid gap-4 lg:grid-cols-2'>
					<div>
						<Label>Perusahaan</Label>
						<Input
							disabled
							className='uppercase'
							defaultValue={courier?.company}
						/>
					</div>
					<div>
						<Label>Jenis Layanan</Label>
						<Input
							disabled
							className='uppercase'
							defaultValue={courier?.type}
						/>
					</div>
					<div>
						<Label>Biaya Pengiriman</Label>
						<Input disabled defaultValue={currency(courier?.shipping_fee)} />
					</div>
					<div>
						<Label>Estimasi Pengiriman</Label>
						<Input disabled defaultValue={courier?.duration} />
					</div>
				</div>
			</div>

			<div className='flex flex-wrap items-center gap-3'>
				<Button onClick={onSubmit} disabled={loading}>
					{loading ? 'Mengirim...' : 'Konfirmasi & Kirim Donasi'}
				</Button>
				<Button variant='outline' onClick={onPrevious}>
					<ArrowLeft className='size-4 mr-2' />
					Kembali
				</Button>
			</div>
		</div>
	);
};

export default ReviewBookDonation;
