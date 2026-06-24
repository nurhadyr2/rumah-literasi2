import * as React from 'react';

import useSWR from 'swr';
import { toast } from 'sonner';
import { Link } from 'react-router';

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
import { Badge } from '@/components/ui/badge';
import { Loading } from '@/components/loading';
import { Empty } from '@/components/empty';
import { Error } from '@/components/error';

const TYPE_LABELS = { bank: 'Bank', ewallet: 'E-Wallet', qr: 'QR' };

const ListPaymentChannels = () => {
	const { confirm } = useConfirm();
	const { error, mutate, data, isLoading: loading } =
		useSWR('/payment-channels');
	const result = data?.data || [];
	const empty = !loading && !error && result.length === 0;

	const handleDelete = (id) => {
		confirm({
			title: 'Hapus Channel',
			variant: 'destructive',
			description: 'Yakin ingin menghapus channel pembayaran ini?',
		})
			.then(async () => {
				try {
					await axios.delete('/payment-channels/' + id);
					mutate();
					toast('Channel dihapus');
				} catch (err) {
					toast.error('Gagal menghapus channel', {
						description: err.response?.data?.message || err.message,
					});
				}
			})
			.catch(() => {});
	};

	return (
		<div className='grid gap-8'>
			<Heading>
				<HeadingTitle>Channel Pembayaran</HeadingTitle>
				<HeadingDescription>
					Kelola daftar bank dan e-wallet tujuan pembayaran donasi.
				</HeadingDescription>

				<div className='flex items-center justify-end'>
					<Link to='/dashboard/payment-channels/create'>
						<Button>Tambah Channel</Button>
					</Link>
				</div>
			</Heading>

			<div className='w-full overflow-x-auto border rounded-lg border-zinc-200'>
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>Tipe</TableHead>
							<TableHead>Nama</TableHead>
							<TableHead>Nomor</TableHead>
							<TableHead>Atas Nama</TableHead>
							<TableHead>Status</TableHead>
							<TableHead>Aksi</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{result.map((channel) => (
							<TableRow key={channel.id}>
								<TableCell>{TYPE_LABELS[channel.type] || channel.type}</TableCell>
								<TableCell className='font-medium'>{channel.name}</TableCell>
								<TableCell className='font-mono'>
									{channel.account_number || '—'}
								</TableCell>
								<TableCell>{channel.account_holder || '—'}</TableCell>
								<TableCell>
									<Badge variant={channel.is_active ? 'success' : 'outline'}>
										{channel.is_active ? 'Aktif' : 'Nonaktif'}
									</Badge>
								</TableCell>
								<TableCell>
									<div className='flex items-center gap-2'>
										<Link to={channel.id + '/edit'} relative='path'>
											<button className='bg-transparent hover:text-amber-500'>
												Edit
											</button>
										</Link>
										<button
											onClick={() => handleDelete(channel.id)}
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

export default ListPaymentChannels;
