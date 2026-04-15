import * as React from 'react';
import * as z from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { currency } from '@/libs/utils';
import { PAYMENT_STATUS } from '@/libs/constant';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Map } from '@/components/map';
import { DonationItem } from '@/components/book-donations/donation-item-card';
import { HeadingSubtitle } from '@/components/ui/heading';
import { Hint } from '@/components/ui/hint';
import { Select } from '@/components/ui/select';

const STATUS_LIST = Object.values(PAYMENT_STATUS);

const BookDonationSchema = z.object({
	status: z.enum(STATUS_LIST),
	acceptance_notes: z.string().optional(),
});

const BookDonationForm = ({ initial, action, label }) => {
	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm({
		resolver: zodResolver(BookDonationSchema),
		defaultValues: initial,
	});

	return (
		<form onSubmit={handleSubmit(action)} className='space-y-8'>
			<HeadingSubtitle>Item Donasi</HeadingSubtitle>

			<div className='grid items-start grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5'>
				{initial.book_donation_items.map((item) => (
					<div key={item.id} className='relative group'>
						<DonationItem item={item} />
					</div>
				))}
			</div>

			<HeadingSubtitle>Detail Donasi</HeadingSubtitle>

			<div className='grid gap-6 lg:grid-cols-2'>
				<div>
					<Label htmlFor='member'>Anggota</Label>
					<Input disabled type='text' defaultValue={initial.user.name} />
				</div>
				<div>
					<Label htmlFor='estimated_value'>Perkiraan Nilai (Rp)</Label>
					<Input
						disabled
						type='text'
						defaultValue={currency(initial.estimated_value)}
					/>
				</div>

				<div>
					<Label htmlFor='weight'>Total Berat (kg)</Label>
					<Input disabled type='text' defaultValue={initial.weight + ' kg'} />
				</div>

				<div>
					<Label htmlFor='length'>Panjang (cm)</Label>
					<Input disabled type='text' defaultValue={initial.length + ' cm'} />
				</div>

				<div>
					<Label htmlFor='width'>Lebar (cm)</Label>
					<Input disabled type='text' defaultValue={initial.width + ' cm'} />
				</div>

				<div>
					<Label htmlFor='height'>Tinggi (cm)</Label>
					<Input disabled type='text' defaultValue={initial.height + ' cm'} />
				</div>

				<div className='col-span-full'>
					<Label htmlFor='delivery_address'>Alamat Pengiriman</Label>
					<Input disabled type='text' defaultValue={initial.address.name} />
				</div>

				<div className='col-span-full'>
					<Label htmlFor='street_address'>Alamat Jalan</Label>
					<Input
						disabled
						type='text'
						defaultValue={initial.address.street_address}
					/>
				</div>

				<div className='col-span-full'>
					<Label htmlFor='location'>Lokasi</Label>
					<Map
						location={{
							latitude: initial.address.latitude,
							longitude: initial.address.longitude,
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
						defaultValue={initial.courier_code}
					/>
				</div>

				<div>
					<Label htmlFor='courier_service_code'>Jenis Layanan Kurir</Label>
					<Input
						disabled
						type='text'
						className='uppercase'
						defaultValue={initial.courier_service_code}
					/>
				</div>

				<div>
					<Label htmlFor='shipping_fee'>Biaya Pengiriman</Label>
					<Input
						disabled
						type='text'
						defaultValue={currency(initial.shipping_fee)}
					/>
				</div>

				<div>
					<Label htmlFor='shipping_eta'>Estimasi Pengiriman</Label>
					<Input disabled type='text' defaultValue={initial.shipping_eta} />
				</div>
			</div>

			<HeadingSubtitle>Informasi Pelacakan</HeadingSubtitle>

			<div className='grid gap-6 lg:grid-cols-2'>
				<div>
					<Label htmlFor='order-id'>ID Pesanan</Label>
					<Input
						disabled
						type='text'
						defaultValue={initial.order_id || 'Tidak tersedia'}
					/>
				</div>
				<div>
					<Label htmlFor='tracking-id'>ID Pelacakan</Label>
					<Input
						disabled
						type='text'
						defaultValue={initial.tracking_id || 'Tidak tersedia'}
					/>
				</div>
			</div>

			<HeadingSubtitle>Manajemen Status</HeadingSubtitle>

			<div>
				<Label htmlFor='status'>Perbarui Status</Label>
				<Select {...register('status')}>
					{STATUS_LIST.map((status) => (
						<option key={status} value={status}>
							{status}
						</option>
					))}
				</Select>
				<Hint>Status proses donasi buku.</Hint>
				{errors.status && (
					<span className='text-red-500'>{errors.status.message}</span>
				)}
			</div>

			<div className='col-span-full'>
				<Label htmlFor='acceptance-notes'>Catatan Penerimaan</Label>
				<Textarea
					type='text'
					placeholder='Masukkan catatan penerimaan'
					{...register('acceptance_notes')}
				/>
				<Hint>Catatan mengenai penerimaan donasi ini.</Hint>
				{errors.acceptance_notes && (
					<span className='text-red-500'>
						{errors.acceptance_notes.message}
					</span>
				)}
			</div>

			<div className='col-span-full'>
				<Button type='submit'>{label}</Button>
			</div>
		</form>
	);
};

export default BookDonationForm;