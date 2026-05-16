import * as React from 'react';
import useSWR from 'swr';
import { Download } from 'lucide-react';
import * as XLSX from 'xlsx';

import { currency, formatDate } from '@/libs/utils';
import { PAYMENT_STATUS } from '@/libs/constant';
import { usePagination, useString } from '@/hooks/use-pagination';
import { cn } from '@/libs/utils';

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

const buildRows = (financial = [], book = []) => {
	const fin = financial.map((d) => ({
		Tipe: 'Donasi Uang',
		ID: d.id,
		UUID: d.uuid || '',
		Nama: d.user?.name || '',
		Email: d.user?.email || '',
		'Jumlah / Biaya Kirim (Rp)': d.amount,
		Status: d.status,
		Catatan: d.notes || '',
		'Catatan Penerimaan': d.acceptance_notes || '',
		Kurir: '',
		'Layanan Kurir': '',
		'Estimasi Kirim': '',
		'ID Pesanan': '',
		'ID Pelacakan': '',
		'Tanggal Dibuat': formatDate(d.createdAt),
	}));

	const bk = book.map((d) => ({
		Tipe: 'Donasi Buku',
		ID: d.id,
		UUID: d.uuid || '',
		Nama: d.user?.name || '',
		Email: d.user?.email || '',
		'Jumlah / Biaya Kirim (Rp)': d.shipping_fee || 0,
		Status: d.status,
		Catatan: '',
		'Catatan Penerimaan': d.acceptance_notes || '',
		Kurir: d.courier_code || '',
		'Layanan Kurir': d.courier_service_code || '',
		'Estimasi Kirim': d.shipping_eta || '',
		'ID Pesanan': d.order_id || '',
		'ID Pelacakan': d.tracking_id || '',
		'Tanggal Dibuat': formatDate(d.createdAt),
	}));

	return [...fin, ...bk].sort(
		(a, b) => new Date(b['Tanggal Dibuat']) - new Date(a['Tanggal Dibuat'])
	);
};

const exportToExcel = (financial, book) => {
	const rows = buildRows(financial, book);
	const ws = XLSX.utils.json_to_sheet(rows);

	const colWidths = Object.keys(rows[0] || {}).map((key) => ({
		wch: Math.max(key.length, 16),
	}));
	ws['!cols'] = colWidths;

	const wb = XLSX.utils.book_new();
	XLSX.utils.book_append_sheet(wb, ws, 'Semua Donasi');
	XLSX.writeFile(wb, `semua_donasi_${timestamp()}.xlsx`);
};

const AllDonations = () => {
	const { search, setSearch, debounced } = usePagination();
	const [status, setStatus] = useString('status');
	const [type, setType] = useString('type');

	const {
		data: finData,
		error: finError,
		isLoading: finLoading,
	} = useSWR([
		'financial-donations',
		{ params: { page: 1, limit: 1000, search: debounced, status } },
	]);

	const {
		data: bookData,
		error: bookError,
		isLoading: bookLoading,
	} = useSWR([
		'book-donations',
		{ params: { page: 1, limit: 1000, search: debounced, status } },
	]);

	const loading = finLoading || bookLoading;
	const error = finError || bookError;

	const rows = React.useMemo(() => {
		const financial = finData?.data?.rows || [];
		const book = bookData?.data?.rows || [];

		const fin = financial.map((d) => ({
			_type: 'financial',
			_raw: d,
			id: d.id,
			tipe: 'Donasi Uang',
			nama: d.user?.name || '—',
			email: d.user?.email || '—',
			nominal: currency(d.amount),
			status: d.status,
			info: d.notes || '—',
			tanggal: d.createdAt,
		}));

		const bk = book.map((d) => ({
			_type: 'book',
			_raw: d,
			id: d.id,
			tipe: 'Donasi Buku',
			nama: d.user?.name || '—',
			email: d.user?.email || '—',
			nominal: currency(d.shipping_fee || 0),
			status: d.status,
			info:
				[d.courier_code, d.courier_service_code]
					.filter(Boolean)
					.join(' – ')
					.toUpperCase() || '—',
			tanggal: d.createdAt,
		}));

		let merged = [...fin, ...bk].sort(
			(a, b) => new Date(b.tanggal) - new Date(a.tanggal)
		);

		if (type === 'financial')
			merged = merged.filter((r) => r._type === 'financial');
		if (type === 'book') merged = merged.filter((r) => r._type === 'book');

		return merged;
	}, [finData, bookData, type]);

	const empty = !loading && !error && rows.length === 0;

	const handleExport = () => {
		const financial = finData?.data?.rows || [];
		const book = bookData?.data?.rows || [];
		exportToExcel(financial, book);
	};

	return (
		<div className='grid gap-8'>
			<Heading>
				<HeadingTitle>Semua Donasi</HeadingTitle>
				<HeadingDescription>
					Rekap seluruh donasi masuk — donasi uang dan donasi buku dalam satu
					tabel.
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
						value={type}
						className='max-w-44'
						onChange={(e) => setType(e.target.value)}>
						<option value=''>Semua tipe</option>
						<option value='financial'>Donasi Uang</option>
						<option value='book'>Donasi Buku</option>
					</Select>

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
					disabled={loading}
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
							<TableHead>Tipe</TableHead>
							<TableHead>Nominal / Biaya Kirim</TableHead>
							<TableHead>Status</TableHead>
							<TableHead>Keterangan</TableHead>
							<TableHead>Tanggal</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{rows.map((row, i) => (
							<TableRow key={`${row._type}-${row.id}-${i}`}>
								<TableCell>
									{row._raw?.user ? (
										<AvatarGroup user={row._raw.user} />
									) : (
										<span className='text-zinc-400'>—</span>
									)}
								</TableCell>
								<TableCell>
									<Badge
										variant={row._type === 'financial' ? 'info' : 'primary'}>
										{row.tipe}
									</Badge>
								</TableCell>
								<TableCell>{row.nominal}</TableCell>
								<TableCell>
									<Badge
										variant={
											row.status === PAYMENT_STATUS.SUCCESS
												? 'success'
												: row.status === PAYMENT_STATUS.FAILED
													? 'destructive'
													: 'outline'
										}>
										{row.status}
									</Badge>
								</TableCell>
								<TableCell className='max-w-48 truncate'>{row.info}</TableCell>
								<TableCell className='whitespace-nowrap'>
									{formatDate(row.tanggal)}
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

export default AllDonations;
