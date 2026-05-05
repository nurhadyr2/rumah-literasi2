import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Link } from 'react-router';
import { itemSchema } from '@/libs/schemas';
import { Hint } from '@/components/ui/hint';

const DonationItemForm = ({ initial, action, label }) => {
	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm({
		resolver: zodResolver(itemSchema),
		defaultValues: initial || {
			title: '',
			author: '',
			publisher: '',
			year: new Date().getFullYear(),
			amount: 0,
		},
	});

	return (
		<form onSubmit={handleSubmit(action)} className='grid gap-6 lg:grid-cols-2'>
			<div className='col-span-full'>
				<Label htmlFor='title'>Judul</Label>
				<Input
					type='text'
					placeholder='Masukkan judul'
					{...register('title')}
				/>
				<Hint>Nama publikasi yang ingin Anda donasikan.</Hint>
				{errors.title && (
					<span className='text-red-500'>{errors.title.message}</span>
				)}
			</div>

			<div className='col-span-2'>
				<Label htmlFor='author'>Penulis</Label>
				<Input
					type='text'
					placeholder='Masukkan nama penulis'
					{...register('author')}
				/>
				<Hint>Penulis atau pembuat dari publikasi ini.</Hint>
				{errors.author && (
					<span className='text-red-500'>{errors.author.message}</span>
				)}
			</div>

			<div>
				<Label htmlFor='publisher'>Penerbit</Label>
				<Input
					type='text'
					placeholder='Masukkan penerbit'
					{...register('publisher')}
				/>
				<Hint>Perusahaan yang menerbitkan karya ini.</Hint>
				{errors.publisher && (
					<span className='text-red-500'>{errors.publisher.message}</span>
				)}
			</div>

			<div>
				<Label htmlFor='year'>Tahun</Label>
				<Input
					type='number'
					placeholder='Masukkan tahun'
					{...register('year')}
				/>
				<Hint>Tahun publikasi ini diterbitkan.</Hint>
				{errors.year && (
					<span className='text-red-500'>{errors.year.message}</span>
				)}
			</div>

			<div>
				<Label htmlFor='amount'>Jumlah</Label>
				<Input
					type='number'
					placeholder='Masukkan jumlah'
					{...register('amount')}
				/>
				<Hint>Jumlah buku yang Anda donasikan.</Hint>
				{errors.amount && (
					<span className='text-red-500'>{errors.amount.message}</span>
				)}
			</div>

			<div className='col-span-full'>
				<div className='flex items-center gap-2'>
					<Button>{label}</Button>
					<Link to='/dashboard/book-donations/create'>
						<Button variant='outline'>Batal</Button>
					</Link>
				</div>
			</div>
		</form>
	);
};

export default DonationItemForm;