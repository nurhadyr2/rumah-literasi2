import * as React from 'react';
import useSWR from 'swr';
import { Link, useParams } from 'react-router';
import { ArrowLeft } from 'lucide-react';

import {
	Heading,
	HeadingDescription,
	HeadingTitle,
} from '@/components/ui/heading';

import { Loading } from '@/components/loading';
import { Error } from '@/components/error';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';

const ShowEvent = () => {
	const { id } = useParams();
	const { error, data: result, isLoading: fetching } = useSWR('public/events/' + id);

	return (
		<div className='grid gap-8'>
			<Heading>
				<HeadingTitle>Detail Acara</HeadingTitle>
				<HeadingDescription>
					Melihat informasi lengkap mengenai acara.
				</HeadingDescription>
			</Heading>

			<Error error={!fetching && error} />
			<Loading loading={fetching} />

			{result && (
				<div className='grid gap-6 lg:grid-cols-2'>
					<div className='col-span-full'>
						<Label htmlFor='title'>Judul</Label>
						<Input disabled type='text' defaultValue={result.data.title} />
					</div>

					<div className='col-span-full'>
						<Label htmlFor='description'>Deskripsi</Label>
						<Textarea disabled defaultValue={result.data.description} />
					</div>

					<div>
						<Label htmlFor='date'>Tanggal</Label>
						<Input disabled type='text' defaultValue={result.data.date} />
					</div>

					<div>
						<Label htmlFor='time'>Waktu</Label>
						<Input disabled type='text' defaultValue={result.data.time} />
					</div>

					<div className='col-span-full'>
						<Label htmlFor='location'>Lokasi</Label>
						<Textarea
							disabled
							type='text'
							defaultValue={result.data.location}
						/>
					</div>

					{result.data.media && (
						<div className='col-span-full'>
							<Label htmlFor='image'>Gambar Acara</Label>
							<div className='mt-2'>
								<img
									src={result.data.media}
									alt={result.data.title}
									className='object-contain aspect-[2/1] border rounded-xl border-zinc-200 bg-zinc-100'
								/>
							</div>
						</div>
					)}

					{result.data.user && (
						<div className='col-span-full'>
							<Label htmlFor='createdBy'>Dibuat Oleh</Label>
							<Input
								disabled
								type='text'
								defaultValue={result.data.user.name}
							/>
						</div>
					)}

					<div className='col-span-full'>
						<div className='flex flex-wrap items-center gap-2'>
							<Link to='/dashboard/events'>
								<Button variant='outline'>
									<ArrowLeft className='size-4 sm:mr-2' />
									<span className='hidden sm:inline'>Kembali</span>
								</Button>
							</Link>
							<Link to={'/dashboard/events/' + result.data.id + '/edit'}>
								<Button>Edit Acara</Button>
							</Link>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};

export default ShowEvent;