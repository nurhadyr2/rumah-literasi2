import { Info } from 'lucide-react';

import { cn } from '@/libs/utils';

const ShippingFeeNote = ({ className }) => (
	<div
		className={cn(
			'flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800',
			className
		)}>
		<Info className='mt-0.5 size-4 flex-none' />
		<p>
			Nominal ongkir adalah estimasi berdasarkan berat dan ukuran paket yang
			Anda isi. Biaya dapat berubah jika hasil penimbangan atau pengukuran di
			jasa ekspedisi berbeda dari data tersebut. Pastikan berat dan ukuran
			paket sesuai agar ongkir tidak berubah.
		</p>
	</div>
);

export default ShippingFeeNote;
