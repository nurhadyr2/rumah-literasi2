import * as React from 'react';
import * as z from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Map } from '@/components/map';
import { Hint } from '@/components/ui/hint';
import { useConfirm } from '@/hooks/use-confirm';

const MerchantSchema = z.object({
	name: z.string().min(3),
	phone: z.string().min(10),
	email: z.string().email(),
	address: z.string().min(10),
	zipcode: z.string().min(4),
	area_id: z.string().min(1),
	latitude: z.coerce.number(),
	longitude: z.coerce.number(),
});

const MerchantForm = ({ initial, action, label }) => {
	const { confirm } = useConfirm();

	const {
		register,
		handleSubmit,
		formState: { errors },
		watch,
		setValue,
	} = useForm({
		resolver: zodResolver(MerchantSchema),
		defaultValues: initial || {
			name: '',
			phone: '',
			email: '',
			address: '',
			zipcode: '',
			area_id: '',
			latitude: '',
			longitude: '',
		},
	});

	const handleUseMyLocation = async () => {
		confirm({
			title: 'Gunakan lokasi saya',
			description: 'Apakah Anda yakin ingin menggunakan lokasi Anda?',
		})
			.then(async () => {
				if ('geolocation' in navigator) {
					navigator.geolocation.getCurrentPosition(
						(position) => {
							const { latitude, longitude } = position.coords;
							setValue('latitude', latitude);
							setValue('longitude', longitude);
						},
						(error) => {
							console.error('Error mendapatkan lokasi:', error);
							alert(
								'Tidak dapat mengambil lokasi Anda. Silakan periksa izin browser.'
							);
						},
						{ enableHighAccuracy: true }
					);
				}
			})
			.catch(() => {
				// pass
			});
	};

	return (
		<form onSubmit={handleSubmit(action)} className='grid gap-6 lg:grid-cols-2'>
			<div className='col-span-full'>
				<Label htmlFor='name'>Nama</Label>
				<Input
					type='text'
					placeholder='Masukkan nama merchant'
					{...register('name')}
				/>
				<Hint>Nama merchant atau bisnis.</Hint>
				{errors.name && (
					<span className='text-red-500'>{errors.name.message}</span>
				)}
			</div>

			<div className='col-span-full'>
				<Label htmlFor='phone'>No. Telepon</Label>
				<Input
					type='text'
					placeholder='Masukkan nomor telepon'
					{...register('phone')}
				/>
				<Hint>Nomor telepon yang dapat dihubungi.</Hint>
				{errors.phone && (
					<span className='text-red-500'>{errors.phone.message}</span>
				)}
			</div>

			<div className='col-span-full'>
				<Label htmlFor='email'>Email</Label>
				<Input
					type='email'
					placeholder='Masukkan alamat email'
					{...register('email')}
				/>
				<Hint>Alamat email untuk merchant.</Hint>
				{errors.email && (
					<span className='text-red-500'>{errors.email.message}</span>
				)}
			</div>

			<div className='col-span-full'>
				<Label htmlFor='address'>Alamat</Label>
				<Textarea
					placeholder='Masukkan alamat merchant'
					{...register('address')}
				/>
				<Hint>Alamat lengkap lokasi merchant.</Hint>
				{errors.address && (
					<span className='text-red-500'>{errors.address.message}</span>
				)}
			</div>

			<div>
				<Label htmlFor='zipcode'>Kode Pos</Label>
				<Input
					type='text'
					placeholder='Masukkan kode pos'
					{...register('zipcode')}
				/>
				<Hint>Kode pos untuk lokasi merchant.</Hint>
				{errors.zipcode && (
					<span className='text-red-500'>{errors.zipcode.message}</span>
				)}
			</div>

			<div>
				<Label htmlFor='area_id'>ID Area</Label>
				<Input
					type='text'
					placeholder='Masukkan ID area'
					{...register('area_id')}
				/>
				<Hint>Jangan ubah kecuali Anda ingin mengganti ID area.</Hint>
				{errors.area_id && (
					<span className='text-red-500'>{errors.area_id.message}</span>
				)}
			</div>

			<div className='col-span-full'>
				<Label htmlFor='location'>Lokasi</Label>
				<Map
					location={{
						latitude: watch('latitude'),
						longitude: watch('longitude'),
					}}
					className='aspect-banner'
					setLocation={(location) => {
						setValue('latitude', location.latitude);
						setValue('longitude', location.longitude);
					}}
				/>
			</div>

			<div className='flex items-center gap-2 col-span-full'>
				<Button>{label}</Button>
				<Button variant='outline' type='button' onClick={handleUseMyLocation}>
					Gunakan lokasi saya
				</Button>
			</div>
		</form>
	);
};

export default MerchantForm;