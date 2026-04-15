import * as React from 'react';
import { toast } from 'sonner';
import { STEPS, useTransactionStore } from '@/store/use-transactions';
import RecipientDetail from '@/components/transactions/recipient-detail';

import axios from '@/libs/axios';
import { cn, currency } from '@/libs/utils';

import { Loading } from '@/components/loading';
import { Button } from '@/components/ui/button';
import { useAsync } from '@/hooks/use-async';
import { Error } from '@/components/error';

const StepCourier = ({ onSubmit }) => {
	const { recipient, books, route, setCourier } = useTransactionStore();

	const { data, error, loading, mutate } = useAsync(
		() => {
			return axios.post('/deliveries/couriers', {
				recipient,
				books,
			});
		},
		[recipient, books],
		{
			initial: [],
			onSuccess: ({ data }) => {
				const { destination, pricings } = data.data;

				return pricings.map((courier) => ({
					...courier,
					zipcode: destination.postal_code,
					selected: false,
				}));
			},
			onError: (error) => {
				toast.error('Gagal mengambil data kurir', {
					description: error.response.data.message || error.message,
				});
			},
		}
	);

	const handleSelect = (courier) => {
		mutate((prev) => {
			return prev.map((item) => ({
				...item,
				selected: item.id === courier.id,
			}));
		});

		setCourier({
			zipcode: courier.zipcode,
			courier_company: courier.courier_code,
			courier_type: courier.courier_service_code,
		});
	};

	const handleBack = () => {
		setCourier({
			zipcode: '',
			courier_company: '',
			courier_type: '',
		});

		route(STEPS.RECIPIENT);
	};

	const disabled = React.useMemo(() => {
		return !data.some((item) => item.selected);
	}, [data]);

	return (
		<div className='relative grid items-start gap-6 xl:grid-cols-3'>
			<div className='grid gap-6'>
				<RecipientDetail recipient={recipient} />

				<div className='flex items-center gap-2'>
					<Button variant='outline' onClick={handleBack}>
						Kembali
					</Button>
					<Button disabled={disabled} onClick={onSubmit}>
						Selesai
					</Button>
				</div>
			</div>

			<div className='grid gap-6 md:grid-cols-2 xl:col-span-2'>
				<Error error={!loading && error} />
				<Loading loading={loading} />

				{data.map((courier) => (
					<div
						key={courier.id}
						onClick={() => handleSelect(courier)}
						className={cn('border border-zinc-200 rounded-2xl cursor-pointer', {
							'border-primary-500': courier.selected,
						})}>
						<div className='flex items-center justify-between p-4 font-semibold '>
							<h3>{courier.courier_name}</h3>
							<h4 className='text-primary-500'>
								{courier.courier_service_name}
							</h4>
						</div>
						<div className='flex flex-col p-4 border-t text-zinc-600 border-zinc-200'>
							<div className='flex text-nowrap'>
								<span>Estimasi Durasi</span>
								<div className='w-full mb-1 border-b border-dotted'></div>
								<span>{courier.duration}</span>
							</div>
							<div className='flex text-nowrap'>
								<span>Harga</span>
								<div className='w-full mb-1 border-b border-dotted'></div>
								<span className='font-medium text-black'>
									{currency(courier.price)}
								</span>
							</div>
						</div>
					</div>
				))}
			</div>
		</div>
	);
};

export default StepCourier;