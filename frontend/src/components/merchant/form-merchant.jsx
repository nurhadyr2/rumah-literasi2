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

const geocodeAddress = async (query) => {
	try {
		const params = new URLSearchParams({
			q: query,
			countrycodes: 'id',
			format: 'json',
			limit: '1',
		});
		const res = await fetch(
			`https://nominatim.openstreetmap.org/search?${params}`,
			{ headers: { 'Accept-Language': 'id' } }
		);
		const data = await res.json();
		if (data.length > 0) {
			return {
				latitude: parseFloat(data[0].lat),
				longitude: parseFloat(data[0].lon),
			};
		}
		return null;
	} catch {
		return null;
	}
};

const MerchantForm = ({ initial, action, label }) => {
	const { confirm } = useConfirm();
	const [geocoding, setGeocoding] = React.useState(false);
	const [geocodeError, setGeocodeError] = React.useState('');

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

	const lat = watch('latitude');
	const lng = watch('longitude');

	const handleGeocode = async () => {
		const address = watch('address');
		const zipcode = watch('zipcode');

		if (!address || address.length < 5) {
			setGeocodeError('Masukkan alamat terlebih dahulu.');
			return;
		}

		const query = [address, zipcode, 'Indonesia'].filter(Boolean).join(', ');

		setGeocoding(true);
		setGeocodeError('');

		const result = await geocodeAddress(query);
		setGeocoding(false);

		if (result) {
			setValue('latitude', result.latitude, { shouldDirty: true });
			setValue('longitude', result.longitude, { shouldDirty: true });
			setGeocodeError('');
		} else {
			setGeocodeError(
				'Alamat tidak ditemukan. Coba perjelas alamat atau klik langsung di peta.'
			);
		}
	};

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
			.catch(() => {});
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
				<div className='flex gap-2 items-start'>
					<Textarea
						placeholder='Masukkan alamat merchant'
						className='flex-1'
						{...register('address')}
					/>
					<Button
						type='button'
						variant='outline'
						disabled={geocoding}
						onClick={handleGeocode}
						className='flex-none whitespace-nowrap'>
						{geocoding ? 'Mencari...' : '📍 Cari di Peta'}
					</Button>
				</div>
				<Hint>
					Ketik alamat lengkap lalu klik "Cari di Peta" agar titik lokasi
					menyesuaikan dengan alamat yang dicantumkan.
				</Hint>
				{geocodeError && (
					<span className='text-amber-500 text-sm'>{geocodeError}</span>
				)}
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
				<Label htmlFor='location'>Lokasi di Peta</Label>
				<Hint className='mb-2'>
					Klik "Cari di Peta" pada alamat untuk menyesuaikan titik secara
					otomatis, atau klik langsung di peta untuk menggeser penanda.
				</Hint>
				<Map
					location={{
						latitude: lat || 0,
						longitude: lng || 0,
					}}
					className='aspect-banner'
					setLocation={(location) => {
						setValue('latitude', location.latitude, { shouldDirty: true });
						setValue('longitude', location.longitude, { shouldDirty: true });
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
