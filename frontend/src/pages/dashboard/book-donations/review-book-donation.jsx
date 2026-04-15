import * as React from 'react';
import useSWR, { useSWRConfig } from 'swr';
import { toast } from 'sonner';
import { useNavigate } from 'react-router';
import { ArrowLeft } from 'lucide-react';

import axios from '@/libs/axios';
import { animate, currency } from '@/libs/utils';
import { bookDonationSchema } from '@/libs/schemas';
import { useDonation } from '@/stores/use-donation';
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

const ReviewBookDonation = () => {
	const navigate = useNavigate();
	const { confirm } = useConfirm();
	const { mutate } = useSWRConfig();
	const [loading, setLoading] = React.useState(false);
	const { items, detail, courier, reset } = useDonation();

	const {
		data: selected,
		error: selectedError,
		isLoading: selectedLoading,
	} = useSWR('/addresses/' + detail.address_id);

	const onSubmit = async () => {
		try {
			bookDonationSchema.parse({
				items,
				detail,
				courier,
			});
		} catch (error) {
			toast.error('Kesalahan Validasi', {
				description: 'Beberapa data tidak valid. Silakan periksa kembali.',
			});
			console.error(error);
			return;
		}

		confirm({
			title: 'Konfirmasi Donasi Buku',
			description:
				'Apakah Anda yakin ingin mengirim donasi buku ini? Tindakan ini tidak dapat dibatalkan.',
		})
			.then(async () => {
				setLoading(true);
				try {
					const { data: result } = await axios.post('/book-donations', {
						transaction: {
							items,
							detail,
							courier,
						},
					});

					toast.success('Donasi buku berhasil dikirim', {
						description: 'Donasi buku Anda telah berhasil diproses',
					});

					reset();
					window.open(result.data.payment_url, '_blank');
					animate();
					mutate('/book-donations');
					navigate('/dashboard/book-donations');
				} catch (error) {
					toast.error('Gagal mengirim donasi buku', {
						description: error.response?.data?.message || error.message,
					});
					console.error(error);
				} finally {
					setLoading(false);
				}
			})
			.catch(() => {
				// pass
			});
	};

	const onPrevious = () => {
		navigate('/dashboard/book-donations/create/courier');
	};

	return (
		<div className='grid gap-8'>
			<Heading>
				<HeadingTitle>Tinjau Donasi Buku Anda</HeadingTitle>
				<HeadingDescription>
					Silakan periksa kembali semua informasi sebelum mengirim donasi buku.
				</HeadingDescription>
			</Heading>

			<HeadingSubtitle>Item Donasi</HeadingSubtitle>

			<div className='grid items-start grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5'>
				{items.map((item) => (
					<div key={item.id} className='relative group'>
						<DonationItem item={item} />
					</div>
				))}
			</div>

			<HeadingSubtitle>Detail Donasi</HeadingSubtitle>

			<Error error={!selectedLoading && selectedError} />
			<Loading loading={selectedLoading} />

			{!selectedLoading && !selectedError && (
				<div className='grid gap-6 lg:grid-cols-2'>
					<div>
						<Label htmlFor='address'>Alamat Pengiriman</Label>
						<Input
							disabled
							type='text'
							defaultValue={selected && selected.data.name}
						/>
					</div>

					<div>
						<Label htmlFor='estimated_value'>Perkiraan Nilai</Label>
						<Input
							disabled
							type='text'
							defaultValue={currency(detail.estimated_value)}
						/>
					</div>

					<div>
						<Label htmlFor='weight'>Total Berat</Label>
						<Input disabled type='text' defaultValue={detail.weight} />
					</div>

					<div className='col-span-full'>
						<Label htmlFor='street_address'>Alamat Lengkap</Label>
						<Textarea
							disabled
							defaultValue={selected && selected.data.street_address}
						/>
					</div>

					<div className='grid grid-cols-1 sm:grid-cols-3 gap-6 col-span-full'>
						<div>
							<Label>Panjang</Label>
							<Input disabled type='text' defaultValue={detail.length + 'cm'} />
						</div>
						<div>
							<Label>Lebar</Label>
							<Input disabled type='text' defaultValue={detail.width + 'cm'} />
						</div>
						<div>
							<Label>Tinggi</Label>
							<Input disabled type='text' defaultValue={detail.height + 'cm'} />
						</div>
					</div>

					<div className='col-span-full'>
						<Label>Lokasi</Label>
						{selected && (
							<Map
								location={{
									latitude: selected.data.latitude,
									longitude: selected.data.longitude,
								}}
								className='w-full aspect-banner'
								readonly
							/>
						)}
					</div>
				</div>
			)}

			<HeadingSubtitle>Informasi Kurir</HeadingSubtitle>

			<div className='grid gap-6 lg:grid-cols-2'>
				<div>
					<Label>Perusahaan Kurir</Label>
					<Input
						disabled
						type='text'
						className='uppercase'
						defaultValue={courier.company}
					/>
				</div>

				<div>
					<Label>Jenis Layanan</Label>
					<Input
						disabled
						type='text'
						className='uppercase'
						defaultValue={courier.type}
					/>
				</div>

				<div>
					<Label>Biaya Pengiriman</Label>
					<Input
						disabled
						type='text'
						defaultValue={currency(courier.shipping_fee)}
					/>
				</div>

				<div>
					<Label>Estimasi Pengiriman</Label>
					<Input disabled type='text' defaultValue={courier.duration} />
				</div>
			</div>

			<div className='col-span-full'>
				<div className='flex flex-wrap items-center gap-2'>
					<Button onClick={onSubmit} disabled={loading}>
						{loading ? 'Mengirim...' : 'Konfirmasi dan Kirim Donasi'}
					</Button>

					<Button variant='outline' onClick={onPrevious}>
						<ArrowLeft className='size-4 sm:mr-2' />
						<span className='hidden sm:inline'>Kembali</span>
					</Button>
				</div>
			</div>
		</div>
	);
};

export default ReviewBookDonation;