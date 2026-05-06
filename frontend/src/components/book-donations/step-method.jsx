import * as React from 'react';
import {
	Package,
	MapPin,
	ArrowRight,
	Truck,
	CheckCircle2,
	Info,
} from 'lucide-react';

import { useDonation, STEPS, DELIVERY_METHODS } from '@/stores/use-donation';
import { Button } from '@/components/ui/button';
import { cn } from '@/libs/utils';

const METHOD_OPTIONS = [
	{
		id: DELIVERY_METHODS.PICKUP,
		label: 'Pickup',
		sublabel: 'Kurir datang ke lokasi Anda',
		description:
			'Jadwalkan waktu pickup yang sesuai, kurir akan datang ke alamat Anda untuk mengambil donasi buku.',
		icon: Truck,
		pros: [
			'Tidak perlu keluar rumah',
			'Bisa jadwalkan waktu',
			'Cocok untuk paket besar',
		],
		note: null,
	},
	{
		id: DELIVERY_METHODS.DROPOFF,
		label: 'Drop Off',
		sublabel: 'Antar ke titik pengiriman terdekat',
		description:
			'Pilih titik drop off terdekat di sekitar Anda, antar paket langsung ke sana.',
		icon: MapPin,
		pros: [
			'Lebih fleksibel waktu',
			'Banyak titik lokasi',
			'Proses lebih cepat',
		],
		note: 'Ketersediaan drop off bergantung pada kurir yang tersedia di area Anda. Akan ditampilkan di langkah berikutnya.',
	},
];

const StepMethod = () => {
	const { method, setMethod, route } = useDonation();
	const [selected, setSelected] = React.useState(method || null);

	const handleContinue = () => {
		if (!selected) return;
		setMethod(selected);
		route(STEPS.DETAIL);
	};

	const handleBack = () => {
		route(STEPS.ITEMS);
	};

	return (
		<div className='grid gap-8 max-w-2xl'>
			<div className='grid gap-4'>
				{METHOD_OPTIONS.map((opt) => {
					const Icon = opt.icon;
					const isSelected = selected === opt.id;

					return (
						<button
							key={opt.id}
							type='button'
							onClick={() => setSelected(opt.id)}
							className={cn(
								'w-full text-left p-6 rounded-2xl border-2 transition-all duration-200',
								'hover:border-primary-400 hover:shadow-md',
								isSelected
									? 'border-primary-500 bg-primary-50 shadow-md'
									: 'border-zinc-200 bg-white'
							)}>
							<div className='flex items-start gap-4'>
								<div
									className={cn(
										'flex-none flex items-center justify-center rounded-xl size-12 transition-colors',
										isSelected
											? 'bg-primary-500 text-white'
											: 'bg-zinc-100 text-zinc-500'
									)}>
									<Icon className='size-6' />
								</div>

								<div className='flex-1 min-w-0'>
									<div className='flex items-center justify-between gap-2'>
										<div>
											<h3 className='font-semibold text-base'>{opt.label}</h3>
											<p className='text-sm text-zinc-500'>{opt.sublabel}</p>
										</div>
										{isSelected && (
											<CheckCircle2 className='flex-none size-5 text-primary-500' />
										)}
									</div>

									<p className='mt-2 text-sm text-zinc-600'>
										{opt.description}
									</p>

									<ul className='mt-3 flex flex-wrap gap-2'>
										{opt.pros.map((pro) => (
											<li
												key={pro}
												className={cn(
													'text-xs px-2 py-1 rounded-full border',
													isSelected
														? 'border-primary-200 bg-primary-100 text-primary-700'
														: 'border-zinc-200 bg-zinc-50 text-zinc-600'
												)}>
												{pro}
											</li>
										))}
									</ul>

									{opt.note && (
										<div className='mt-3 flex items-start gap-2 text-xs text-zinc-500'>
											<Info className='size-3.5 flex-none mt-0.5 text-zinc-400' />
											<span>{opt.note}</span>
										</div>
									)}
								</div>
							</div>
						</button>
					);
				})}
			</div>

			<div className='flex items-center gap-3'>
				<Button variant='outline' onClick={handleBack}>
					Kembali
				</Button>
				<Button
					onClick={handleContinue}
					disabled={!selected}
					className='flex items-center gap-2'>
					Lanjutkan
					<ArrowRight className='size-4' />
				</Button>
			</div>
		</div>
	);
};

export default StepMethod;
