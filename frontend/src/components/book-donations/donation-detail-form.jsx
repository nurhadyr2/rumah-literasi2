import useSWR from 'swr';
import { Link } from 'react-router';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { detailSchema } from '@/libs/schemas';
import { Select } from '@/components/ui/select';
import { useResultState } from '@/hooks/use-result-state';
import { Hint } from '@/components/ui/hint';

const DonationDetailForm = ({ initial, action, previous, label }) => {
	const { error, data, isLoading: loading } = useSWR('/addresses');
	const { result } = useResultState(error, loading, data);

	const {
		control,
		register,
		handleSubmit,
		formState: { errors },
	} = useForm({
		resolver: zodResolver(detailSchema),
		defaultValues: initial || {
			address_id: '',
			package_size: 'small',
			estimated_value: 0,
			weight: 0,
			height: 0,
			width: 0,
			depth: 0,
		},
	});

	return (
		<form onSubmit={handleSubmit(action)} className='grid gap-6 lg:grid-cols-2'>
			<div className='col-span-full'>
				<Label htmlFor='address_id'>Alamat</Label>
				<Controller
					name='address_id'
					control={control}
					render={({ field }) => (
						<Select
							{...field}
							value={field.value}
							onChange={(event) => field.onChange(event.target.value)}
							disabled={loading.addresses}>
							<option value=''>Pilih alamat</option>
							{result.map((address) => (
								<option key={address.id} value={address.id}>
									{address.name}
								</option>
							))}
						</Select>
					)}
				/>
				<Hint>
					Alamat tujuan pengiriman donasi buku. Jika belum memiliki alamat,
					Anda dapat menambahkannya di{' '}
					<Link className='text-primary-500' to='/dashboard/addresses'>
						halaman alamat
					</Link>
					.
				</Hint>
				{errors.address_id && (
					<span className='text-red-500'>{errors.address_id.message}</span>
				)}
			</div>

			<div>
				<Label htmlFor='package_size'>Ukuran Paket</Label>
				<Select {...register('package_size')}>
					<option value='small'>Kecil (1-2 kg)</option>
					<option value='medium'>Sedang (2-4 kg)</option>
					<option value='large'>Besar (4-8 kg)</option>
				</Select>
				<Hint>Ukuran paket donasi buku.</Hint>
				{errors.package_size && (
					<span className='text-red-500'>{errors.package_size.message}</span>
				)}
			</div>

			<div>
				<Label htmlFor='estimated_value'>Perkiraan Nilai</Label>
				<Input
					type='number'
					placeholder='Masukkan perkiraan nilai'
					{...register('estimated_value')}
				/>
				<Hint>Perkiraan nilai donasi buku dalam rupiah.</Hint>
				{errors.estimated_value && (
					<span className='text-red-500'>{errors.estimated_value.message}</span>
				)}
			</div>

			<div>
				<Label htmlFor='weight'>Berat</Label>
				<Input
					type='number'
					placeholder='Masukkan berat'
					{...register('weight')}
				/>
				<Hint>Total berat donasi buku dalam kilogram.</Hint>
				{errors.weight && (
					<span className='text-red-500'>{errors.weight.message}</span>
				)}
			</div>

			<div className='grid grid-cols-1 sm:grid-cols-3 gap-6 col-span-full'>
				<div>
					<Label htmlFor='depth'>Panjang</Label>
					<Input
						type='number'
						placeholder='Masukkan panjang paket'
						{...register('length')}
					/>
					<Hint>Panjang paket dalam sentimeter.</Hint>
					{errors.length && (
						<span className='text-red-500'>{errors['length'].message}</span>
					)}
				</div>

				<div>
					<Label htmlFor='width'>Lebar</Label>
					<Input
						type='number'
						placeholder='Masukkan lebar paket'
						{...register('width')}
					/>
					<Hint>Lebar paket dalam sentimeter.</Hint>
					{errors.width && (
						<span className='text-red-500'>{errors.width.message}</span>
					)}
				</div>

				<div>
					<Label htmlFor='height'>Tinggi</Label>
					<Input
						type='number'
						placeholder='Masukkan tinggi paket'
						{...register('height')}
					/>
					<Hint>Tinggi paket dalam sentimeter.</Hint>
					{errors.height && (
						<span className='text-red-500'>{errors.height.message}</span>
					)}
				</div>
			</div>

			<div className='col-span-full'>
				<div className='flex items-center gap-2'>
					<Button>{label}</Button>
					<Button type='button' variant='outline' onClick={() => previous()}>
						Kembali
					</Button>
				</div>
			</div>
		</form>
	);
};

export default DonationDetailForm;