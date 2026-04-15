import * as React from 'react';
import * as z from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { STEPS, useTransactionStore } from '@/store/use-transactions';

import { Map } from '@/components/map';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useConfirm } from '@/hooks/use-confirm';

const TransactionSchema = z.object({
	name: z.string().min(3),
	phone: z.string().min(11),
	address: z.string().min(3),
	note: z.string().optional(),
	latitude: z.coerce.number(),
	longitude: z.coerce.number(),
});

const StepRecipient = () => {
	const { confirm } = useConfirm();
	const { recipient, setRecipient, route } = useTransactionStore();

	const {
		watch,
		setValue,
		register,
		handleSubmit,
		formState: { errors },
	} = useForm({
		resolver: zodResolver(TransactionSchema),
		defaultValues: recipient,
	});

	const onSubmit = async (data) => {
		setRecipient({
			...data,
			borrowed_date: new Date().toISOString().split('T')[0],
		});
		route(STEPS.COURIER);
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
							alert('Tidak dapat mengambil lokasi Anda.');
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
		<form
			onSubmit={handleSubmit(onSubmit)}
			className='grid gap-6 lg:grid-cols-2'>
			<div>
				<Label htmlFor='name'>Nama</Label>
				<Input
					type='text'
					placeholder='Masukkan nama'
					{...register('name')}
				/>
				{errors.name && (
					<span className='text-red-500'>{errors.name.message}</span>
				)}
			</div>

			<div>
				<Label htmlFor='phone'>No. Telepon</Label>
				<Input
					type='text'
					placeholder='Masukkan nomor telepon'
					{...register('phone')}
				/>
				{errors.phone && (
					<span className='text-red-500'>{errors.phone.message}</span>
				)}
			</div>

			<div>
				<Label htmlFor='address'>Alamat</Label>
				<Textarea placeholder='Masukkan alamat' {...register('address')} />
				{errors.address && (
					<span className='text-red-500'>{errors.address.message}</span>
				)}
			</div>

			<div>
				<Label htmlFor='note'>Catatan</Label>
				<Textarea placeholder='Masukkan catatan' {...register('note')} />
				{errors.note && (
					<span className='text-red-500'>{errors.note.message}</span>
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

			<div className='flex items-center justify-end gap-2 col-span-full'>
				<Button variant='outline' onClick={() => route(STEPS.BOOKS)}>
					Kembali
				</Button>
				<Button variant='outline' type='button' onClick={handleUseMyLocation}>
					Gunakan lokasi saya
				</Button>
				<Button>Lanjut</Button>
			</div>
		</form>
	);
};

export default StepRecipient;