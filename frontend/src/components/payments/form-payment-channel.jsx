import * as React from 'react';
import * as z from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';

import { assetUrl } from '@/libs/utils';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Hint } from '@/components/ui/hint';

const PaymentChannelSchema = z
	.object({
		type: z.enum(['bank', 'ewallet', 'qr']),
		name: z.string().min(1, 'Nama wajib diisi'),
		account_number: z.string().optional(),
		account_holder: z.string().optional(),
		instructions: z.string().optional(),
		is_active: z.preprocess((v) => v === true || v === 'true', z.boolean()),
	})
	.superRefine((data, ctx) => {
		if (data.type !== 'qr') {
			if (!data.account_number) {
				ctx.addIssue({
					path: ['account_number'],
					code: z.ZodIssueCode.custom,
					message: 'Nomor rekening/e-wallet wajib diisi',
				});
			}
			if (!data.account_holder) {
				ctx.addIssue({
					path: ['account_holder'],
					code: z.ZodIssueCode.custom,
					message: 'Atas nama wajib diisi',
				});
			}
		}
	});

const PaymentChannelForm = ({ initial, action, label, submitting }) => {
	const [logo, setLogo] = React.useState(null);

	const {
		register,
		handleSubmit,
		watch,
		formState: { errors },
	} = useForm({
		resolver: zodResolver(PaymentChannelSchema),
		defaultValues: initial || {
			type: 'bank',
			name: '',
			account_number: '',
			account_holder: '',
			instructions: '',
			is_active: 'true',
		},
	});

	const type = watch('type');
	const isQr = type === 'qr';

	const onSubmit = (values) => {
		if (isQr && !logo && !initial?.logo) {
			toast.error('Gambar QR wajib diunggah');
			return;
		}

		const form = new FormData();
		form.append('type', values.type);
		form.append('name', values.name);
		form.append('account_number', isQr ? '' : values.account_number || '');
		form.append('account_holder', isQr ? '' : values.account_holder || '');
		form.append('instructions', values.instructions || '');
		form.append('is_active', values.is_active ? 'true' : 'false');
		if (logo) form.append('logo', logo);
		action(form);
	};

	return (
		<form onSubmit={handleSubmit(onSubmit)} className='grid gap-6 lg:grid-cols-2'>
			<div>
				<Label htmlFor='type'>Tipe</Label>
				<Select {...register('type')}>
					<option value='bank'>Bank</option>
					<option value='ewallet'>E-Wallet</option>
					<option value='qr'>QR</option>
				</Select>
				{errors.type && (
					<span className='text-red-500'>{errors.type.message}</span>
				)}
			</div>

			<div>
				<Label htmlFor='name'>Nama</Label>
				<Input placeholder='BCA, GoPay, QRIS, ...' {...register('name')} />
				{errors.name && (
					<span className='text-red-500'>{errors.name.message}</span>
				)}
			</div>

			{!isQr && (
				<React.Fragment>
					<div>
						<Label htmlFor='account_number'>Nomor Rekening / E-Wallet</Label>
						<Input placeholder='1234567890' {...register('account_number')} />
						{errors.account_number && (
							<span className='text-red-500'>
								{errors.account_number.message}
							</span>
						)}
					</div>

					<div>
						<Label htmlFor='account_holder'>Atas Nama</Label>
						<Input
							placeholder='Rumah Literasi'
							{...register('account_holder')}
						/>
						{errors.account_holder && (
							<span className='text-red-500'>
								{errors.account_holder.message}
							</span>
						)}
					</div>
				</React.Fragment>
			)}

			<div>
				<Label htmlFor='is_active'>Status</Label>
				<Select {...register('is_active')}>
					<option value='true'>Aktif</option>
					<option value='false'>Nonaktif</option>
				</Select>
				<Hint>Hanya channel aktif yang tampil ke donatur.</Hint>
			</div>

			<div className={isQr ? 'col-span-full' : ''}>
				<Label htmlFor='logo'>
					{isQr ? 'Gambar QR' : 'Logo (opsional)'}
				</Label>
				{initial?.logo && !logo && (
					<img
						src={assetUrl(initial.logo)}
						alt='Pratinjau'
						className='mb-2 max-h-40 rounded-lg border border-zinc-200 object-contain'
					/>
				)}
				<Input
					type='file'
					accept='image/*'
					onChange={(e) => setLogo(e.target.files?.[0] || null)}
				/>
				{isQr && <Hint>Unggah gambar kode QR untuk pembayaran.</Hint>}
			</div>

			{!isQr && (
				<div className='col-span-full'>
					<Label htmlFor='instructions'>Instruksi Pembayaran (opsional)</Label>
					<Textarea
						placeholder='Contoh: Transfer ke rekening atas nama Rumah Literasi.'
						{...register('instructions')}
					/>
					{errors.instructions && (
						<span className='text-red-500'>{errors.instructions.message}</span>
					)}
				</div>
			)}

			<div className='col-span-full'>
				<Button disabled={submitting}>{label}</Button>
			</div>
		</form>
	);
};

export default PaymentChannelForm;
