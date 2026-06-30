import * as React from 'react';
import { Navigate, useNavigate } from 'react-router';
import {
	Heading,
	HeadingDescription,
	HeadingTitle,
} from '@/components/ui/heading';

import { useDonation } from '@/stores/use-donation';
import DonationCourierForm from '@/components/book-donations/donation-courier-form';

const CourierBookDonation = () => {
	const navigate = useNavigate();
	const { detail, setCourier } = useDonation();

	const onSubmit = (courier) => {
		setCourier({
			company: courier.company,
			courier_code: courier.courier_code,
			courier_service_code: courier.courier_service_code,
			shipping_fee: courier.shipping_fee,
			duration: courier.duration,
			type: courier.type,
			service_type: courier.service_type,
		});
		navigate('/dashboard/book-donations/create/review');
	};

	const onPrevious = () => {
		setCourier(null);
		navigate('/dashboard/book-donations/create/detail');
	};

	if (!detail) return <Navigate to='/dashboard/book-donations/create/detail' />;

	return (
		<div className='grid gap-8'>
			<Heading>
				<HeadingTitle>Pilih Kurir</HeadingTitle>
				<HeadingDescription>
					Pilih layanan kurir untuk pengiriman donasi buku Anda.
				</HeadingDescription>
			</Heading>

			<DonationCourierForm
				detail={detail}
				action={onSubmit}
				previous={onPrevious}
				label='Pilih Kurir'
			/>
		</div>
	);
};

export default CourierBookDonation;