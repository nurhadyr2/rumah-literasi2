import * as React from 'react';

import { cn } from '@/libs/utils';

const DeliveryHistory = ({ histories, className }) => {
	const items = histories.map((item) => ({
		...item,
		date: new Date(item.updated_at),
	}));

	return (
		<div className='border border-zinc-200 rounded-2xl'>
			<div className='p-4 text-lg font-semibold '>
				<h3>Detail Riwayat</h3>
			</div>

			<div
				className={cn(
					'grid gap-2 p-4 border-t text-zinc-600 border-zinc-200',
					className
				)}>
				{items.map((item) => {
					const date = item.date.toLocaleDateString();

					return (
						<div
							key={item.date}
							className='flex items-start gap-6 text-sm font-medium'>
							<span className='text-primary-500'>{date}</span>
							<p>{item.note}</p>
						</div>
					);
				})}
			</div>
		</div>
	);
};

export default DeliveryHistory;
