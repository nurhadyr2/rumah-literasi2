import * as React from 'react';
import useSWR from 'swr';
import { Link, useParams } from 'react-router';

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
	const { error, data: result, isLoading: fetching } = useSWR('/events/' + id);

	return (
		<div className='grid gap-8'>
			<Heading>
				<HeadingTitle>Detail Event</HeadingTitle>
				<HeadingDescription>
					Lihat informasi lengkap mengenai event ini.
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
						<Textarea disabled defaultValue={result.data.location} />
					</div>

					{result.data.media && (
						<div className='col-span-full'>
							<Label htmlFor='image'>Gambar Event</Label>
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
						<div className='flex items-center gap-2'>
							<Link to='/dashboard/events'>
								<Button variant='outline'>Kembali</Button>
							</Link>
							<Link to={'/dashboard/events/' + result.data.id + '/edit'}>
								<Button>Edit Event</Button>
							</Link>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};

export default ShowEvent;