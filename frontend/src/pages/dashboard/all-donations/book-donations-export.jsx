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

const formatItems = (items = []) =>
	items
		.map(
			(it) =>
				`[${it.title} - ${it.author} (${it.publisher || '-'} - ${it.year || '-'})] x${it.amount}`
		)
		.join('\n');

const buildRows = (book = []) =>
	book.map((d) => ({
		ID: d.id,
		UUID: d.uuid || '',
		Nama: d.user?.name || '',
		Email: d.user?.email || '',
		Status: d.status,
		Metode: d.method || '',
		Kurir: (d.courier_code || '').toUpperCase(),
		'Layanan Kurir': (d.courier_service_code || '').toUpperCase(),
		'Biaya Kirim (Rp)': d.shipping_fee || 0,
		'Estimasi Nilai (Rp)': d.estimated_value || 0,
		'Berat (g)': d.weight || 0,
		'Panjang (cm)': d.length || 0,
		'Lebar (cm)': d.width || 0,
		'Tinggi (cm)': d.height || 0,
		'Estimasi Kirim': d.shipping_eta || '',
		'Order ID': d.order_id || '',
		'Tracking ID': d.tracking_id || '',
		Alamat: d.address?.street_address || '',
		'Kode Pos': d.address?.zipcode || '',
		'Jadwal Pickup': d.pickup_date
			? `${d.pickup_date} ${d.pickup_time_slot || ''}`.trim()
			: '',
		'Dropoff Point': d.dropoff_point_name || '',
		'Catatan Penerimaan': d.acceptance_notes || '',
		'Item Buku (Keterangan)': formatItems(d.book_donation_items || []),
		'Jumlah Item': (d.book_donation_items || []).reduce(
			(sum, it) => sum + (Number(it.amount) || 0),
			0
		),
		'Tanggal Dibuat': formatDate(d.createdAt),
	}));

const exportToExcel = (book) => {
	const rows = buildRows(book);
	if (rows.length === 0) return;
	const ws = XLSX.utils.json_to_sheet(rows);

	const colWidths = Object.keys(rows[0]).map((key) => {
		if (key === 'Item Buku') return { wch: 60 };
		if (key === 'Alamat') return { wch: 40 };
		return { wch: Math.max(key.length, 16) };
	});
	ws['!cols'] = colWidths;

	const range = XLSX.utils.decode_range(ws['!ref']);
	for (let R = range.s.r; R <= range.e.r; ++R) {
		const cell = ws[XLSX.utils.encode_cell({ r: R, c: range.s.c })];
		if (!cell) continue;
	}

	for (let R = range.s.r + 1; R <= range.e.r; ++R) {
		for (let C = range.s.c; C <= range.e.c; ++C) {
			const cellRef = XLSX.utils.encode_cell({ r: R, c: C });
			const cell = ws[cellRef];
			if (cell && typeof cell.v === 'string' && cell.v.includes('\n')) {
				cell.s = { alignment: { wrapText: true, vertical: 'top' } };
			}
		}
	}

	const wb = XLSX.utils.book_new();
	XLSX.utils.book_append_sheet(wb, ws, 'Donasi Buku');
	XLSX.writeFile(wb, `donasi_buku_${timestamp()}.xlsx`);
};

const BookDonationsExport = () => {
	const { search, setSearch, debounced } = usePagination();
	const [status, setStatus] = useString('status');

	const {
		data: bookData,
		error,
		isLoading: loading,
	} = useSWR([
		'book-donations',
		{ params: { page: 1, limit: 1000, search: debounced, status } },
	]);

	const rows = bookData?.data?.rows || [];
	const empty = !loading && !error && rows.length === 0;

	const handleExport = () => exportToExcel(rows);

	return (
		<div className='grid gap-8'>
			<Heading>
				<HeadingTitle>Semua Donasi Buku</HeadingTitle>
				<HeadingDescription>
					Daftar lengkap donasi buku beserta item dan ekspor ke Excel.
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
							<TableHead>Status</TableHead>
							<TableHead>Item Buku</TableHead>
							<TableHead>Jumlah</TableHead>
							<TableHead>Kurir</TableHead>
							<TableHead>Estimasi Kirim</TableHead>
							<TableHead>Biaya Kirim</TableHead>
							<TableHead>Estimasi Nilai</TableHead>
							<TableHead>Dimensi (cm)</TableHead>
							<TableHead>Berat (g)</TableHead>
							<TableHead>Metode</TableHead>
							<TableHead>Alamat</TableHead>
							<TableHead>Kode Pos</TableHead>
							<TableHead>Order ID</TableHead>
							<TableHead>Tracking ID</TableHead>
							<TableHead>Tanggal</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{rows.map((d) => {
							const items = d.book_donation_items || [];
							const itemCount = items.reduce(
								(sum, it) => sum + (Number(it.amount) || 0),
								0
							);
							const courierLabel =
								[d.courier_code, d.courier_service_code]
									.filter(Boolean)
									.join(' – ')
									.toUpperCase() || '—';
							const dimensions = [d.length, d.width, d.height].every(Boolean)
								? `${d.length} × ${d.width} × ${d.height}`
								: '—';
							const methodLabel =
								d.method === 'pickup'
									? `Pickup${d.pickup_date ? ` — ${d.pickup_date} ${d.pickup_time_slot || ''}` : ''}`
									: d.method === 'drop_off'
										? `Dropoff${d.dropoff_point_name ? ` — ${d.dropoff_point_name}` : ''}`
										: '—';
							return (
								<TableRow key={d.id} className='align-top'>
									<TableCell>
										{d.user ? (
											<AvatarGroup user={d.user} />
										) : (
											<span className='text-zinc-400'>—</span>
										)}
									</TableCell>
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
									<TableCell className='min-w-80 max-w-md'>
										{items.length === 0 ? (
											<span className='text-zinc-400'>—</span>
										) : (
											<ul className='grid gap-1 text-xs'>
												{items.map((it) => (
													<li key={it.id} className='whitespace-normal'>
														<span className='font-medium'>{it.title}</span>
														<span className='text-zinc-500'>
															{' '}
															— {it.author}
														</span>
														<span className='text-zinc-400'>
															{' '}
															({it.publisher || '-'}, {it.year || '-'}) ×
															{it.amount}
														</span>
													</li>
												))}
											</ul>
										)}
									</TableCell>
									<TableCell className='whitespace-nowrap'>
										{itemCount}
									</TableCell>
									<TableCell className='whitespace-nowrap'>
										{courierLabel}
									</TableCell>
									<TableCell className='whitespace-nowrap'>
										{d.shipping_eta || '—'}
									</TableCell>
									<TableCell className='whitespace-nowrap'>
										{currency(d.shipping_fee || 0)}
									</TableCell>
									<TableCell className='whitespace-nowrap'>
										{currency(d.estimated_value || 0)}
									</TableCell>
									<TableCell className='whitespace-nowrap'>
										{dimensions}
									</TableCell>
									<TableCell className='whitespace-nowrap'>
										{d.weight || '—'}
									</TableCell>
									<TableCell className='min-w-44 whitespace-normal'>
										{methodLabel}
									</TableCell>
									<TableCell className='min-w-60 max-w-xs whitespace-normal'>
										{d.address?.street_address || '—'}
									</TableCell>
									<TableCell className='whitespace-nowrap'>
										{d.address?.zipcode || '—'}
									</TableCell>
									<TableCell className='whitespace-nowrap'>
										{d.order_id || '—'}
									</TableCell>
									<TableCell className='whitespace-nowrap'>
										{d.tracking_id || '—'}
									</TableCell>
									<TableCell className='whitespace-nowrap'>
										{formatDate(d.createdAt)}
									</TableCell>
								</TableRow>
							);
						})}
					</TableBody>
				</Table>

				<Error error={!loading && error} />
				<Empty empty={empty} />
				<Loading loading={loading} />
			</div>

			<p className='text-xs text-zinc-400'>
				Menampilkan {rows.length} donasi. Export Excel akan mengunduh semua data
				sesuai filter aktif, termasuk detail item buku.
			</p>
		</div>
	);
};

export default BookDonationsExport;
