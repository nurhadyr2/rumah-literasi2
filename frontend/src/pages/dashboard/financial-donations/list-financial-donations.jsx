import * as React from 'react';

import useSWR from 'swr';
import { toast } from 'sonner';
import { Link } from 'react-router';
import { usePagination, useString } from '@/hooks/use-pagination';
import { Input } from '@/components/ui/input';

import axios from '@/libs/axios';
import { Button } from '@/components/ui/button';
import { useConfirm } from '@/hooks/use-confirm';

import {
	Heading,
	HeadingDescription,
	HeadingTitle,
} from '@/components/ui/heading';

import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarGroup } from '@/components/ui/avatar';
import { Loading } from '@/components/loading';
import { Empty } from '@/components/empty';
import { Error } from '@/components/error';
import { currency, formatDate } from '@/libs/utils';
import { PAYMENT_STATUS } from '@/libs/constant';
import { useResultState } from '@/hooks/use-result-state';
import { Pagination } from '@/components/pagination';
import { Select } from '@/components/ui/select';
import { useAuth } from '@/hooks/use-auth';

const ListDonations = () => {
	const { confirm } = useConfirm();
	const { page, limit, search, setSearch, debounced } = usePagination();
	const [status, setStatus] = useString('status');
	const { user } = useAuth();

	const {
		error,
		mutate,
		data,
		isLoading: loading,
	} = useSWR([
		'financial-donations',
		{
			params: {
				page: page,
				limit: limit,
				search: debounced,
				status: status,
			},
		},
	]);

	const { result, pagination, empty } = useResultState(error, loading, data);

	const handleDelete = async (id) => {
		confirm({
			title: 'Konfirmasi Tindakan',
			variant: 'destructive',
			description: 'Apakah Anda yakin ingin menghapus data ini?',
		})
			.then(async () => {
				try {
					await axios.delete('/financial-donations/' + id);
					mutate();
					toast('Donasi finansial dihapus', {
						description: 'Donasi berhasil dihapus',
					});
				} catch (error) {
					toast.error('Gagal menghapus donasi', {
						description: error.response?.data?.message || error.message,
					});
					console.error(error);
				}
			})
			.catch(() => {
				// pass
			});
	};

	return (
		<div className='grid gap-8'>
			<Heading>
				<HeadingTitle>Daftar Donasi Finansial</HeadingTitle>
				<HeadingDescription>
					Kelola semua donasi finansial dengan fitur pencarian dan pagination.
				</HeadingDescription>
			</Heading>

			<div className='flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3'>
				<div className='flex items-center w-full gap-2'>
					<Input
						value={search}
						type='search'
						placeholder='Cari berdasarkan nama member, alamat...'
						onChange={(e) => setSearch(e.target.value)}
					/>
					<Select
						value={status}
						className='max-w-40'
						onChange={(e) => setStatus(e.target.value)}>
						<option value=''>Pilih status</option>
						{Object.values(PAYMENT_STATUS).map((status) => (
							<option key={status} value={status}>
								{status}
							</option>
						))}
					</Select>
				</div>
				{user?.role === 'GUEST' && (
					<Link
						to='/dashboard/financial-donations/create'
						className='flex-none w-full sm:w-auto'>
						<Button className='w-full sm:w-auto'>Buat Donasi Finansial</Button>
					</Link>
				)}
			</div>

			<div className='w-full overflow-x-auto border rounded-xl border-zinc-200'>
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>Member</TableHead>
							<TableHead>Jumlah</TableHead>
							<TableHead>Status</TableHead>
							<TableHead>Tanggal Dibuat</TableHead>
							<TableHead>Aksi</TableHead>
						</TableRow>
					</TableHeader>

					<TableBody>
						{result.map((donation) => (
							<TableRow key={donation.id}>
								<TableCell>
									<AvatarGroup user={donation.user} />
								</TableCell>

								<TableCell>{currency(donation.amount)}</TableCell>

								<TableCell>
									<Badge>{donation.status}</Badge>
								</TableCell>

								<TableCell>{formatDate(donation.createdAt)}</TableCell>

								<TableCell>
									<div className='flex items-center gap-2'>
										{donation.status === PAYMENT_STATUS.PENDING && (
											<a
												href={donation.payment_url}
												target='_blank'
												rel='noreferrer'>
												<button className='bg-transparent hover:text-blue-500'>
													Selesaikan Pembayaran
												</button>
											</a>
										)}

										<Link to={'/dashboard/financial-donations/' + donation.id}>
											<button className='bg-transparent hover:text-amber-500'>
												Detail
											</button>
										</Link>

										{(user?.role === 'ADMIN' ||
											user?.id === donation.user_id) && (
											<button
												onClick={() => handleDelete(donation.id)}
												className='bg-transparent hover:text-red-500'>
												Hapus
											</button>
										)}
									</div>
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>

				<Error error={!loading && error} />
				<Empty empty={!loading && empty} />
				<Loading loading={loading} />
			</div>

			{pagination && <Pagination pagination={pagination} />}
		</div>
	);
};

export default ListDonations;
