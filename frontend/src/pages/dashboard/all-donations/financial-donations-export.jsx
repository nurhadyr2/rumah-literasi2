import * as React from 'react';
import useSWR from 'swr';
import { Download } from 'lucide-react';
import * as XLSX from 'xlsx';

import { currency, formatDate } from '@/libs/utils';
import { PAYMENT_STATUS } from '@/libs/constant';
import { usePagination, useString } from '@/hooks/use-pagination';

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
import { AvatarGroup } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Loading } from '@/components/loading';
import { Empty } from '@/components/empty';
import { Error } from '@/components/error';

const timestamp = () => {
	const d = new Date();
	return (
		[
			d.getFullYear(),
			String(d.getMonth() + 1).padStart(2, '0'),
			String(d.getDate()).padStart(2, '0'),
		].join('') +
		'_' +
		[
			String(d.getHours()).padStart(2, '0'),
			String(d.getMinutes()).padStart(2, '0'),
		].join('')
	);
};

const buildRows = (financial = []) =>
	financial.map((d) => ({
		ID: d.id,
		UUID: d.uuid || '',
		Nama: d.user?.name || '',
		Email: d.user?.email || '',
		'Jumlah (Rp)': d.amount,
		Status: d.status,
		Catatan: d.notes || '',
		'Catatan Penerimaan': d.acceptance_notes || '',
		'Order ID': d.order_id || '',
		'Tanggal Dibuat': formatDate(d.createdAt),
	}));

const exportToExcel = (financial) => {
	const rows = buildRows(financial);
	if (rows.length === 0) return;
	const ws = XLSX.utils.json_to_sheet(rows);

	const colWidths = Object.keys(rows[0]).map((key) => ({
		wch: Math.max(key.length, 16),
	}));
	ws['!cols'] = colWidths;

	const wb = XLSX.utils.book_new();
	XLSX.utils.book_append_sheet(wb, ws, 'Donasi Finansial');
	XLSX.writeFile(wb, `donasi_finansial_${timestamp()}.xlsx`);
};

const FinancialDonationsExport = () => {
	const { search, setSearch, debounced } = usePagination();
	const [status, setStatus] = useString('status');

	const {
		data: finData,
		error,
		isLoading: loading,
	} = useSWR([
		'financial-donations',
		{ params: { page: 1, limit: 1000, search: debounced, status } },
	]);

	const rows = finData?.data?.rows || [];
	const empty = !loading && !error && rows.length === 0;

	const handleExport = () => exportToExcel(rows);

	return (
		<div className='grid gap-8'>
			<Heading>
				<HeadingTitle>Semua Donasi Finansial</HeadingTitle>
				<HeadingDescription>
					Daftar lengkap donasi uang dan ekspor ke Excel.
				</HeadingDescription>
			</Heading>

			<div className='flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3'>
				<div className='flex flex-wrap items-center gap-2 w-full'>
					<Input
						value={search}
						type='search'
						placeholder='Cari nama donatur...'
						onChange={(e) => setSearch(e.target.value)}
						className='max-w-xs'
					/>

					<Select
						value={status}
						className='max-w-44'
						onChange={(e) => setStatus(e.target.value)}>
						<option value=''>Semua status</option>
						{Object.values(PAYMENT_STATUS).map((s) => (
							<option key={s} value={s}>
								{s}
							</option>
						))}
					</Select>
				</div>

				<Button
					variant='outline'
					onClick={handleExport}
					disabled={loading || rows.length === 0}
					className='flex-none flex items-center gap-2 whitespace-nowrap'>
					<Download className='size-4' />
					Export Excel
				</Button>
			</div>

			<div className='w-full overflow-x-auto border rounded-xl border-zinc-200'>
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>Donatur</TableHead>
							<TableHead>Jumlah</TableHead>
							<TableHead>Status</TableHead>
							<TableHead>Catatan</TableHead>
							<TableHead>Tanggal</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{rows.map((d) => (
							<TableRow key={d.id}>
								<TableCell>
									{d.user ? (
										<AvatarGroup user={d.user} />
									) : (
										<span className='text-zinc-400'>—</span>
									)}
								</TableCell>
								<TableCell>{currency(d.amount)}</TableCell>
								<TableCell>
									<Badge
										variant={
											d.status === PAYMENT_STATUS.SUCCESS
												? 'success'
												: d.status === PAYMENT_STATUS.FAILED
													? 'destructive'
													: 'outline'
										}>
										{d.status}
									</Badge>
								</TableCell>
								<TableCell className='max-w-48 truncate'>
									{d.notes || '—'}
								</TableCell>
								<TableCell className='whitespace-nowrap'>
									{formatDate(d.createdAt)}
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>

				<Error error={!loading && error} />
				<Empty empty={empty} />
				<Loading loading={loading} />
			</div>

			<p className='text-xs text-zinc-400'>
				Menampilkan {rows.length} donasi. Export Excel akan mengunduh semua data
				sesuai filter aktif.
			</p>
		</div>
	);
};

export default FinancialDonationsExport;
