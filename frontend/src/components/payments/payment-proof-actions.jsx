import * as React from 'react';
import { toast } from 'sonner';
import { Check, X, Clock } from 'lucide-react';

import axios from '@/libs/axios';
import { assetUrl } from '@/libs/utils';
import { PAYMENT_STATUS } from '@/libs/constant';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useConfirm } from '@/hooks/use-confirm';

const PaymentProofActions = ({ type, donation, isAdmin, onDone }) => {
	const { confirm } = useConfirm();
	const [loading, setLoading] = React.useState(false);

	const endpoint =
		(type === 'book' ? '/book-donations/' : '/financial-donations/') +
		donation.id +
		'/verify';

	const proof = donation.payment_proof;
	const awaiting = donation.status === PAYMENT_STATUS.WAITING_VERIFICATION;

	const verify = (approve) => {
		confirm({
			title: approve ? 'Setujui Pembayaran' : 'Tolak Pembayaran',
			variant: approve ? 'primary' : 'destructive',
			description: approve
				? type === 'book'
					? 'Menyetujui akan mengonfirmasi pengiriman ke Biteship dan memotong saldo. Lanjutkan?'
					: 'Tandai pembayaran ini sebagai berhasil?'
				: 'Tolak dan tandai pembayaran ini sebagai gagal?',
		})
			.then(async () => {
				try {
					setLoading(true);
					await axios.post(endpoint, { approve });
					toast(approve ? 'Pembayaran disetujui' : 'Pembayaran ditolak');
					onDone?.();
				} catch (err) {
					toast.error('Gagal memverifikasi pembayaran', {
						description: err.response?.data?.message || err.message,
					});
				} finally {
					setLoading(false);
				}
			})
			.catch(() => {});
	};

	if (!proof) return null;

	return (
		<div className='col-span-full grid gap-3'>
			<Label>Bukti Pembayaran</Label>
			<a href={assetUrl(proof)} target='_blank' rel='noreferrer'>
				<img
					src={assetUrl(proof)}
					alt='Bukti pembayaran'
					className='max-h-80 rounded-xl border border-zinc-200 object-contain'
				/>
			</a>

			{awaiting && (
				<div className='flex items-center gap-2 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-700'>
					<Clock className='size-4 flex-none' />
					<span>
						Menunggu verifikasi admin. Estimasi diproses dalam 1×24 jam.
					</span>
				</div>
			)}

			{isAdmin && awaiting && (
				<div className='flex flex-wrap items-center gap-2'>
					<Button
						type='button'
						variant='primary'
						disabled={loading}
						onClick={() => verify(true)}>
						<Check className='size-4 sm:mr-2' />
						<span className='hidden sm:inline'>Setujui</span>
					</Button>
					<Button
						type='button'
						variant='destructive'
						disabled={loading}
						onClick={() => verify(false)}>
						<X className='size-4 sm:mr-2' />
						<span className='hidden sm:inline'>Tolak</span>
					</Button>
				</div>
			)}
		</div>
	);
};

export default PaymentProofActions;
