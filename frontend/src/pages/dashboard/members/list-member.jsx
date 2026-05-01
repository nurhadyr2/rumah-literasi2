import useSWR from 'swr';
import { toast } from 'sonner';
import { Link } from 'react-router';
import { usePagination, useString } from '@/hooks/use-pagination';

import axios from '@/libs/axios';
import { useConfirm } from '@/hooks/use-confirm';
import { Input } from '@/components/ui/input';

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
import { AvatarGroup } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Loading } from '@/components/loading';
import { Empty } from '@/components/empty';
import { Error } from '@/components/error';
import { useResultState } from '@/hooks/use-result-state';
import { Pagination } from '@/components/pagination';
import { ROLES } from '@/libs/constant';
import { Select } from '@/components/ui/select';

const ListMembers = () => {
	const { confirm } = useConfirm();
	const { page, limit, search, setSearch, debounced } = usePagination();
	const [role, setRole] = useString('role');

	const {
		error,
		mutate,
		data,
		isLoading: loading,
	} = useSWR([
		'members',
		{
			params: {
				page: page,
				limit: limit,
				search: debounced,
				role: role,
			},
		},
	]);

	const { result, pagination, empty } = useResultState(error, loading, data);

	const handleDelete = async (uuid) => {
		confirm({
			title: 'Konfirmasi Tindakan',
			variant: 'destructive',
			description: 'Apakah Anda yakin ingin menghapus data ini?',
		})
			.then(async () => {
				try {
					await axios.delete('/members/' + uuid);
					mutate();
					toast('Member dihapus', {
						description: 'Member berhasil dihapus',
					});
				} catch (error) {
					toast.error('Gagal menghapus member', {
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
				<HeadingTitle>Daftar Member</HeadingTitle>
				<HeadingDescription>
					Mengelola semua member dengan fitur pencarian dan pagination.
				</HeadingDescription>
			</Heading>

			<div className='flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3'>
				<div className='flex items-center w-full gap-2'>
					<Input
						value={search}
						type='search'
						placeholder='Cari berdasarkan nama member...'
						onChange={(e) => setSearch(e.target.value)}
					/>

					<Select
						value={role}
						className='max-w-40'
						onChange={(e) => setRole(e.target.value)}>
						<option value=''>Semua Role</option>
						{Object.values(ROLES).map((role) => (
							<option key={role} value={role}>
								{role}
							</option>
						))}
					</Select>
				</div>

				<Link
					to='/dashboard/members/create'
					className='flex-none w-full sm:w-auto'>
					<Button className='w-full sm:w-auto'>Tambah Member</Button>
				</Link>
			</div>

			<div className='w-full overflow-x-auto border rounded-xl border-zinc-200'>
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>Nama</TableHead>
							<TableHead>Role</TableHead>
							<TableHead>Verifikasi</TableHead>
							<TableHead>Aksi</TableHead>
						</TableRow>
					</TableHeader>

					<TableBody>
						{result.map((member) => (
							<TableRow key={member.uuid}>
								<TableCell>
									<AvatarGroup user={member} />
								</TableCell>

								<TableCell>{member.role}</TableCell>

								<TableCell>
									<Badge>
										{member.is_verified ? 'Terverifikasi' : 'Belum'}
									</Badge>
								</TableCell>

								<TableCell>
									<div className='flex items-center gap-2'>
										{/* <Link to={'/dashboard/members/' + member.uuid}>
											<button className='bg-transparent hover:text-amber-500'>
												Detail
											</button>
										</Link> */}

										<button
											onClick={() => handleDelete(member.uuid)}
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

export default ListMembers;
