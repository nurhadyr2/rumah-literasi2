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
				display_name: data[0].display_name,
			};
		}
		return null;
	} catch {
		return null;
	}
};

const reverseGeocode = async (lat, lng) => {
	try {
		const params = new URLSearchParams({
			lat: String(lat),
			lon: String(lng),
			format: 'json',
			'accept-language': 'id',
			addressdetails: '1',
			zoom: '18',
		});
		const res = await fetch(
			`https://nominatim.openstreetmap.org/reverse?${params}`,
			{ headers: { 'Accept-Language': 'id' } }
		);
		const data = await res.json();
		if (!data || data.error) return null;
		return {
			display_name: data.display_name || '',
			address: data.address || {},
		};
	} catch {
		return null;
	}
};

const normalizeAdminName = (name) =>
	String(name || '')
		.toLowerCase()
		.replace(/^(kabupaten|kota administrasi|kota|provinsi|kecamatan|daerah khusus ibukota|daerah istimewa)\s+/i, '')
		.replace(/\s+/g, ' ')
		.trim();

const adminNameMatches = (a, b) => {
	const na = normalizeAdminName(a);
	const nb = normalizeAdminName(b);
	if (!na || !nb) return false;
	return na === nb || na.includes(nb) || nb.includes(na);
};

const AddressForm = ({ initial, action, label }) => {
	const { confirm } = useConfirm();
	const [geocoding, setGeocoding] = React.useState(false);
	const [geocodeError, setGeocodeError] = React.useState('');
	const [validation, setValidation] = React.useState(null);
	const [validating, setValidating] = React.useState(false);
	const [submitError, setSubmitError] = React.useState('');
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
	const watchedCityId = watch('city_id');
	const watchedProvinceId = watch('province_id');
	const watchedZipcode = watch('zipcode');
	const lat = watch('latitude');
	const lng = watch('longitude');

	const provinceName = React.useMemo(
		() =>
			provinces.find((p) => String(p.id) === String(watchedProvinceId))?.name ||
			'',
		[provinces, watchedProvinceId]
	);
	const cityName = React.useMemo(
		() => cities.find((c) => String(c.id) === String(watchedCityId))?.name || '',
		[cities, watchedCityId]
	);
	const districtName = React.useMemo(
		() =>
			districts.find((d) => String(d.id) === String(watchedDistrictId))?.name ||
			'',
		[districts, watchedDistrictId]
	);

	React.useEffect(() => {
		if (!lat || !lng) {
			setValidation(null);
			return;
		}
		setValidating(true);
		const handler = setTimeout(async () => {
			const result = await reverseGeocode(lat, lng);
			setValidating(false);
			if (!result) {
				setValidation({ ok: null, displayAddress: '', mismatches: [] });
				return;
			}
			const addr = result.address;
			const osmProvince = addr.state || '';
			const osmCity = addr.city || addr.county || addr.town || addr.municipality || '';
			const osmDistrict = addr.suburb || addr.city_district || addr.village || addr.subdistrict || '';
			const osmPostcode = addr.postcode || '';

			const provinceMatch = provinceName
				? adminNameMatches(osmProvince, provinceName)
				: null;
			const cityMatch = cityName ? adminNameMatches(osmCity, cityName) : null;
			const districtMatch = districtName
				? adminNameMatches(osmDistrict, districtName)
				: null;

			setValidation({
				displayAddress: result.display_name,
				osmProvince,
				osmCity,
				osmDistrict,
				osmPostcode,
				provinceMatch,
				cityMatch,
				districtMatch,
				zipcodeMatch:
					osmPostcode && watchedZipcode
						? osmPostcode === watchedZipcode
						: null,
			});
		}, 800);
		return () => clearTimeout(handler);
	}, [lat, lng, provinceName, cityName, districtName, watchedZipcode]);

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
			setValue('latitude', found.latitude, { shouldDirty: true });
			setValue('longitude', found.longitude, { shouldDirty: true });
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
			setValue('latitude', found.latitude, { shouldDirty: true });
			setValue('longitude', found.longitude, { shouldDirty: true });
		}
	}, [watchedProvinceId, provinces, setValue]);

	const handleGeocode = async () => {
		const streetAddress = watch('street_address');
		if (!streetAddress || streetAddress.length < 5) {
			setGeocodeError('Masukkan alamat jalan terlebih dahulu.');
			return;
		}

		const query = [
			streetAddress,
			districtName,
			cityName,
			provinceName,
			watchedZipcode,
			'Indonesia',
		]
			.filter(Boolean)
			.join(', ');

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
				'Alamat tidak ditemukan. Coba perjelas nama jalan atau klik langsung di peta.'
			);
		}
	};

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

	const guardedSubmit = (values) => {
		setSubmitError('');
		if (validation && validation.provinceMatch === false) {
			setSubmitError(
				`Lokasi peta berada di provinsi "${validation.osmProvince}", tidak sesuai dengan provinsi "${provinceName}" yang dipilih. Geser penanda peta atau perbaiki pilihan provinsi sebelum menyimpan.`
			);
			return;
		}
		return action(values);
	};

	return (
		<form onSubmit={handleSubmit(guardedSubmit)} className='grid gap-6 lg:grid-cols-2'>
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
				<div className='flex gap-2 items-start'>
					<Textarea
						placeholder='Masukkan alamat lengkap, misal: Jl. Mawar No.10'
						className='flex-1'
						{...register('street_address')}
					/>
					<Button
						type='button'
						variant='outline'
						disabled={geocoding}
						onClick={handleGeocode}
						className='flex-none mt-0 whitespace-nowrap'>
						{geocoding ? 'Mencari...' : 'Cari di Peta'}
					</Button>
				</div>
				<Hint>
					Ketik alamat lengkap lalu klik "Cari di Peta" agar titik lokasi
					menyesuaikan dengan nama jalan yang dicantumkan.
				</Hint>
				{geocodeError && (
					<span className='text-amber-500 text-sm'>{geocodeError}</span>
				)}
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
					Klik "Cari di Peta" pada alamat jalan untuk menyesuaikan titik secara
					otomatis, atau klik langsung di peta untuk menggeser penanda.
				</Hint>
				<Map
					location={{ latitude: lat, longitude: lng }}
					className='aspect-banner'
					setLocation={(location) => {
						setValue('latitude', location.latitude, { shouldDirty: true });
						setValue('longitude', location.longitude, { shouldDirty: true });
					}}
				/>

				<div className='mt-3 rounded-md border p-3 text-sm space-y-1'>
					{validating && (
						<p className='text-gray-500'>Memeriksa konsistensi alamat di peta...</p>
					)}
					{!validating && validation && validation.displayAddress && (
						<>
							<p className='text-gray-700'>
								<span className='font-medium'>Alamat menurut peta: </span>
								{validation.displayAddress}
							</p>
							{validation.provinceMatch === false && (
								<p className='text-red-600'>
									Provinsi tidak cocok: peta menunjukkan "{validation.osmProvince}",
									Anda memilih "{provinceName}". Submit akan diblokir sampai
									diperbaiki.
								</p>
							)}
							{validation.provinceMatch !== false && validation.cityMatch === false && (
								<p className='text-amber-600'>
									Kota/kabupaten mungkin tidak cocok: peta menunjukkan "
									{validation.osmCity || '-'}", Anda memilih "{cityName}". Periksa
									kembali sebelum menyimpan.
								</p>
							)}
							{validation.provinceMatch !== false &&
								validation.cityMatch !== false &&
								validation.districtMatch === false && (
									<p className='text-amber-600'>
										Kecamatan mungkin tidak cocok: peta menunjukkan "
										{validation.osmDistrict || '-'}", Anda memilih "{districtName}".
									</p>
								)}
							{validation.osmPostcode &&
								validation.zipcodeMatch === false && (
									<p className='text-blue-600 flex items-center gap-2 flex-wrap'>
										Peta menyarankan kode pos {validation.osmPostcode}.
										<button
											type='button'
											className='underline'
											onClick={() =>
												setValue('zipcode', validation.osmPostcode, {
													shouldDirty: true,
												})
											}>
											Gunakan
										</button>
									</p>
								)}
						</>
					)}
					{!validating && validation && !validation.displayAddress && (
						<p className='text-gray-500'>
							Tidak dapat memverifikasi alamat dari peta saat ini.
						</p>
					)}
				</div>
			</div>

			{submitError && (
				<div className='col-span-full text-red-600 text-sm'>{submitError}</div>
			)}

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
