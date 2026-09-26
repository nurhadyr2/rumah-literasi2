import * as React from 'react';
import useSWR, { useSWRConfig } from 'swr';
import { toast } from 'sonner';
import { Link, useNavigate, useParams } from 'react-router';
import { ArrowLeft, CheckCircle2, Clock, CreditCard, RefreshCw } from 'lucide-react';

import axios from '@/libs/axios';
import { currency, animate } from '@/libs/utils';
import { PAYMENT_STATUS } from '@/libs/constant';

import {
	Heading,
	HeadingDescription,
	HeadingTitle,
} from '@/components/ui/heading';
import { Button } from '@/components/ui/button';
import { Hint } from '@/components/ui/hint';
import { Loading } from '@/components/loading';
import ShippingFeeNote from '@/components/book-donations/shipping-fee-note';
import { Error } from '@/components/error';

const DOKU_CHECKOUT_JS = import.meta.env.VITE_DOKU_CHECKOUT_JS;

let checkoutScript;
const loadCheckoutScript = () => {
	if (!DOKU_CHECKOUT_JS) return Promise.resolve(false);
	if (window.loadJokulCheckout) return Promise.resolve(true);

	checkoutScript ??= new Promise((resolve) => {
		const script = document.createElement('script');
		script.src = DOKU_CHECKOUT_JS;
		script.async = true;
		script.onload = () => resolve(Boolean(window.loadJokulCheckout));
		script.onerror = () => {
			checkoutScript = undefined;
			resolve(false);
		};
		document.body.appendChild(script);
	});
	return checkoutScript;
};

const openCheckout = async (url) => {
	const popup = await loadCheckoutScript();
	if (popup) return window.loadJokulCheckout(url);
	window.location.assign(url);
};

const PayDonation = ({ type }) => {
	const { id } = useParams();
	const navigate = useNavigate();
	const { mutate } = useSWRConfig();

	const endpoint =
		type === 'book' ? '/book-donations/' : '/financial-donations/';
	const listEndpoint =
		type === 'book' ? '/book-donations' : '/financial-donations';
	const listPath =
		type === 'book'
			? '/dashboard/book-donations'
			: '/dashboard/financial-donations';

	const { data, error, isLoading } = useSWR(endpoint + id);

	const [submitting, setSubmitting] = React.useState(false);
	const [checking, setChecking] = React.useState(false);

	const donation = data?.data;
	const amount = type === 'book' ? donation?.shipping_fee : donation?.amount;
	const hasValidAmount = Number.isFinite(Number(amount)) && Number(amount) > 0;
	const isPending = donation?.status === PAYMENT_STATUS.PENDING;

	const refresh = React.useCallback(() => {
		mutate(listEndpoint);
		return mutate(endpoint + id);
	}, [mutate, listEndpoint, endpoint, id]);

	const checkStatus = React.useCallback(
		async ({ silent = false } = {}) => {
			try {
				setChecking(true);
				const result = await axios.get(endpoint + id + '/payment-status');
				const status = result.data?.data?.status;
				await refresh();

				if (status && status !== PAYMENT_STATUS.PENDING) {
					animate();
					toast('Pembayaran berhasil diterima');
				} else if (!silent) {
					toast('Pembayaran belum diterima', {
						description:
							'Jika Anda sudah membayar, tunggu sebentar lalu cek kembali.',
					});
				}
			} catch (err) {
				if (!silent) {
					toast.error('Gagal mengecek status pembayaran', {
						description: err.response?.data?.message || err.message,
					});
				}
			} finally {
				setChecking(false);
			}
		},
		[endpoint, id, refresh]
	);

	const synced = React.useRef(false);
	React.useEffect(() => {
		if (synced.current || !donation) return;
		if (isPending && donation.invoice_number) {
			synced.current = true;
			checkStatus({ silent: true });
		}
	}, [donation, isPending, checkStatus]);

	const onPay = async () => {
		if (!hasValidAmount) {
			return toast.error(
				type === 'book'
					? 'Ongkir belum tersedia. Silakan hubungi admin.'
					: 'Nominal pembayaran tidak valid.'
			);
		}

		try {
			setSubmitting(true);
			const result = await axios.post(endpoint + id + '/checkout');
			const url = result.data?.data?.payment_url;
			if (!url) throw new globalThis.Error('URL pembayaran tidak tersedia');

			await openCheckout(url);
		} catch (err) {
			toast.error('Gagal membuat pembayaran', {
				description: err.response?.data?.message || err.message,
			});
		} finally {
			setSubmitting(false);
		}
	};

	return (
		<div className='grid gap-8'>
			<Heading>
				<HeadingTitle>Pembayaran Donasi</HeadingTitle>
				<HeadingDescription>
					Pembayaran diproses otomatis melalui DOKU. Anda bisa membayar dengan
					Virtual Account, QRIS, e-wallet, atau metode lain yang tersedia.
				</HeadingDescription>
			</Heading>

			<Error error={!isLoading && error} />
			<Loading loading={isLoading} />

			{donation && (
				<div className='grid gap-6'>
					<div className='rounded-xl border border-zinc-200 p-4'>
						<span className='text-sm text-zinc-500'>
							{type === 'book' ? 'Total Ongkir' : 'Total Donasi'}
						</span>
						<p className='text-2xl font-bold'>
							{hasValidAmount ? currency(Number(amount)) : 'Tidak tersedia'}
						</p>
					</div>

					{type === 'book' && isPending && hasValidAmount && <ShippingFeeNote />}

					{isPending && !hasValidAmount && (
						<div className='rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700'>
							{type === 'book'
								? 'Data ongkir tidak valid. Silakan hubungi admin.'
								: 'Nominal pembayaran tidak valid. Silakan hubungi admin.'}
						</div>
					)}

					{donation.status === PAYMENT_STATUS.SUCCESS && (
						<div className='flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-700'>
							<CheckCircle2 className='size-5 flex-none' />
							<span>Pembayaran berhasil. Terima kasih atas donasi Anda!</span>
						</div>
					)}

					{donation.status === PAYMENT_STATUS.WAITING_VERIFICATION && (
						<div className='flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-700'>
							<Clock className='size-5 flex-none' />
							<span>
								{donation.payment_proof
									? 'Bukti pembayaran sedang diverifikasi admin.'
									: 'Pembayaran diterima. Admin akan segera mengonfirmasi pengiriman.'}
							</span>
						</div>
					)}

					{donation.status === PAYMENT_STATUS.FAILED && (
						<div className='rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700'>
							Pembayaran donasi ini gagal. Silakan hubungi admin.
						</div>
					)}

					{isPending && (
						<Hint>
							Setelah menekan tombol bayar, Anda akan diarahkan ke halaman
							pembayaran DOKU. Status donasi akan diperbarui otomatis setelah
							pembayaran berhasil.
						</Hint>
					)}

					<div className='flex flex-wrap items-center gap-2'>
						<Button
							type='button'
							variant='outline'
							onClick={() => navigate(listPath)}>
							<ArrowLeft className='size-4 sm:mr-2' />
							<span className='hidden sm:inline'>Kembali</span>
						</Button>

						{isPending && (
							<Button
								type='button'
								disabled={submitting || !hasValidAmount}
								onClick={onPay}>
								<CreditCard className='size-4 mr-2' />
								{submitting ? 'Memproses...' : 'Bayar Sekarang'}
							</Button>
						)}

						{isPending && donation.invoice_number && (
							<Button
								type='button'
								variant='outline'
								disabled={checking}
								onClick={() => checkStatus()}>
								<RefreshCw className='size-4 mr-2' />
								{checking ? 'Mengecek...' : 'Cek Status Pembayaran'}
							</Button>
						)}

						{!isPending && (
							<Link to={listPath + '/' + donation.id}>
								<Button type='button'>Lihat Detail Donasi</Button>
							</Link>
						)}
					</div>
				</div>
			)}
		</div>
	);
};

export default PayDonation;
