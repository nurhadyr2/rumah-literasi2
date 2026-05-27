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
import { geocodeAddress } from '@/libs/geocoder';
import { DEFAULT_LOCATION } from '@/libs/constant';

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

const stripMerchantNamePrefix = (address, merchantName) => {
	const addr = String(address || '').trim();
	const name = String(merchantName || '').trim();
	if (!addr || !name || name.length < 3) return addr;
	const lowerAddr = addr.toLowerCase();
	const lowerName = name.toLowerCase();
	if (lowerAddr.startsWith(lowerName)) {
		return addr
			.slice(name.length)
			.replace(/^[\s,.-]+/, '')
			.trim();
	}
	return addr;
};

const stripBlockNumber = (s) =>
	s
		.replace(/\bno\.?\s*[a-z]?[-]?\d+[a-z0-9-]*/gi, '')
		.replace(/\bblok\s*[a-z]?[-]?\d+[a-z0-9-]*/gi, '')
		.replace(/\s+/g, ' ')
		.replace(/\s*,\s*,+/g, ',')
		.replace(/^[\s,]+|[\s,]+$/g, '')
		.trim();

const ADMIN_PREFIX_REGEX =
	/\b(kec\.?|kecamatan|kab\.?|kabupaten|kota|kotamadya|provinsi|prov\.?)\s+/gi;

const cleanAddressSegments = (address) => {
	let s = stripBlockNumber(address);
	s = s.replace(ADMIN_PREFIX_REGEX, '');
	s = s.replace(/\b\d{5}\b/g, '');
	s = s.replace(/\s+/g, ' ');

	const segments = s
		.split(',')
		.map((x) => x.trim())
		.filter(Boolean);

	const deduped = [];
	for (const seg of segments) {
		const last = deduped[deduped.length - 1];
		if (!last || last.toLowerCase() !== seg.toLowerCase()) {
			deduped.push(seg);
		}
	}
	return deduped;
};

const buildFallbackQueries = (address, zipcode) => {
	const variants = new Set();
	const wrap = (s) => [s, zipcode, 'Indonesia'].filter(Boolean).join(', ');
	const add = (s) => {
		const t = String(s || '').trim();
		if (t.length >= 3) variants.add(wrap(t));
	};

	add(address);

	const segments = cleanAddressSegments(address);
	if (segments.length > 0) {
		add(segments.join(', '));
		for (let n = segments.length - 1; n >= 1; n--) {
			add(segments.slice(-n).join(', '));
		}
	}

	return Array.from(variants);
};

const MerchantForm = ({ initial, action, label }) => {
	const { confirm } = useConfirm();
	const [geocoding, setGeocoding] = React.useState(false);
	const [geocodeError, setGeocodeError] = React.useState('');
	const [locationConfirmed, setLocationConfirmed] = React.useState(false);
	const [submitError, setSubmitError] = React.useState('');

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
			...DEFAULT_LOCATION,
		},
	});

	const lat = watch('latitude');
	const lng = watch('longitude');

	const handleGeocode = async () => {
		const address = watch('address');
		const zipcode = watch('zipcode');
		const merchantName = watch('name');

		if (!address || address.length < 5) {
			setGeocodeError('Masukkan alamat terlebih dahulu.');
			return;
		}

		const cleanedAddress = stripMerchantNamePrefix(address, merchantName);
		const queries = buildFallbackQueries(cleanedAddress, zipcode);

		setGeocoding(true);
		setGeocodeError('');

		let result = null;
		let attemptIndex = -1;
		for (let i = 0; i < queries.length; i++) {
			result = await geocodeAddress(queries[i]);
			if (result) {
				attemptIndex = i;
				break;
			}
		}
		setGeocoding(false);

		if (result) {
			setValue('latitude', result.latitude, { shouldDirty: true });
			setValue('longitude', result.longitude, { shouldDirty: true });
			setLocationConfirmed(false);
			if (attemptIndex <= 1) {
				setGeocodeError('');
			} else {
				setGeocodeError(
					'Detail blok/nomor tidak ditemukan di peta. Marker diarahkan ke area kelurahan/kecamatan terdekat — silakan geser ke posisi rumah/toko Anda.'
				);
			}
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
							setLocationConfirmed(false);
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

	const guardedSubmit = (values) => {
		setSubmitError('');
		if (!locationConfirmed) {
			setSubmitError(
				'Centang konfirmasi posisi marker di peta sebelum menyimpan.'
			);
			return;
		}
		return action(values);
	};

	return (
		<form
			onSubmit={handleSubmit(guardedSubmit)}
			className='grid gap-6 lg:grid-cols-2'>
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
						{geocoding ? 'Mencari...' : 'Cari di Peta'}
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
					location={{ latitude: lat, longitude: lng }}
					className='aspect-banner'
					setLocation={(location) => {
						setValue('latitude', location.latitude, { shouldDirty: true });
						setValue('longitude', location.longitude, { shouldDirty: true });
						setLocationConfirmed(false);
					}}
				/>
			</div>

			{submitError && (
				<div className='col-span-full text-red-600 text-sm'>{submitError}</div>
			)}

			<div className='col-span-full'>
				<label className='flex items-start gap-2 text-sm'>
					<input
						type='checkbox'
						className='mt-1'
						checked={locationConfirmed}
						onChange={(e) => setLocationConfirmed(e.target.checked)}
					/>
					<span>
						Saya sudah memeriksa posisi marker di peta dan memastikan lokasi
						sudah benar.
					</span>
				</label>
			</div>

			<div className='flex items-center gap-2 col-span-full'>
				<Button disabled={!locationConfirmed}>{label}</Button>
				<Button variant='outline' type='button' onClick={handleUseMyLocation}>
					Gunakan lokasi saya
				</Button>
			</div>
		</form>
	);
};

export default MerchantForm;
