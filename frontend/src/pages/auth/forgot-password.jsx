import * as React from 'react';
import * as z from 'zod';

import { toast } from 'sonner';
import { Link } from 'react-router';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router';
import { zodResolver } from '@hookform/resolvers/zod';

import axios from '@/libs/axios';
import { useAuth } from '@/hooks/use-auth';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

const ForgotPasswordSchema = z.object({
	email: z.string().email(),
});

const ForgotPassword = () => {
	const [sent, setSent] = React.useState(false);
	const { loading, session } = useAuth();
	const navigate = useNavigate();

	React.useEffect(() => {
		if (!loading && session) navigate('/auth/otp');
	}, [session, loading, navigate]);

	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm({
		resolver: zodResolver(ForgotPasswordSchema),
		defaultValues: {
			email: '',
			password: '',
		},
	});

	const onSubmit = handleSubmit(async (data) => {
		try {
			await axios.post('/auth/forgot-password', data);
			toast('Permintaan reset password berhasil dikirim', {
				description: 'Kami akan mengirimkan link reset password ke email Anda',
			});
			setSent(true);
		} catch (error) {
			toast.error('Gagal mengirim email reset password', {
				description: error.response?.data?.message || error.message,
			});
			console.error(error);
		}
	});

	return (
		<div>
			<h1 className='mb-8 text-4xl font-bold text-primary-500'>
				Lupa Password
			</h1>

			<form className='grid gap-6' onSubmit={onSubmit}>
				{sent ? (
					<React.Fragment>
						<div className='text-sm text-zinc-500 '>
							Kami telah mengirimkan email berisi link reset password. Silakan cek inbox Anda. Jika tidak ditemukan, periksa folder spam.
						</div>
					</React.Fragment>
				) : (
					<React.Fragment>
						<div>
							<Label htmlFor='email'>Email</Label>
							<Input
								type='email'
								placeholder='Masukkan email Anda'
								{...register('email')}
							/>
							{errors.email && (
								<span className='text-red-500'>{errors.email.message}</span>
							)}
						</div>
					</React.Fragment>
				)}

				<Button disabled={sent}>Kirim Link Reset</Button>

				<div className='text-sm text-center text-zinc-500 '>
					Kembali ke{' '}
					<Link
						to='/auth/signin'
						className='font-medium text-primary-600 hover:text-primary-500'>
						Masuk
					</Link>
				</div>
			</form>
		</div>
	);
};

export default ForgotPassword;