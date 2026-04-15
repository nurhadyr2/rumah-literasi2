import * as React from 'react';

import { cn } from '@/libs/utils';

const CourierDetail = ({ courier, className }) => {
	const details = [
		{
			label: 'Perusahaan Kurir',
			value: courier.courier_company.toUpperCase(),
		},
		{
			label: 'Jenis Layanan',
			value: courier.courier_type.toUpperCase(),
		},
		{
			label: 'Biaya Pengiriman',
			value: courier.delivery_fee,
		},
		{
			label: 'Estimasi Pengiriman',
			value: courier.delivery_eta,
		},
	];

	return (
		<div className='border border-zinc-200 rounded-2xl'>
			<div className='p-4 text-lg font-semibold '>
				<h3>Detail Kurir</h3>
			</div>

			<div
				className={cn(
					'grid gap-2 p-4 border-t text-zinc-600 border-zinc-200',
					className
				)}>
				{details.map((detail) => (
					<dl key={detail.label} className='text-sm font-medium'>
						<dt className='text-black'>{detail.label}</dt>
						<dd
							className={cn('text-primary-500', {
								'text-zinc-500': detail.muted,
							})}>
							{detail.value}
						</dd>
					</dl>
				))}
			</div>
		</div>
	);
};

export default CourierDetail;