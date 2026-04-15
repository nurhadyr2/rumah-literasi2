import * as React from 'react';

import useSWR from 'swr';
import { toast } from 'sonner';
import { Link } from 'react-router';

import axios from '@/libs/axios';
import { Button } from '@/components/ui/button';
import { useConfirm } from '@/hooks/use-confirm';
import { useResultState } from '@/hooks/use-result-state';

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
import { Avatar } from '@/components/ui/avatar';
import { Loading } from '@/components/loading';
import { Empty } from '@/components/empty';
import { Error } from '@/components/error';

const ListDonations = () => {
	const { confirm } = useConfirm();

	const { error, mutate, data, isLoading: loading } = useSWR('/donations');
	const { result, empty } = useResultState(error, loading, data);

	const handleDelete = async (id) => {
		confirm({
			title: 'Konfirmasi Aksi',
			variant: 'destructive',
			description: 'Apakah Anda yakin ingin menghapus data ini?',
		})
			.then(async () => {
				try {
					await axios.delete('/donations/' + id);
					mutate();
					toast('Donasi berhasil dihapus', {
						description: 'Data donasi berhasil dihapus',
					});
				} catch (error) {
					toast.error('Gagal menghapus donasi', {
						description: error.response.data.message || error.message,
					});
					console.log(error);
				}
			})
			.catch(() => {
				// pass
			});
	};

	return (
		<div className='grid gap-8'>
			<Heading>
				<HeadingTitle>Daftar Donasi</HeadingTitle>
				<HeadingDescription>
					Daftar donasi finansial yang telah dibuat untuk mendukung kegiatan literasi baca-tulis di Taman Mraen Mimpi.
				</HeadingDescription>

				<div className='flex items-center justify-end'>
					<Link to='/dashboard/donations/create'>
						<Button>Tambah Donasi</Button>
					</Link>
				</div>
			</Heading>

			<div className='w-full overflow-x-auto border rounded-lg border-zinc-200'>
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>Anggota</TableHead>
							<TableHead>Jumlah</TableHead>
							<TableHead>Catatan</TableHead>
							<TableHead>Status</TableHead>
							<TableHead>Link Pembayaran</TableHead>
							<TableHead>Aksi</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{result.map((donation) => (
							<TableRow key={donation.id}>
								<TableCell>
									<div className='flex items-center gap-4'>
										<Avatar name={donation.user.name} className='flex-none' />
										<span className='font-medium'>{donation.user.name}</span>
									</div>
								</TableCell>
								<TableCell>{donation.amount}</TableCell>
								<TableCell>{donation.notes}</TableCell>
								<TableCell>
									<Badge>{donation.status}</Badge>
								</TableCell>
								<TableCell>
									{donation.status === 'pending' && (
										<a
											href={donation.payment_url}
											target='_blank'
											rel='noreferrer'>
											<span className='text-primary-500'>
												Selesaikan Pembayaran
											</span>
										</a>
									)}
								</TableCell>
								<TableCell>
									<div className='flex items-center gap-2'>
										<Link to={donation.id + '/detail'} relative='path'>
											<button className='bg-transparent hover:text-amber-500'>
												Detail
											</button>
										</Link>
										<button
											onClick={() => handleDelete(donation.id)}
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
		</div>
	);
};

export default ListDonations;