import * as React from 'react';
import * as z from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ImageUpload } from '@/components/ui/image-upload';
import { Hint } from '@/components/ui/hint';
import { cn, formatByte } from '@/libs/utils';

const EventSchema = z.object({
	title: z.string().min(3),
	description: z.string().min(3),
	date: z.coerce.date(),
	time: z.string(),
	location: z.string(),
	media: z
		.any()
		.refine(
			(files) => {
				if (!files) return true;

				const [file] = files;
				if (!file) return true;
				if (file.size > 2 * 1024 * 1024) return false;

				return file.type.startsWith('image/');
			},
			{ message: 'File harus berupa gambar dan berukuran kurang dari 2MB' }
		)
		.optional(),
});

const EventForm = ({ initial, action, label }) => {
	const {
		register,
		handleSubmit,
		formState: { errors },
		watch,
	} = useForm({
		resolver: zodResolver(EventSchema),
		defaultValues: initial || {
			title: '',
			description: '',
			date: new Date().toISOString().split('T')[0],
			time: '',
			location: '',
			media: undefined,
		},
	});

	const media = watch('media');
	const selected = media?.[0]?.size;
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
				<Hint>Judul acara yang akan diselenggarakan.</Hint>
				{errors.title && (
					<span className='text-red-500'>{errors.title.message}</span>
				)}
			</div>

			<div className='col-span-full'>
				<Label htmlFor='description'>Deskripsi</Label>
				<Textarea
					placeholder='Masukkan deskripsi'
					{...register('description')}
				/>
				<Hint>
					Deskripsi lengkap acara, termasuk tujuan dan kegiatan yang akan dilakukan.
				</Hint>
				{errors.description && (
					<span className='text-red-500'>{errors.description.message}</span>
				)}
			</div>

			<div>
				<Label htmlFor='date'>Tanggal</Label>
				<Input type='date' {...register('date')} />
				<Hint>Tanggal pelaksanaan acara.</Hint>
				{errors.date && (
					<span className='text-red-500'>{errors.date.message}</span>
				)}
			</div>

			<div>
				<Label htmlFor='time'>Waktu</Label>
				<Input type='time' {...register('time')} />
				<Hint>Waktu pelaksanaan acara.</Hint>
				{errors.time && (
					<span className='text-red-500'>{errors.time.message}</span>
				)}
			</div>

			<div className='col-span-full'>
				<Label htmlFor='location'>Lokasi</Label>
				<Textarea
					type='text'
					placeholder='Masukkan lokasi acara'
					{...register('location')}
				/>
				<Hint>
					Alamat lengkap atau detail lokasi tempat acara akan diselenggarakan.
				</Hint>
				{errors.location && (
					<span className='text-red-500'>{errors.location.message}</span>
				)}
			</div>

			<div className='col-span-full'>
				<Label htmlFor='media' className='flex justify-between w-full'>
					<span>Gambar Acara</span>
					<span
						className={cn('font-light text-zinc-500', {
							'text-red-500': filesize > 2,
						})}>
						(Maks 2MB, Dipilih {filesize})
					</span>
				</Label>
				<ImageUpload
					name='media'
					accept='image/*'
					defaultValue={media}
					{...register('media')}
				/>
				<Hint>Unggah gambar yang merepresentasikan acara (maks 2MB).</Hint>
				{errors.media && (
					<span className='text-red-500'>{errors.media.message}</span>
				)}
			</div>

			<div className='col-span-full'>
				<Button>{label}</Button>
			</div>
		</form>
	);
};

export default EventForm;