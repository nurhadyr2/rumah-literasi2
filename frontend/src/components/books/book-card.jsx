import * as React from 'react';

import { cn } from '@/libs/utils';
import { Badge } from '@/components/ui/badge';

const BookCard = React.forwardRef(({ book, className, ...props }, ref) => {
	if (book.amount <= 0) return null;

	return (
		<article
			ref={ref}
			className={cn('flex flex-col gap-2', className)}
			{...props}>
			<div className='relative overflow-hidden cursor-pointer rounded-xl aspect-book'>
				<div className='absolute top-0 right-0 m-2'>
					<Badge>{book.amount} buku</Badge>
				</div>
				<img
					src='/cover.webp'
					alt='Book cover'
					className='absolute inset-0 object-cover pointer-events-none size-full mix-blend-multiply'
				/>
				<img
					src={book.cover}
					alt={book.title}
					className='object-cover size-full'
				/>
			</div>
			<h3 className='font-semibold truncate'>{book.title}</h3>
		</article>
	);
});

BookCard.displayName = 'BookCard';

export { BookCard };
