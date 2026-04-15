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

import MemberForm from '@/components/members/form-member';

const CreateMember = () => {
	const navigate = useNavigate();
	const { mutate } = useSWRConfig();

	const onSubmit = async (data) => {
		try {
			await axios.post('/members', data, {
				headers: { 'Content-Type': 'application/json' },
			});
			toast('Member created', {
				description: 'Successfully created member',
			});

			mutate('/members');
			navigate('/dashboard/members');
		} catch (error) {
			toast.error('Failed to create member', {
				description: error.response?.data?.message || error.message,
			});
			console.error(error);
		}
	};

	return (
		<div className='grid gap-8'>
			<Heading>
				<HeadingTitle>Tambah Anggota</HeadingTitle>
				<HeadingDescription>
					Buat anggota untuk mendukung kegiatan literasi baca-tulis di Mraen Mimpi
				</HeadingDescription>
			</Heading>

			<MemberForm action={onSubmit} label='Create Member' />
		</div>
	);
};

export default CreateMember;
