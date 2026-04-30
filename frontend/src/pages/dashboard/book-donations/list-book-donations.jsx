import useSWR from 'swr';
import { toast } from 'sonner';
import { Link } from 'react-router';
import { usePagination, useString } from '@/hooks/use-pagination';

import axios from '@/libs/axios';
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

import { Button } from '@/components/ui/button';
import { Loading } from '@/components/loading';
import { Badge } from '@/components/ui/badge';
import { Empty } from '@/components/empty';
import { Error } from '@/components/error';
import { Avatar, AvatarGroup } from '@/components/ui/avatar';
import { currency, formatDate } from '@/libs/utils';
import { PAYMENT_STATUS } from '@/libs/constant';
import { useResultState } from '@/hooks/use-result-state';
import { Pagination } from '@/components/pagination';
import { useAuth } from '@/hooks/use-auth';

import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';

const ListBookDonations = () => {
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
		'book-donations',
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
			title: 'Konfirmasi Aksi',
			variant: 'destructive',
			description: 'Apakah Anda yakin ingin menghapus data ini?',
		})
			.then(async () => {
				try {
					await axios.delete('/book-donations/' + id);
					mutate();
					toast('Donasi buku dihapus', {
						description: 'Berhasil menghapus donasi buku',
					});
				} catch (error) {
					toast.error('Gagal menghapus donasi buku', {
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
				<HeadingTitle>Daftar Donasi Buku</HeadingTitle>
				<HeadingDescription>
					Kelola semua donasi buku dengan fitur pencarian dan pagination.
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
						to='/dashboard/book-donations/create'
						className='flex-none w-full sm:w-auto'>
						<Button className='w-full sm:w-auto'>Buat Donasi Buku</Button>
					</Link>
				)}
			</div>

			<div className='w-full overflow-x-auto border rounded-xl border-zinc-200'>
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>Member</TableHead>
							<TableHead>Biaya Pengiriman</TableHead>
							<TableHead>Status</TableHead>
							<TableHead>Tanggal Dibuat</TableHead>
							<TableHead>Aksi</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{result.map((bookDonation) => (
							<TableRow key={bookDonation.id}>
								<TableCell>
									<AvatarGroup user={bookDonation.user} />
								</TableCell>
								<TableCell>{currency(bookDonation.shipping_fee)}</TableCell>
								<TableCell>
									<Badge>{bookDonation.status}</Badge>
								</TableCell>
								<TableCell>{formatDate(bookDonation.createdAt)}</TableCell>
								<TableCell>
									<div className='flex items-center gap-2'>
										{bookDonation.status === PAYMENT_STATUS.PENDING && (
											<a
												href={bookDonation.payment_url}
												target='_blank'
												rel='noreferrer'>
												<button className='bg-transparent hover:text-blue-500'>
													Selesaikan Pembayaran
												</button>
											</a>
										)}
										<Link to={'/dashboard/book-donations/' + bookDonation.id}>
											<button className='bg-transparent hover:text-amber-500'>
												Detail
											</button>
										</Link>
										{user?.role === 'ADMIN' && (
											<button
												onClick={() => handleDelete(bookDonation.id)}
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

export default ListBookDonations;
