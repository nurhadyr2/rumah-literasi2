import * as React from 'react';

import { cn } from '@/libs/utils';

const DeliveryDetail = ({ delivery, className }) => {
	const details = [
		{
			label: 'Kode Perusahaan',
			value: delivery.courier.company,
		},
		{
			label: 'ID Pengiriman',
			value: delivery.waybill_id,
		},
		{
			label: 'Penerima',
			value: delivery.destination.contact_name,
		},
		{
			label: 'Alamat Penerima',
			value: delivery.destination.address,
		},
		{
			label: 'Pengirim',
			value: delivery.origin.contact_name,
		},
		{
			label: 'Alamat Pengirim',
			value: delivery.origin.address,
		},
		{
			label: 'Status',
			value: delivery.status,
		},
	];

	return (
		<div className='border border-zinc-200 rounded-2xl'>
			<div className='p-4 text-lg font-semibold '>
				<h3>Detail Pengiriman</h3>
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

export default DeliveryDetail;