import * as React from 'react';
import * as z from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Hint } from '@/components/ui/hint';
import { ROLES } from '@/libs/constant';
import { Select } from '@/components/ui/select';

const ROLE_LIST = Object.values(ROLES);

const MemberSchema = z.object({
	name: z.string().min(3),
	email: z.string().min(3),
	password: z.string().optional(),
	role: z.enum(ROLE_LIST),
	is_verified: z.coerce.boolean(),
});

const MemberForm = ({ initial, action, label }) => {
	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm({
		resolver: zodResolver(MemberSchema),
		defaultValues: initial || {
			name: '',
			email: '',
			password: '',
			role: ROLES.GUEST,
			is_verified: 'true',
		},
	});

	return (
		<form onSubmit={handleSubmit(action)} className='grid gap-6 lg:grid-cols-2'>
			<div className='col-span-full'>
				<Label htmlFor='name'>Nama</Label>
				<Input
					type='text'
					placeholder='Masukkan nama'
					{...register('name')}
				/>
				<Hint>Nama lengkap anggota.</Hint>
				{errors.name && (
					<span className='text-red-500'>{errors.name.message}</span>
				)}
			</div>

			<div className='col-span-full'>
				<Label htmlFor='email'>Email</Label>
				<Input
					type='email'
					placeholder='Masukkan email'
					{...register('email')}
				/>
				<Hint>Alamat email untuk akun anggota.</Hint>
				{errors.email && (
					<span className='text-red-500'>{errors.email.message}</span>
				)}
			</div>

			<div className='col-span-full'>
				<Label htmlFor='password'>Kata Sandi</Label>
				<Input
					type='password'
					placeholder='Masukkan kata sandi'
					{...register('password')}
				/>
				<Hint>
					Kata sandi untuk akun (biarkan kosong jika tidak ingin mengubah).
				</Hint>
				{errors.password && (
					<span className='text-red-500'>{errors.password.message}</span>
				)}
			</div>

			<div>
				<Label htmlFor='role'>Peran</Label>
				<Select {...register('role')}>
					{ROLE_LIST.map((role) => (
						<option key={role} value={role}>
							{role}
						</option>
					))}
				</Select>
				<Hint>Peran yang diberikan kepada anggota dalam sistem.</Hint>
				{errors.role && (
					<span className='text-red-500'>{errors.role.message}</span>
				)}
			</div>

			<div>
				<Label htmlFor='is_verified'>Terverifikasi</Label>
				<Select {...register('is_verified')}>
					<option value='true'>Ya</option>
					<option value='false'>Tidak</option>
				</Select>
				<Hint>Menunjukkan apakah akun anggota sudah terverifikasi.</Hint>
				{errors.is_verified && (
					<span className='text-red-500'>{errors.is_verified.message}</span>
				)}
			</div>

			<div className='col-span-full'>
				<Button>{label}</Button>
			</div>
		</form>
	);
};

export default MemberForm;