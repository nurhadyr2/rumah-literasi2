import * as React from 'react';
import { toast } from 'sonner';
import { X } from 'lucide-react';
import { Link, useNavigate } from 'react-router';

import { useConfirm } from '@/hooks/use-confirm';
import { useDonation } from '@/stores/use-donation';

import { DonationItem } from '@/components/book-donations/donation-item-card';
import { Button } from '@/components/ui/button';
import {
	Heading,
	HeadingDescription,
	HeadingTitle,
} from '@/components/ui/heading';
import { Empty } from '@/components/empty';

const CreateBookDonation = () => {
	const navigate = useNavigate();
	const { confirm } = useConfirm();
	const { items, remove, reset } = useDonation();

	const handleReset = () => {
		confirm({
			title: 'Confirm Action',
			variant: 'destructive',
			description: 'Are you sure you want to reset this form?',
		})
			.then(async () => {
				reset();
			})
			.catch(() => {
				// pass
			});
	};

	return (
		<div className='grid gap-8'>
			<Heading>
				<HeadingTitle>Buat Donasi Buku</HeadingTitle>
				<HeadingDescription>
					Buat donasi buku untuk mendukung kegiatan literasi baca-tulis di Taman Mraen Mimpi. Donasi buku Anda akan digunakan untuk membantu menyediakan bahan bacaan yang berkualitas bagi anak-anak dan komunitas yang membutuhkan. Terima kasih atas dukungan Anda!
				</HeadingDescription>
			</Heading>

			<div className='grid items-start grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5'>
				{items.map((item) => (
					<div className='relative group' key={item.id}>
						<Link to={'/dashboard/book-donations/create/' + item.id + '/edit'}>
							<DonationItem item={item} />
						</Link>
						<div className='absolute top-0 right-0 m-4'>
							<button
								type='button'
								onClick={() => remove(item.id)}
								className='items-center justify-center hidden bg-white rounded-full size-8 group-hover:flex'>
								<X className='size-4' />
							</button>
						</div>
					</div>
				))}
				<Empty empty={!items.length} />
			</div>

			<div className='col-span-full'>
				<div className='flex items-center gap-2'>
					<Button
						onClick={() => {
							if (!items.length)
								return toast.error('Please add items first', {
									description: 'You need to add at least one item',
								});
							navigate('/dashboard/book-donations/create/detail');
						}}>
						Tambah Detail Donasi
					</Button>

					<Link to='/dashboard/book-donations/create/append'>
						<Button variant='outline'>Tambah item</Button>
					</Link>
					<Button variant='destructive' onClick={() => handleReset()}>
						Hapus
					</Button>
				</div>
			</div>
		</div>
	);
};

export default CreateBookDonation;
