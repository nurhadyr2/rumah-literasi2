import * as React from 'react';
import * as z from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Hint } from '@/components/ui/hint';
import { PAYMENT_STATUS } from '@/libs/constant';
import { Select } from '@/components/ui/select';

const STATUS_LIST = Object.values(PAYMENT_STATUS);

// const FinancialDonationSchema = z.object({
// 	amount: z.coerce.number().min(1),
// 	notes: z.string().min(3),
// });

const FinancialDonationSchema = z.object({
	amount: z.coerce.number().min(1.000, 'Jumlah donasi harus minimal Rp 1.000'),
	notes: z.string().optional(),
});

const EditSchema = FinancialDonationSchema.merge(
	z.object({
		status: z.enum(STATUS_LIST),
		acceptance_notes: z.string().optional(),
	})
);

const FinancialDonationForm = ({ initial, action, label }) => {
	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm({
		resolver: zodResolver(initial ? EditSchema : FinancialDonationSchema),
		defaultValues: initial || {
			amount: '',
			notes: '',
		},
	});

	return (
		<form onSubmit={handleSubmit(action)} className='grid gap-6 lg:grid-cols-2'>
			<div className='col-span-full'>
				<Label htmlFor='amount'>Jumlah Donasi</Label>
				<Input
				type='text'
				inputMode='numeric'
				placeholder='Masukkan jumlah donasi'
				{...register('amount')}
			/>
				<Hint>Jumlah donasi finansial dalam rupiah.</Hint>
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
				<Hint>Catatan tambahan mengenai donasi finansial.</Hint>
				{errors.notes && (
					<span className='text-red-500'>{errors.notes.message}</span>
				)}
			</div>

			{initial && (
				<React.Fragment>
					<div>
						<Label htmlFor='status'>Status</Label>
						<Select {...register('status')}>
							{STATUS_LIST.map((status) => (
								<option key={status} value={status}>
									{status}
								</option>
							))}
						</Select>
						<Hint>Status proses donasi finansial.</Hint>
						{errors.status && (
							<span className='text-red-500'>{errors.status.message}</span>
						)}
					</div>

					<div className='col-span-full'>
						<Label htmlFor='acceptance-notes'>Catatan Penerimaan</Label>
						<Textarea
							type='text'
							placeholder='Masukkan catatan penerimaan'
							{...register('acceptance_notes')}
						/>
						<Hint>Catatan mengenai penerimaan donasi ini.</Hint>
						{errors.acceptance_notes && (
							<span className='text-red-500'>
								{errors.acceptance_notes.message}
							</span>
						)}
					</div>
				</React.Fragment>
			)}

			<div className='col-span-full'>
				<Button>{label}</Button>
			</div>
		</form>
	);
};

export default FinancialDonationForm;