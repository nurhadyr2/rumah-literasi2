import * as React from 'react';
import { Navigate, useNavigate } from 'react-router';
import { useDonation } from '@/stores/use-donation';

import {
	Heading,
	HeadingDescription,
	HeadingTitle,
} from '@/components/ui/heading';
import DonationDetailForm from '@/components/book-donations/donation-detail-form';

const DetailBookDonation = () => {
	const navigate = useNavigate();
	const { items, detail, setDetail } = useDonation();

	const onSubmit = async (data) => {
		setDetail(data);
		navigate('/dashboard/book-donations/create/courier');
	};

	const onPrevious = () => {
		setDetail(null);
		navigate('/dashboard/book-donations/create');
	};

	if (!items.length) return <Navigate to='/dashboard/book-donations/create' />;
	return (
		<div className='grid gap-8'>
			<Heading>
				<HeadingTitle>Tambah Detail Donasi</HeadingTitle>
				<HeadingDescription>
					Masukkan detail donasi buku Anda.
				</HeadingDescription>
			</Heading>

			<DonationDetailForm
				initial={detail}
				action={onSubmit}
				previous={onPrevious}
				label='Continue to Courier Selection'
			/>
		</div>
	);
};

export default DetailBookDonation;
