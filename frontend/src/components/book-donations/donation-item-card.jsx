import * as React from 'react';

import { cn, colorHash } from '@/libs/utils';
import { Badge } from '@/components/ui/badge';

const DonationItem = React.forwardRef(({ item, className, ...props }, ref) => {
	if (item.amount <= 0) return null;

	return (
		<article
			ref={ref}
			className={cn('flex flex-col gap-2', className)}
			{...props}>
			<div className='relative overflow-hidden rounded-xl aspect-book'>
				<div className='absolute bottom-0 left-0 m-4'>
					<Badge>{item.amount} items</Badge>
				</div>

				<div className='absolute w-full px-6 py-6 -translate-y-1/2 top-1/2 bg-white/50'>
					<h5
						className='font-semibold line-clamp-2 leading-tight'
						title={item.title}>
						{item.title}
					</h5>
					<p
						className='text-sm line-clamp-1 opacity-80 mt-1'
						title={item.author}>
						{item.author}
					</p>
				</div>

				<img
					src='/cover.webp'
					alt='item cover'
					className='absolute inset-0 object-cover pointer-events-none size-full mix-blend-multiply'
				/>
				<div
					className='size-full bg-[var(--background)] bg-cover bg-center'
					style={{
						'--background': colorHash(item.title),
					}}
				/>
			</div>
		</article>
	);
});

DonationItem.displayName = 'DonationItem';

export { DonationItem };
