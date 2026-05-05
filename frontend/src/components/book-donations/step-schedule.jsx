import * as React from 'react';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { MapPin, Truck, Clock, CalendarDays, AlertCircle } from 'lucide-react';

import axios from '@/libs/axios';
import { useAsync } from '@/hooks/use-async';
import { useDonation, STEPS, DELIVERY_METHODS } from '@/stores/use-donation';
import { pickupScheduleSchema, dropoffScheduleSchema } from '@/libs/schemas';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Loading } from '@/components/loading';
import { Error } from '@/components/error';
import { cn } from '@/libs/utils';

const TIME_SLOTS = [
	{ value: '08:00-10:00', label: '08.00 – 10.00' },
	{ value: '10:00-12:00', label: '10.00 – 12.00' },
	{ value: '12:00-14:00', label: '12.00 – 14.00' },
	{ value: '14:00-16:00', label: '14.00 – 16.00' },
	{ value: '16:00-18:00', label: '16.00 – 18.00' },
];

const minDate = () => {
	const d = new Date();
	d.setDate(d.getDate() + 1);
	return d.toISOString().split('T')[0];
};

const PickupForm = ({ onSubmit, onBack, defaultValues }) => {
	const {
		register,
		handleSubmit,
		watch,
		setValue,
		formState: { errors },
	} = useForm({
		resolver: zodResolver(pickupScheduleSchema),
		defaultValues: defaultValues || {
			type: 'pickup',
			date: '',
			time_slot: '',
			note: '',
		},
	});

	const selectedSlot = watch('time_slot');

	return (
		<form onSubmit={handleSubmit(onSubmit)} className='grid gap-6'>
			<input type='hidden' {...register('type')} value='pickup' />

			<div>
				<Label>Tanggal Pickup</Label>
				<Input type='date' min={minDate()} {...register('date')} />
				{errors.date && (
					<span className='text-sm text-red-500 mt-1 block'>
						{errors.date.message}
					</span>
				)}
			</div>

			<div>
				<Label>Waktu Pickup</Label>
				<div className='grid grid-cols-2 sm:grid-cols-3 gap-2 mt-1'>
					{TIME_SLOTS.map((slot) => (
						<button
							key={slot.value}
							type='button'
							onClick={() =>
								setValue('time_slot', slot.value, { shouldValidate: true })
							}
							className={cn(
								'flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border-2 text-sm font-medium transition-all',
								selectedSlot === slot.value
									? 'border-primary-500 bg-primary-50 text-primary-700'
									: 'border-zinc-200 hover:border-primary-300 text-zinc-600'
							)}>
							<Clock className='size-3.5' />
							{slot.label}
						</button>
					))}
				</div>
				<input type='hidden' {...register('time_slot')} />
				{errors.time_slot && (
					<span className='text-sm text-red-500 mt-1 block'>
						{errors.time_slot.message}
					</span>
				)}
			</div>

			<div>
				<Label>Catatan untuk Kurir (opsional)</Label>
				<Textarea
					placeholder='Contoh: Paket ada di depan pintu, hubungi dulu sebelum datang'
					{...register('note')}
				/>
			</div>

			<div className='flex items-center gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-800'>
				<AlertCircle className='size-4 flex-none' />
				<p>Kurir akan menghubungi Anda sebelum proses pickup dilakukan.</p>
			</div>

			<div className='flex items-center gap-3'>
				<Button type='button' variant='outline' onClick={onBack}>
					Kembali
				</Button>
				<Button type='submit'>Konfirmasi Jadwal</Button>
			</div>
		</form>
	);
};

const DropoffForm = ({ onSubmit, onBack, detail, defaultValues }) => {
	const [selected, setSelected] = React.useState(
		defaultValues?.point_id ? defaultValues : null
	);

	const {
		data: points,
		error,
		loading,
	} = useAsync(
		() =>
			axios.post('/deliveries/dropoff-points', {
				detail,
			}),
		[detail],
		{
			initial: [],
			onSuccess: ({ data: result }) => result.data,
			onError: (error) => {
				toast.error('Gagal mengambil titik drop off', {
					description: error.response?.data?.message || error.message,
				});
			},
		}
	);

	const handleSubmit = () => {
		if (!selected) {
			toast.error('Pilih titik drop off terlebih dahulu');
			return;
		}
		onSubmit({
			type: 'drop_off',
			point_id: selected.id,
			point_name: selected.name,
			point_address: selected.address,
		});
	};

	return (
		<div className='grid gap-6'>
			<Loading loading={loading} />
			<Error error={!loading && error} />

			{!loading && !error && points.length === 0 && (
				<div className='flex flex-col items-center gap-3 py-12 text-center text-zinc-500'>
					<MapPin className='size-10 text-zinc-300' />
					<p className='font-medium'>Tidak ada titik drop off tersedia</p>
					<p className='text-sm'>
						Coba gunakan metode pickup sebagai alternatif.
					</p>
				</div>
			)}

			<div className='grid gap-3'>
				{points.map((point) => {
					const isSelected = selected?.id === point.id;
					return (
						<button
							key={point.id}
							type='button'
							onClick={() => setSelected(point)}
							className={cn(
								'w-full text-left border-2 rounded-2xl p-4 transition-all hover:shadow-md hover:border-primary-400',
								isSelected
									? 'border-primary-500 bg-primary-50'
									: 'border-zinc-200 bg-white'
							)}>
							<div className='flex items-start gap-3'>
								<div
									className={cn(
										'flex-none flex items-center justify-center rounded-xl size-10 mt-0.5',
										isSelected
											? 'bg-primary-500 text-white'
											: 'bg-zinc-100 text-zinc-500'
									)}>
									<MapPin className='size-5' />
								</div>
								<div>
									<p className='font-semibold text-sm'>{point.name}</p>
									<p className='text-sm text-zinc-500 mt-0.5'>
										{point.address}
									</p>
									{point.open_hours && (
										<p className='text-xs text-zinc-400 mt-1 flex items-center gap-1'>
											<Clock className='size-3' />
											{point.open_hours}
										</p>
									)}
								</div>
							</div>
						</button>
					);
				})}
			</div>

			<div className='flex items-center gap-3'>
				<Button type='button' variant='outline' onClick={onBack}>
					Kembali
				</Button>
				<Button onClick={handleSubmit} disabled={!selected}>
					Konfirmasi Lokasi Drop Off
				</Button>
			</div>
		</div>
	);
};

const StepSchedule = () => {
	const {
		method,
		detail,
		schedule: savedSchedule,
		setSchedule,
		route,
	} = useDonation();

	const handleSubmit = (data) => {
		setSchedule(data);
		route(STEPS.REVIEW);
	};

	const handleBack = () => {
		route(STEPS.COURIER);
	};

	return (
		<div className='grid gap-6 max-w-2xl'>
			<div className='flex items-center gap-2 text-sm text-zinc-500 bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3'>
				{method === DELIVERY_METHODS.PICKUP ? (
					<>
						<CalendarDays className='size-4 text-primary-500 flex-none' />
						<span>
							Jadwalkan <strong className='text-zinc-700'>waktu pickup</strong>{' '}
							buku donasi Anda
						</span>
					</>
				) : (
					<>
						<MapPin className='size-4 text-primary-500 flex-none' />
						<span>
							Pilih <strong className='text-zinc-700'>titik drop off</strong>{' '}
							terdekat
						</span>
					</>
				)}
			</div>

			{method === DELIVERY_METHODS.PICKUP ? (
				<PickupForm
					onSubmit={handleSubmit}
					onBack={handleBack}
					defaultValues={
						savedSchedule?.type === 'pickup' ? savedSchedule : null
					}
				/>
			) : (
				<DropoffForm
					onSubmit={handleSubmit}
					onBack={handleBack}
					detail={detail}
					defaultValues={
						savedSchedule?.type === 'dropoff' ? savedSchedule : null
					}
				/>
			)}
		</div>
	);
};

export default StepSchedule;
