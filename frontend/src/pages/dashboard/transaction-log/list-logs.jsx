import * as React from 'react';
import useSWR from 'swr';
import { Link } from 'react-router';

import { usePagination } from '@/hooks/use-pagination';
import { AvatarGroup } from '@/components/ui/avatar';

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
import { useResultState } from '@/hooks/use-result-state';
import { Pagination } from '@/components/pagination';
import { Input } from '@/components/ui/input';
import { formatDate } from '@/libs/utils';

const ListLogs = () => {
	const { page, limit, search, setSearch, debounced } = usePagination();

	const {
		error,
		data,
		isLoading: loading,
	} = useSWR([
		'logs',
		{
			params: {
				page: page,
				limit: limit,
				search: debounced,
			},
		},
	]);

	const { result, pagination, empty } = useResultState(error, loading, data);

	return (
		<div className='grid gap-8'>
			<Heading>
				<HeadingTitle>Log Sistem</HeadingTitle>
				<HeadingDescription>
					Lihat semua log sistem dengan fitur pagination dan pencarian.
				</HeadingDescription>
			</Heading>

			<div className='flex items-center justify-between'>
				<Input
					value={search}
					type='search'
					placeholder='Cari berdasarkan aksi, pesan...'
					onChange={(e) => setSearch(e.target.value)}
				/>
			</div>

			<div className='w-full overflow-x-auto border rounded-xl border-zinc-200'>
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>User</TableHead>
							<TableHead>Waktu</TableHead>
							<TableHead>Aksi</TableHead>
							<TableHead>Aksi</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{result.map((log) => (
							<TableRow key={log.uuid}>
								<TableCell>
									{log.user && <AvatarGroup user={log.user} />}
								</TableCell>
								<TableCell>{formatDate(log.createdAt)}</TableCell>
								<TableCell>{log.action}</TableCell>
								<TableCell>
									<div className='flex items-center gap-2'>
										<Link to={`/dashboard/logs/${log.uuid}/detail`}>
											<button className='bg-transparent hover:text-amber-500'>
												Detail
											</button>
										</Link>
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

export default ListLogs;
