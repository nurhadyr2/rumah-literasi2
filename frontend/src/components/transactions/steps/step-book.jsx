import * as React from 'react';
import useSWR from 'swr';

import { Plus, Minus } from 'lucide-react';
import { STEPS, useTransactionStore } from '@/store/use-transactions';

import { Button } from '@/components/ui/button';
import { Empty } from '@/components/empty';
import { Error } from '@/components/error';
import { Loading } from '@/components/loading';

import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table';

import { toast } from 'sonner';
import { useConfirm } from '@/hooks/use-confirm';
import { useResultState } from '@/hooks/use-result-state';
import { BookCard } from '@/components/books/book-card';

const StepBook = () => {
	const { confirm } = useConfirm();
	const { books, append, reduce, purge, reset, route } = useTransactionStore();

	const { error, data, isLoading: loading } = useSWR('/books');
	const { result, empty } = useResultState(error, loading, data);

	const handleSubmit = () => {
		if (books.length === 0) {
			toast('Silakan tambahkan buku', {
				description: 'Tambahkan buku terlebih dahulu sebelum melanjutkan',
			});
			return;
		}

		route(STEPS.RECIPIENT);
	};

	const handleReset = () => {
		confirm({
			title: 'Konfirmasi Aksi',
			variant: 'destructive',
			description: 'Apakah Anda yakin ingin mereset data?',
		})
			.then(() => reset())
			.catch(() => {
				// pass
			});
	};

	return (
		<div className='relative grid gap-6 xl:grid-cols-3'>
			<div className='grid grid-cols-3 gap-6 md:grid-cols-4 lg:grid-cols-4 xl:col-span-2'>
				{result.map((book) => (
					<BookCard book={book} key={book.id} onClick={() => append(book)} />
				))}

				<Error error={!loading && error} />
				<Empty empty={!loading && empty} />
				<Loading loading={loading} />
			</div>
			<div className='flex flex-col gap-6'>
				<div className='w-full overflow-x-auto border rounded-lg border-zinc-200'>
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Judul</TableHead>
								<TableHead className='text-right'>Jumlah</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{books.map((item) => (
								<TableRow key={item.book.id}>
									<TableCell>
										<p className='w-48 truncate'>{item.book.title}</p>
									</TableCell>
									<TableCell>
										<div className='flex justify-end gap-4'>
											<Minus
												onClick={() => reduce(item.book)}
												className='cursor-pointer text-zinc-400 hover:text-primary-500 size-5'
											/>
											<span>{item.amount}</span>
											<Plus
												onClick={() => append(item.book)}
												className='cursor-pointer text-zinc-400 hover:text-primary-500 size-5'
											/>
										</div>
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
					<Empty empty={books.length === 0} />
				</div>

				<div className='flex items-center justify-end gap-2 col-span-full'>
					<Button variant='destructive' onClick={handleReset}>
						Reset Data
					</Button>
					<Button variant='outline' onClick={() => purge()}>
						Hapus Semua
					</Button>
					<Button onClick={handleSubmit}>Lanjut</Button>
				</div>
			</div>
		</div>
	);
};

export default StepBook;