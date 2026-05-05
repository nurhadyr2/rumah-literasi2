import * as React from 'react';
import { toast } from 'sonner';
import { X, CheckCircle2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router';
import { useSWRConfig } from 'swr';

import axios from '@/libs/axios';
import { animate } from '@/libs/utils';
import { useConfirm } from '@/hooks/use-confirm';
import { useDonation, STEPS, DELIVERY_METHODS } from '@/stores/use-donation';
import { bookDonationSchema } from '@/libs/schemas';

import { DonationItem } from '@/components/book-donations/donation-item-card';
import { Button } from '@/components/ui/button';
import {
	Heading,
	HeadingDescription,
	HeadingTitle,
} from '@/components/ui/heading';
import { Empty } from '@/components/empty';
import { cn } from '@/libs/utils';

import StepMethod from '@/components/book-donations/step-method';
import DonationDetailForm from '@/components/book-donations/donation-detail-form';
import StepCourier from '@/components/book-donations/step-courier';
import StepSchedule from '@/components/book-donations/step-schedule';
import ReviewBookDonation from '@/pages/dashboard/book-donations/review-book-donation';

const STEP_LIST = [
	{ key: STEPS.ITEMS, label: 'Item Buku' },
	{ key: STEPS.METHOD, label: 'Metode' },
	{ key: STEPS.DETAIL, label: 'Detail Paket' },
	{ key: STEPS.COURIER, label: 'Kurir' },
	{ key: STEPS.SCHEDULE, label: 'Jadwal' },
	{ key: STEPS.REVIEW, label: 'Konfirmasi' },
];

const StepIndicator = ({ currentStep }) => {
	const currentIdx = STEP_LIST.findIndex((s) => s.key === currentStep);

	return (
		<div className='flex items-center gap-1 overflow-x-auto pb-1 hide-scrollbar'>
			{STEP_LIST.map((step, idx) => {
				const done = idx < currentIdx;
				const active = idx === currentIdx;

				return (
					<React.Fragment key={step.key}>
						<div className='flex items-center gap-1.5 flex-none'>
							<div
								className={cn(
									'flex items-center justify-center rounded-full size-6 text-xs font-bold transition-colors',
									done
										? 'bg-primary-500 text-white'
										: active
											? 'bg-primary-500 text-white ring-4 ring-primary-100'
											: 'bg-zinc-100 text-zinc-400'
								)}>
								{done ? <CheckCircle2 className='size-3.5' /> : idx + 1}
							</div>
							<span
								className={cn(
									'text-xs font-medium hidden sm:block',
									active
										? 'text-primary-600'
										: done
											? 'text-zinc-500'
											: 'text-zinc-400'
								)}>
								{step.label}
							</span>
						</div>
						{idx < STEP_LIST.length - 1 && (
							<div
								className={cn(
									'h-px flex-1 min-w-4 transition-colors',
									idx < currentIdx ? 'bg-primary-400' : 'bg-zinc-200'
								)}
							/>
						)}
					</React.Fragment>
				);
			})}
		</div>
	);
};

const StepItems = () => {
	const { items, remove, reset, route } = useDonation();
	const { confirm } = useConfirm();
	const navigate = useNavigate();

	const handleReset = () => {
		confirm({
			title: 'Reset donasi',
			variant: 'destructive',
			description: 'Semua item yang ditambahkan akan dihapus. Lanjutkan?',
		})
			.then(() => reset())
			.catch(() => {});
	};

	const handleContinue = () => {
		if (!items.length) {
			toast.error('Tambahkan minimal satu buku terlebih dahulu');
			return;
		}
		route(STEPS.METHOD);
	};

	return (
		<div className='grid gap-6'>
			<div className='grid items-start grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5'>
				{items.map((item) => (
					<div className='relative group' key={item.id}>
						<Link to={'/dashboard/book-donations/create/' + item.id + '/edit'}>
							<DonationItem item={item} />
						</Link>
						<button
							type='button'
							onClick={() => remove(item.id)}
							className='absolute top-2 right-2 hidden group-hover:flex items-center justify-center bg-white rounded-full size-7 shadow-md border border-zinc-200 hover:bg-red-50 hover:border-red-200 transition-colors'>
							<X className='size-3.5 text-zinc-500 hover:text-red-500' />
						</button>
					</div>
				))}
				<Empty empty={!items.length} />
			</div>

			<div className='flex flex-wrap items-center gap-2'>
				<Button onClick={handleContinue} disabled={!items.length}>
					Lanjutkan
				</Button>
				<Link to='/dashboard/book-donations/create/append'>
					<Button variant='outline'>Tambah Buku</Button>
				</Link>
				{items.length > 0 && (
					<Button variant='destructive' onClick={handleReset}>
						Reset
					</Button>
				)}
			</div>
		</div>
	);
};

const StepDetail = () => {
	const { detail, setDetail, route } = useDonation();

	const onSubmit = (data) => {
		setDetail(data);
		route(STEPS.COURIER);
	};

	const onPrevious = () => {
		route(STEPS.METHOD);
	};

	return (
		<DonationDetailForm
			initial={detail}
			action={onSubmit}
			previous={onPrevious}
			label='Lanjutkan ke Pilih Kurir'
		/>
	);
};

const STEP_TITLES = {
	[STEPS.ITEMS]: {
		title: 'Daftar Buku Donasi',
		desc: 'Tambahkan buku yang ingin Anda donasikan.',
	},
	[STEPS.METHOD]: {
		title: 'Pilih Metode Pengiriman',
		desc: 'Pilih apakah kurir akan pickup ke lokasi Anda atau Anda yang mengantarkan.',
	},
	[STEPS.DETAIL]: {
		title: 'Detail Paket',
		desc: 'Isi informasi paket donasi buku Anda.',
	},
	[STEPS.COURIER]: {
		title: 'Pilih Kurir',
		desc: 'Pilih layanan kurir yang tersedia sesuai metode pengiriman.',
	},
	[STEPS.SCHEDULE]: {
		title: 'Jadwal Pengiriman',
		desc: 'Tentukan jadwal pickup atau titik drop off.',
	},
	[STEPS.REVIEW]: {
		title: 'Konfirmasi Donasi',
		desc: 'Periksa kembali semua informasi sebelum mengirim.',
	},
};

const CreateBookDonation = () => {
	const { step } = useDonation();
	const { title, desc } = STEP_TITLES[step] || STEP_TITLES[STEPS.ITEMS];

	return (
		<div className='grid gap-8'>
			<div className='grid gap-4'>
				<Heading>
					<HeadingTitle>{title}</HeadingTitle>
					<HeadingDescription>{desc}</HeadingDescription>
				</Heading>
				<StepIndicator currentStep={step} />
			</div>

			{step === STEPS.ITEMS && <StepItems />}
			{step === STEPS.METHOD && <StepMethod />}
			{step === STEPS.DETAIL && <StepDetail />}
			{step === STEPS.COURIER && <StepCourier />}
			{step === STEPS.SCHEDULE && <StepSchedule />}
			{step === STEPS.REVIEW && <ReviewBookDonation />}
		</div>
	);
};

export default CreateBookDonation;
