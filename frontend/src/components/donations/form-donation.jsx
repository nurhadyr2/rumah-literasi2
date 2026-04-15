import * as React from 'react';
import * as z from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

const DonationSchema = z.object({
	amount: z.coerce.number().min(1),
	notes: z.string().min(3),
});

const EditSchema = DonationSchema.merge(
	z.object({
		status: z.enum(['pending', 'success', 'failed']),
	})
);

const DonationForm = ({ initial, action, label }) => {
	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm({
		resolver: zodResolver(initial ? EditSchema : DonationSchema),
		defaultValues: initial || {
			amount: 0,
			notes: '',
		},
	});

	return (
		<form onSubmit={handleSubmit(action)} className='grid lg:grid-cols-2 gap-6'>
			<div className='col-span-full'>
				<Label htmlFor='amount'>Jumlah Donasi</Label>
				<Input
					type='number'
					placeholder='Masukkan jumlah donasi'
					{...register('amount')}
				/>
				{errors.amount && (
					<span className='text-red-500'>{errors.amount.message}</span>
				)}
			</div>

			<div className='col-span-full'>
				<Label htmlFor='notes'>Catatan</Label>
				<Textarea
					type='text'
					placeholder='Masukkan catatan'
					{...register('notes')}
				/>
				{errors.notes && (
					<span className='text-red-500'>{errors.notes.message}</span>
				)}
			</div>

			{initial && (
				<div>
					<Label htmlFor='status'>Status</Label>

					<select
						className='block w-full p-3 border shadow-sm border-zinc-300 rounded-xl focus:border-primary-500 focus:ring-primary-500 sm:text-sm bg-zinc-100'
						{...register('status')}>
						<option value='pending'>Menunggu</option>
						<option value='success'>Berhasil</option>
						<option value='failed'>Gagal</option>
					</select>

					{errors.status && (
						<span className='text-red-500'>{errors.status.message}</span>
					)}
				</div>
			)}

			<div className='col-span-full'>
				<Button>{label}</Button>
			</div>
		</form>
	);
};

export default DonationForm;