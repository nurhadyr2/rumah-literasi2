import useSWR from 'swr';
import { toast } from 'sonner';
import { Link } from 'react-router';
import { Input } from '@/components/ui/input';

import axios from '@/libs/axios';
import { useConfirm } from '@/hooks/use-confirm';
import { useResultState } from '@/hooks/use-result-state';
import { usePagination } from '@/hooks/use-pagination';

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
import { Empty } from '@/components/empty';
import { Error } from '@/components/error';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarGroup } from '@/components/ui/avatar';
import { Pagination } from '@/components/pagination';

const ListAddresses = () => {
	const { confirm } = useConfirm();
	const { page, limit, search, setSearch, debounced } = usePagination();

	const {
		error,
		mutate,
		data,
		isLoading: loading,
	} = useSWR([
		'addresses',
		{
			params: {
				page: page,
				limit: limit,
				search: debounced,
			},
		},
	]);

	const { result, pagination, empty } = useResultState(error, loading, data);

	const handleDelete = async (id) => {
		confirm({
			title: 'Konfirmasi Aksi',
			variant: 'destructive',
			description: 'Apakah Anda yakin ingin menghapus alamat ini?',
		})
			.then(async () => {
				try {
					await axios.delete('/addresses/' + id);
					mutate();
					toast('Alamat berhasil dihapus', {
						description: 'Data alamat telah dihapus',
					});
				} catch (error) {
					toast.error('Gagal menghapus alamat', {
						description: error.response?.data?.message || error.message,
					});
					console.error(error);
				}
			})
			.catch(() => {});
	};

	const handleDefault = async (id) => {
		confirm({
			title: 'Konfirmasi Aksi',
			description: 'Jadikan alamat ini sebagai alamat utama?',
		})
			.then(async () => {
				try {
					await axios.patch('/addresses/' + id + '/default');
					mutate('/addresses');
					mutate('/addresses/' + id);
					toast('Alamat dijadikan utama', {
						description: 'Alamat berhasil dijadikan sebagai alamat utama',
					});
				} catch (error) {
					toast.error('Gagal menjadikan alamat utama', {
						description: error.response?.data?.message || error.message,
					});
					console.error(error);
				}
			})
			.catch(() => {});
	};

	return (
		<div className='grid gap-8'>
			<Heading>
				<HeadingTitle>Daftar Alamat</HeadingTitle>
				<HeadingDescription>
					Kelola semua alamat dengan fitur pencarian dan pagination.
				</HeadingDescription>
			</Heading>

			<div className='flex items-center justify-between'>
				<Input
					type='search'
					value={search}
					placeholder='Cari nama, alamat...'
					onChange={(e) => setSearch(e.target.value)}
				/>
				<Link to='/dashboard/addresses/create' className='flex-none'>
					<Button>Buat Alamat</Button>
				</Link>
			</div>

			<div className='w-full overflow-x-auto border rounded-xl border-zinc-200'>
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>Pengguna</TableHead>
							<TableHead>Nama</TableHead>
							<TableHead>Utama</TableHead>
							<TableHead>Alamat</TableHead>
							<TableHead>Kode Pos</TableHead>
							<TableHead>Aksi</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{result.map((address) => (
							<TableRow key={address.id}>
								<TableCell>
									<AvatarGroup user={address.user} />
								</TableCell>
								<TableCell>{address.name}</TableCell>
								<TableCell>
									{address.is_default ? (
										<Badge variant='primary'>Utama</Badge>
									) : (
										<Badge
											variant='outline'
											onClick={() => {
												if (address.is_default) return;
												handleDefault(address.id);
											}}>
											Bukan utama
										</Badge>
									)}
								</TableCell>
								<TableCell>
									<p className='truncate'>{address.street_address}</p>
								</TableCell>
								<TableCell>{address.zipcode}</TableCell>
								<TableCell>
									<div className='flex items-center gap-2'>
										<Link to={'/dashboard/addresses/' + address.id}>
											<button className='bg-transparent hover:text-amber-500'>
												Detail
											</button>
										</Link>
										<button
											onClick={() => handleDelete(address.id)}
											className='bg-transparent hover:text-red-500'>
											Hapus
										</button>
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

export default ListAddresses;