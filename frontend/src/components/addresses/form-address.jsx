import * as React from 'react';
import * as z from 'zod';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { Map } from '@/components/map';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { Hint } from '@/components/ui/hint';
import { DEFAULT_LOCATION } from '@/libs/constant';
import { useConfirm } from '@/hooks/use-confirm';
import { useLocation } from '@/hooks/use-location';

const AddressSchema = z.object({
	name: z.string().min(1),
	contact_name: z.string().min(1),
	contact_phone: z.string().min(1),
	street_address: z.string().min(3),
	province_id: z.string().min(1),
	city_id: z.string().min(1),
	district_id: z.string().min(1),
	latitude: z.coerce.number(),
	longitude: z.coerce.number(),
	zipcode: z
		.string()
		.min(5, 'Kode pos harus 5 digit')
		.max(5, 'Kode pos harus 5 digit'),
	note: z.string().optional(),
});

const EditSchema = AddressSchema;

const AddressForm = ({ initial, action, label }) => {
	const { confirm } = useConfirm();
	const {
		province,
		city,
		provinces,
		districts,
		cities,
		loading,
		handleCityChange,
		handleProvinceChange,
	} = useLocation(
		initial && {
			province_id: initial.province_id,
			city_id: initial.city_id,
		}
	);

	const {
		control,
		watch,
		register,
		setValue,
		handleSubmit,
		formState: { errors },
	} = useForm({
		resolver: zodResolver(initial ? EditSchema : AddressSchema),
		defaultValues: initial || {
			name: '',
			contact_name: '',
			contact_phone: '',
			street_address: '',
			province_id: '',
			city_id: '',
			district_id: '',
			zipcode: '',
			note: '',
			...DEFAULT_LOCATION,
		},
	});

	const watchedDistrictId = watch('district_id');
	const watchedCityId = watch('city_id');
	const watchedProvinceId = watch('province_id');

	React.useEffect(() => {
		if (!watchedDistrictId || !districts.length) return;
		const found = districts.find(
			(d) => String(d.id) === String(watchedDistrictId)
		);
		if (
			found &&
			found.latitude &&
			found.longitude &&
			found.latitude !== 0 &&
			found.longitude !== 0
		) {
			setValue('latitude', found.latitude);
			setValue('longitude', found.longitude);
		}
	}, [watchedDistrictId, districts, setValue]);

	React.useEffect(() => {
		if (!watchedCityId || !cities.length) return;
		const currentDistrict = watch('district_id');
		if (currentDistrict) return;
		const found = cities.find((c) => String(c.id) === String(watchedCityId));
		if (
			found &&
			found.latitude &&
			found.longitude &&
			found.latitude !== 0 &&
			found.longitude !== 0
		) {
			setValue('latitude', found.latitude);
			setValue('longitude', found.longitude);
		}
	}, [watchedCityId, cities, setValue]);

	React.useEffect(() => {
		if (!watchedProvinceId || !provinces.length) return;
		const currentCity = watch('city_id');
		if (currentCity) return;
		const found = provinces.find(
			(p) => String(p.id) === String(watchedProvinceId)
		);
		if (
			found &&
			found.latitude &&
			found.longitude &&
			found.latitude !== 0 &&
			found.longitude !== 0
		) {
			setValue('latitude', found.latitude);
			setValue('longitude', found.longitude);
		}
	}, [watchedProvinceId, provinces, setValue]);

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
			<div>
				<Label htmlFor='contact_name'>Nama Kontak</Label>
				<Input
					placeholder='Masukkan nama kontak'
					{...register('contact_name')}
				/>
				<Hint>Nama orang yang dapat dihubungi pada alamat ini.</Hint>
				{errors.contact_name && (
					<span className='text-red-500'>{errors.contact_name.message}</span>
				)}
			</div>

			<div>
				<Label htmlFor='contact_phone'>No. Telepon Kontak</Label>
				<Input
					placeholder='Masukkan nomor telepon'
					{...register('contact_phone')}
				/>
				<Hint>Nomor telepon orang yang dapat dihubungi.</Hint>
				{errors.contact_phone && (
					<span className='text-red-500'>{errors.contact_phone.message}</span>
				)}
			</div>

			<div>
				<Label htmlFor='name'>Nama Alamat</Label>
				<Input placeholder='Masukkan nama alamat' {...register('name')} />
				<Hint>Nama deskriptif untuk lokasi ini (misal: Rumah, Kantor).</Hint>
				{errors.name && (
					<span className='text-red-500'>{errors.name.message}</span>
				)}
			</div>

			<div className='col-span-full'>
				<Label htmlFor='street_address'>Alamat Jalan</Label>
				<Textarea
					placeholder='Masukkan alamat lengkap'
					{...register('street_address')}
				/>
				<Hint>
					Alamat lengkap termasuk nomor bangunan, nama jalan, dan detail
					lainnya.
				</Hint>
				{errors.street_address && (
					<span className='text-red-500'>{errors.street_address.message}</span>
				)}
			</div>

			<div>
				<Label htmlFor='province_id'>Provinsi</Label>
				<Controller
					name='province_id'
					control={control}
					render={({ field }) => (
						<Select
							{...field}
							onChange={(event) => {
								field.onChange(event);
								handleProvinceChange(event.target.value);
								setValue('city_id', '');
								setValue('district_id', '');
							}}
							disabled={loading.provinces}>
							<option value=''>Pilih provinsi</option>
							{provinces.map((province) => (
								<option key={province.id} value={province.id}>
									{province.name}
								</option>
							))}
						</Select>
					)}
				/>
				<Hint>Pilih provinsi tempat alamat ini berada.</Hint>
				{errors.province_id && (
					<span className='text-red-500'>{errors.province_id.message}</span>
				)}
			</div>

			<div>
				<Label htmlFor='city_id'>Kota</Label>
				<Controller
					name='city_id'
					control={control}
					render={({ field }) => (
						<Select
							{...field}
							onChange={(event) => {
								field.onChange(event);
								handleCityChange(event.target.value);
								setValue('district_id', '');
							}}
							disabled={loading.cities || !province}>
							<option value=''>Pilih kota</option>
							{cities.map((city) => (
								<option key={city.id} value={city.id}>
									{city.name}
								</option>
							))}
						</Select>
					)}
				/>
				<Hint>Pilih kota tempat alamat ini berada.</Hint>
				{errors.city_id && (
					<span className='text-red-500'>{errors.city_id.message}</span>
				)}
			</div>

			<div>
				<Label htmlFor='district_id'>Kecamatan</Label>
				<Controller
					name='district_id'
					control={control}
					render={({ field }) => (
						<Select
							{...field}
							onChange={(event) => {
								field.onChange(event);
							}}
							disabled={loading.districts || !city}>
							<option value=''>Pilih kecamatan</option>
							{districts.map((district) => (
								<option key={district.id} value={district.id}>
									{district.name}
								</option>
							))}
						</Select>
					)}
				/>
				<Hint>
					Pilih kecamatan tempat alamat ini berada. Peta akan otomatis
					menyesuaikan lokasi.
				</Hint>
				{errors.district_id && (
					<span className='text-red-500'>{errors.district_id.message}</span>
				)}
			</div>

			<div>
				<Label htmlFor='zipcode'>Kode Pos</Label>
				<Input
					type='text'
					placeholder='Masukkan kode pos'
					maxLength={5}
					pattern='[0-9]*'
					{...register('zipcode')}
				/>
				<Hint>Kode pos 5 digit untuk alamat ini.</Hint>
				{errors.zipcode && (
					<span className='text-red-500'>{errors.zipcode.message}</span>
				)}
			</div>

			<div className='col-span-full'>
				<Label htmlFor='note'>Catatan</Label>
				<Textarea
					placeholder='Tambahkan catatan untuk alamat ini'
					{...register('note')}
				/>
				<Hint>
					Catatan ini membantu kurir menemukan lokasi Anda dengan lebih mudah.
				</Hint>
				{errors.note && (
					<span className='text-red-500'>{errors.note.message}</span>
				)}
			</div>

			<div className='col-span-full'>
				<Label htmlFor='location'>Lokasi</Label>
				<Hint className='mb-2'>
					Peta otomatis menyesuaikan saat kecamatan dipilih. Anda juga bisa klik
					peta atau gunakan tombol di bawah untuk menentukan lokasi manual.
				</Hint>
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

export default AddressForm;
