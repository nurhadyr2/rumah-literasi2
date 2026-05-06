import * as React from 'react';
import { toast } from 'sonner';
import { cn, currency } from '@/libs/utils';

import axios from '@/libs/axios';
import { useDonation, STEPS, DELIVERY_METHODS } from '@/stores/use-donation';
import { useAsync } from '@/hooks/use-async';

import { Button } from '@/components/ui/button';
import { Loading } from '@/components/loading';
import { Error } from '@/components/error';
import { Badge } from '@/components/ui/badge';
import { Truck, MapPin, Clock, Package, AlertCircle } from 'lucide-react';

const StepCourier = () => {
	const {
		detail,
		method,
		courier: savedCourier,
		setCourier,
		setMethod,
		route,
	} = useDonation();

	const [selected, setSelected] = React.useState(
		savedCourier?.courier_code ? savedCourier : null
	);

	const { data, error, loading } = useAsync(
		() =>
			axios.post('/deliveries/couriers', {
				detail,
				method,
			}),
		[detail, method],
		{
			initial: [],
			onSuccess: ({ data: result }) => result.data,
			onError: (error) => {
				toast.error('Gagal mengambil data kurir', {
					description: error.response?.data?.message || error.message,
				});
			},
		}
	);

	const filteredData = React.useMemo(() => {
		if (!data || !data.length) return [];

		if (method === DELIVERY_METHODS.PICKUP) {
			return data.filter((c) =>
				c.available_collection_method?.includes('pickup')
			);
		}

		if (method === DELIVERY_METHODS.DROPOFF) {
			return data.filter((c) =>
				c.available_collection_method?.includes('drop_off')
			);
		}

		return data;
	}, [data, method]);

	const isDropoffUnavailable =
		!loading &&
		!error &&
		method === DELIVERY_METHODS.DROPOFF &&
		data.length > 0 &&
		filteredData.length === 0;

	const handleContinue = () => {
		if (!selected) return;
		setCourier({
			company: selected.courier_name,
			courier_code: selected.courier_code,
			courier_service_code: selected.courier_service_code,
			shipping_fee: selected.price,
			duration: selected.duration,
			type: selected.courier_service_name,
		});
		route(STEPS.SCHEDULE);
	};

	const handleBack = () => {
		route(STEPS.DETAIL);
	};

	const handleSwitchToPickup = () => {
		setMethod(DELIVERY_METHODS.PICKUP);
		setSelected(null);
	};

	return (
		<div className='grid gap-6'>
			<div className='flex items-center gap-2 text-sm text-zinc-500 bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3'>
				{method === DELIVERY_METHODS.PICKUP ? (
					<Truck className='size-4 text-primary-500 flex-none' />
				) : (
					<MapPin className='size-4 text-primary-500 flex-none' />
				)}
				<span>
					Menampilkan kurir yang tersedia untuk{' '}
					<strong className='text-zinc-700'>
						{method === DELIVERY_METHODS.PICKUP ? 'Pickup' : 'Drop Off'}
					</strong>
				</span>
			</div>

			<Loading loading={loading} />
			<Error error={!loading && error} />

			{isDropoffUnavailable && (
				<div className='flex flex-col gap-4 items-start p-5 bg-amber-50 border border-amber-200 rounded-2xl text-sm text-amber-800'>
					<div className='flex items-start gap-3'>
						<AlertCircle className='size-5 flex-none mt-0.5' />
						<div>
							<p className='font-semibold mb-1'>
								Drop Off tidak tersedia di area ini
							</p>
							<p className='text-amber-700'>
								Tidak ada kurir yang mendukung drop off untuk rute pengiriman
								ini. Silakan gunakan metode Pickup agar kurir datang ke lokasi
								Anda.
							</p>
						</div>
					</div>
					<Button variant='outline' onClick={handleSwitchToPickup}>
						Ganti ke Pickup
					</Button>
				</div>
			)}

			{!loading && !error && data.length === 0 && (
				<div className='flex flex-col items-center gap-3 py-12 text-center text-zinc-500'>
					<Package className='size-10 text-zinc-300' />
					<p className='font-medium'>Tidak ada kurir tersedia</p>
					<p className='text-sm'>
						Coba periksa kembali alamat dan detail paket Anda.
					</p>
				</div>
			)}

			<div className='grid gap-3 md:grid-cols-2 lg:grid-cols-3'>
				{filteredData.map((courier) => {
					const isSelected =
						selected?.courier_code === courier.courier_code &&
						selected?.courier_service_code === courier.courier_service_code;

					return (
						<button
							key={courier.id}
							type='button'
							onClick={() => setSelected(courier)}
							className={cn(
								'text-left border-2 rounded-2xl p-4 transition-all duration-200 hover:shadow-md hover:border-primary-400',
								isSelected
									? 'border-primary-500 bg-primary-50'
									: 'border-zinc-200 bg-white'
							)}>
							<div className='flex items-start justify-between gap-2 mb-3'>
								<div>
									<p className='font-semibold text-sm'>
										{courier.courier_name}
									</p>
									<p className='text-xs text-primary-500 font-medium'>
										{courier.courier_service_name}
									</p>
								</div>
								{isSelected && (
									<Badge variant='primary' className='flex-none text-xs'>
										Dipilih
									</Badge>
								)}
							</div>

							<div className='space-y-1.5 text-xs text-zinc-600'>
								<div className='flex items-center justify-between'>
									<span className='flex items-center gap-1.5'>
										<Clock className='size-3' />
										Estimasi
									</span>
									<span className='font-medium text-zinc-800'>
										{courier.duration}
									</span>
								</div>
								<div className='flex items-center justify-between'>
									<span className='flex items-center gap-1.5'>
										<Package className='size-3' />
										Harga
									</span>
									<span className='font-semibold text-primary-600'>
										{currency(courier.price)}
									</span>
								</div>
							</div>
						</button>
					);
				})}
			</div>

			<div className='flex items-center gap-3 pt-2'>
				<Button variant='outline' onClick={handleBack}>
					Kembali
				</Button>
				<Button
					onClick={handleContinue}
					disabled={!selected || isDropoffUnavailable}>
					Pilih & Lanjutkan
				</Button>
			</div>
		</div>
	);
};

export default StepCourier;
