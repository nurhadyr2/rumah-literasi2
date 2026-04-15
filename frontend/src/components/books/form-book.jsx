import * as React from 'react';
import * as z from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { cn, formatByte } from '@/libs/utils';

const BookSchema = z.object({
	title: z.string().min(3),
	author: z.string().min(3),
	publisher: z.string().min(3),
	year: z.coerce.number(),
	language: z.string().min(3),
	amount: z.coerce.number().min(1),
	cover: z.any().refine(
		(files) => {
			if (!files) return true;

			const [file] = files;
			if (!file) return true;
			if (file.size > 2 * 1024 * 1024) return false;

			return file.type.startsWith('image/');
		},
		{ message: 'File harus berupa gambar dan berukuran kurang dari 2MB' }
	),
});

const BookForm = ({ initial, action, label }) => {
	const {
		register,
		handleSubmit,
		formState: { errors },
		watch,
	} = useForm({
		resolver: zodResolver(BookSchema),
		defaultValues: initial || {
			title: '',
			author: '',
			publisher: '',
			year: 0,
			language: '',
			amount: 0,
			cover: undefined,
		},
	});

	const cover = watch('cover');
	const selected = cover && cover[0].size;
	const filesize = selected ? formatByte(selected) : 0;

	return (
		<form onSubmit={handleSubmit(action)} className='grid gap-6 lg:grid-cols-2'>
			<div className='col-span-full'>
				<Label htmlFor='title'>Judul</Label>
				<Input
					type='text'
					placeholder='Masukkan judul'
					{...register('title')}
				/>
				{errors.title && (
					<span className='text-red-500'>{errors.title.message}</span>
				)}
			</div>

			<div className='col-span-2'>
				<Label htmlFor='author'>Penulis</Label>
				<Input
					type='text'
					placeholder='Masukkan penulis'
					{...register('author')}
				/>
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
				{errors.year && (
					<span className='text-red-500'>{errors.year.message}</span>
				)}
			</div>

			<div>
				<Label htmlFor='language'>Bahasa</Label>
				<Input
					type='text'
					placeholder='Masukkan bahasa'
					{...register('language')}
				/>
				{errors.language && (
					<span className='text-red-500'>{errors.language.message}</span>
				)}
			</div>

			<div>
				<Label htmlFor='amount'>Jumlah</Label>
				<Input
					type='number'
					placeholder='Masukkan jumlah'
					{...register('amount')}
				/>
				{errors.amount && (
					<span className='text-red-500'>{errors.amount.message}</span>
				)}
			</div>

			<div className='col-span-full'>
				<Label htmlFor='cover' className='flex justify-between w-full'>
					<span>Gambar Sampul</span>
					<span
						className={cn('font-light text-zinc-500', {
							'text-red-500': filesize > 2,
						})}>
						(Maks 2MB, Dipilih {filesize})
					</span>
				</Label>
				<Input
					type='file'
					accept='image/*'
					placeholder='Pilih gambar sampul'
					className='file:hidden'
					{...register('cover')}
				/>
				{errors.cover && (
					<span className='text-red-500'>{errors.cover.message}</span>
				)}
			</div>

			<div className='col-span-full'>
				<Button>{label}</Button>
			</div>
		</form>
	);
};

export default BookForm;