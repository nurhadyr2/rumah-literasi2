import * as React from 'react';
import * as z from 'zod';

import { toast } from 'sonner';
import { useSearchParams } from 'react-router';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router';
import { zodResolver } from '@hookform/resolvers/zod';

import axios from '@/libs/axios';
import { useAuth } from '@/hooks/use-auth';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

const ResetPasswordSchema = z
	.object({
		token: z.string().min(1),
		password: z.string().min(8),
		password_confirmation: z.string().min(8),
	})
	.refine((data) => data.password === data.password_confirmation, {
		message: 'Password dan konfirmasi password tidak sama',
	});

const ResetPassword = () => {
	const navigate = useNavigate();
	const [search] = useSearchParams();
	const { loading, session } = useAuth();

	React.useEffect(() => {
		if (!loading && session) navigate('/auth/otp');
	}, [session, loading, navigate]);

	const {
		setValue,
		register,
		handleSubmit,
		formState: { errors },
	} = useForm({
		resolver: zodResolver(ResetPasswordSchema),
		defaultValues: {
			token: '',
			password: '',
			password_confirmation: '',
		},
	});

	React.useEffect(() => {
		const token = search.get('token');
		if (token) setValue('token', token);
		else navigate('/expired');
	}, [search, setValue, navigate]);

	const onSubmit = handleSubmit(async (data) => {
		try {
			await axios.post('/auth/reset-password', data);
			toast('Password berhasil direset', {
				description: 'Silakan login menggunakan password baru Anda',
			});
			navigate('/auth/signin');
		} catch (error) {
			toast.error('Gagal mereset password', {
				description: error.response?.data?.message || error.message,
			});
			console.error(error);
		}
	});

	return (
		<div>
			<h1 className='mb-8 text-4xl font-bold text-primary-500'>
				Reset Password
			</h1>

			<form className='grid gap-6' onSubmit={onSubmit}>
				<div>
					<Label htmlFor='password'>Password Baru</Label>
					<Input
						type='password'
						placeholder='Masukkan password baru'
						{...register('password')}
					/>
					{errors.password && (
						<span className='text-red-500'>{errors.password.message}</span>
					)}
				</div>

				<div>
					<Label htmlFor='password_confirmation'>Konfirmasi Password</Label>
					<Input
						type='password'
						placeholder='Masukkan ulang password'
						{...register('password_confirmation')}
					/>
					{errors.password_confirmation && (
						<span className='text-red-500'>
							{errors.password_confirmation.message}
						</span>
					)}
				</div>

				<Button className='w-full'>Reset Password</Button>
			</form>
		</div>
	);
};

export default ResetPassword;