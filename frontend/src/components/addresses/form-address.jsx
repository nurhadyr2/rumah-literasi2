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
	name: z.string().min(1, 'Nama alamat wajib diisi'),
	contact_name: z.string().min(1, 'Nama kontak wajib diisi'),
	contact_phone: z.string().min(1, 'No. telepon wajib diisi'),
	street_address: z.string().min(3, 'Alamat jalan terlalu pendek'),
	province_id: z.string().min(1, 'Pilih provinsi'),
	city_id: z.string().min(1, 'Pilih kota'),
	district_id: z.string().min(1, 'Pilih kecamatan'),
	latitude: z.coerce.number(),
	longitude: z.coerce.number(),
	zipcode: z.string().regex(/^\d{5}$/, 'Kode pos harus 5 digit angka'),
	note: z.string().optional(),
});

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
		getValues,
		handleSubmit,
		formState: { errors },
	} = useForm({
		resolver: zodResolver(AddressSchema),
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
			setValue('latitude', found.latitude, { shouldDirty: true });
			setValue('longitude', found.longitude, { shouldDirty: true });
		}
	}, [watchedDistrictId, districts, setValue]);

	const watchedCityId = watch('city_id');

	React.useEffect(() => {
		if (!watchedCityId || !cities.length) return;

		const currentDistrict = getValues('district_id');
		if (currentDistrict) return;

		const found = cities.find((c) => String(c.id) === String(watchedCityId));
		if (
			found &&
			found.latitude &&
			found.longitude &&
			found.latitude !== 0 &&
			found.longitude !== 0
		) {
			setValue('latitude', found.latitude, { shouldDirty: true });
			setValue('longitude', found.longitude, { shouldDirty: true });
		}
	}, [watchedCityId, cities, setValue, getValues]);

	const watchedProvinceId = watch('province_id');

	React.useEffect(() => {
		if (!watchedProvinceId || !provinces.length) return;

		const currentCity = getValues('city_id');
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
			setValue('latitude', found.latitude, { shouldDirty: true });
			setValue('longitude', found.longitude, { shouldDirty: true });
		}
	}, [watchedProvinceId, provinces, setValue, getValues]);

	const handleUseMyLocation = async () => {
		confirm({
			title: 'Gunakan lokasi saya',
			description: 'Apakah Anda yakin ingin menggunakan lokasi Anda?',
		})
			.then(async () => {
				if (!('geolocation' in navigator)) {
					alert('Browser Anda tidak mendukung geolokasi.');
					return;
				}
				navigator.geolocation.getCurrentPosition(
					(position) => {
						setValue('latitude', position.coords.latitude, {
							shouldDirty: true,
						});
						setValue('longitude', position.coords.longitude, {
							shouldDirty: true,
						});
					},
					() => {
						alert(
							'Tidak dapat mengambil lokasi Anda. Silakan periksa izin browser.'
						);
					},
					{ enableHighAccuracy: true }
				);
			})
			.catch(() => {});
	};

	const lat = watch('latitude');
	const lng = watch('longitude');

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
				<Input
					placeholder='Masukkan nama alamat (misal: Rumah, Kantor)'
					{...register('name')}
				/>
				<Hint>Nama deskriptif untuk lokasi ini.</Hint>
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
							onChange={(e) => {
								field.onChange(e);
								handleProvinceChange(e.target.value);
								setValue('city_id', '');
								setValue('district_id', '');
								setValue('zipcode', '');
							}}
							disabled={loading.provinces}>
							<option value=''>Pilih provinsi</option>
							{provinces.map((p) => (
								<option key={p.id} value={p.id}>
									{p.name}
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

			{/* City */}
			<div>
				<Label htmlFor='city_id'>Kota / Kabupaten</Label>
				<Controller
					name='city_id'
					control={control}
					render={({ field }) => (
						<Select
							{...field}
							onChange={(e) => {
								field.onChange(e);
								handleCityChange(e.target.value);
								setValue('district_id', '');
								setValue('zipcode', '');
							}}
							disabled={loading.cities || !province}>
							<option value=''>Pilih kota</option>
							{cities.map((c) => (
								<option key={c.id} value={c.id}>
									{c.name}
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
							onChange={(e) => {
								field.onChange(e);
								setValue('zipcode', '');
							}}
							disabled={loading.districts || !city}>
							<option value=''>Pilih kecamatan</option>
							{districts.map((d) => (
								<option key={d.id} value={d.id}>
									{d.name}
								</option>
							))}
						</Select>
					)}
				/>
				<Hint>
					Pilih kecamatan. Peta akan otomatis menyesuaikan lokasi berdasarkan
					kecamatan yang dipilih.
				</Hint>
				{errors.district_id && (
					<span className='text-red-500'>{errors.district_id.message}</span>
				)}
			</div>

			<div>
				<Label htmlFor='zipcode'>Kode Pos</Label>
				<Input
					type='text'
					inputMode='numeric'
					placeholder='Contoh: 55285'
					maxLength={5}
					{...register('zipcode')}
				/>
				<Hint>
					Kode pos 5 digit sesuai kecamatan yang dipilih. Pastikan kode pos
					sesuai dengan wilayah di atas agar pengiriman dapat diproses dengan
					benar.
				</Hint>
				{errors.zipcode && (
					<span className='text-red-500'>{errors.zipcode.message}</span>
				)}
			</div>

			<div className='col-span-full'>
				<Label htmlFor='note'>Catatan (opsional)</Label>
				<Textarea
					placeholder='Tambahkan catatan untuk kurir, misal: patokan rumah, nomor unit, dll.'
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
				<Label htmlFor='location'>Lokasi di Peta</Label>
				<Hint className='mb-2'>
					Peta otomatis menyesuaikan saat kecamatan dipilih. Anda juga bisa klik
					peta langsung atau gunakan tombol "Gunakan lokasi saya" di bawah.
				</Hint>
				<Map
					location={{ latitude: lat, longitude: lng }}
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

export default AddressForm;
