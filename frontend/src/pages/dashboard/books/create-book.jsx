import * as React from 'react';
import { toast } from 'sonner';
import { useSWRConfig } from 'swr';
import { useNavigate } from 'react-router';

import axios from '@/libs/axios';

import {
	Heading,
	HeadingDescription,
	HeadingTitle,
} from '@/components/ui/heading';

import BookForm from '@/components/books/form-book';

const CreateBook = () => {
	const navigate = useNavigate();
	const { mutate } = useSWRConfig();

	const onSubmit = async (data) => {
		try {
			await axios.post('/books', data, {
				headers: { 'Content-Type': 'multipart/form-data' },
			});

			toast('Book created', {
				description: 'Successfully created book',
			});

			mutate('/books');
			navigate('/dashboard/books');
		} catch (error) {
			toast.error('Failed to create book', {
				description: error.response.data.message || error.message,
			});
			console.error(error);
		}
	};

	return (
		<div className='grid gap-8'>
			<Heading>
				<HeadingTitle>Tambah Buku</HeadingTitle>
				<HeadingDescription>
					Tambahkan buku yang ingin didonasikan ke dalam sistem kami. Pastikan untuk mengisi informasi buku dengan lengkap dan akurat agar dapat membantu 
					kami dalam proses distribusi buku kepada mereka yang membutuhkan.
				</HeadingDescription>
			</Heading>

			<BookForm action={onSubmit} label='Create Book' />
		</div>
	);
};

export default CreateBook;
