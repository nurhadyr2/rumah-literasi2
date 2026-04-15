import * as React from 'react';
import { toast } from 'sonner';
import useSWR, { useSWRConfig } from 'swr';
import { Link, useParams } from 'react-router';
import { useConfirm } from '@/hooks/use-confirm';
import { ArrowLeft } from 'lucide-react';

import axios from '@/libs/axios';

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
import { Map } from '@/components/map';
import { Badge } from '@/components/ui/badge';

const ShowAddress = () => {
	const { id } = useParams();
	const { confirm } = useConfirm();
	const { mutate } = useSWRConfig();

	const {
		error,
		data: result,
		isLoading: fetching,
	} = useSWR('/addresses/' + id);

	const handleDefault = async (id) => {
		confirm({
			title: 'Konfirmasi Aksi',
			description: 'Jadikan alamat ini sebagai alamat utama?',
		})
			.then(async () => {
				try {
					await axios.patch('/addresses/' + id + '/default');

					mutate('/addresses');
					mutate('/addresses/' + id);
					toast('Alamat dijadikan utama', {
						description: 'Alamat berhasil dijadikan sebagai alamat utama',
					});
				} catch (error) {
					toast.error('Gagal menjadikan alamat utama', {
						description: error.response?.data?.message || error.message,
					});
					console.error(error);
				}
			})
			.catch(() => {});
	};

	return (
		<div className='grid gap-8'>
			<Heading>
				<HeadingTitle className='flex items-center justify-between'>
					<span>Detail Alamat</span>
					{result && result.data.is_default && <Badge>Utama</Badge>}
				</HeadingTitle>
				<HeadingDescription>
					Lihat dan kelola detail alamat Anda.
				</HeadingDescription>
			</Heading>

			<Error error={!fetching && error} />
			<Loading loading={fetching} />

			{result && (
				<div className='grid gap-6 lg:grid-cols-2'>
					<div>
						<Label htmlFor='id'>ID Area</Label>
						<Input
							disabled
							type='text'
							className='uppercase'
							defaultValue={result.data.area_id}
						/>
					</div>

					<div>
						<Label htmlFor='area_id'>Nama Kontak</Label>
						<Input
							disabled
							type='text'
							defaultValue={result.data.contact_name}
						/>
					</div>

					<div>
						<Label htmlFor='area_id'>No. Telepon</Label>
						<Input
							disabled
							type='text'
							defaultValue={result.data.contact_phone}
						/>
					</div>

					<div className='col-span-full'>
						<Label htmlFor='name'>Nama Alamat</Label>
						<Input disabled type='text' defaultValue={result.data.name} />
					</div>

					<div className='col-span-full'>
						<Label htmlFor='street_address'>Alamat Lengkap</Label>
						<Textarea disabled defaultValue={result.data.street_address} />
					</div>

					<div>
						<Label htmlFor='province'>Provinsi</Label>
						<Input
							disabled
							type='text'
							defaultValue={result.data.province.name}
						/>
					</div>

					<div>
						<Label htmlFor='city'>Kota</Label>
						<Input disabled type='text' defaultValue={result.data.city.name} />
					</div>

					<div>
						<Label htmlFor='district'>Kecamatan</Label>
						<Input
							disabled
							type='text'
							defaultValue={result.data.district.name}
						/>
					</div>

					<div>
						<Label htmlFor='zipcode'>Kode Pos</Label>
						<Input disabled type='text' defaultValue={result.data.zipcode} />
					</div>

					<div className='col-span-full'>
						<Label htmlFor='note'>Catatan</Label>
						<Textarea
							disabled
							defaultValue={result.data.note || 'Tidak ada catatan'}
						/>
					</div>

					<div className='col-span-full'>
						<Label htmlFor='location'>Lokasi</Label>
						<Map
							location={{
								latitude: result.data.latitude,
								longitude: result.data.longitude,
							}}
							className='w-full aspect-banner'
							readonly
						/>
					</div>

					<div className='col-span-full'>
						<div className='flex items-center gap-2'>
							<Link to='/dashboard/addresses'>
								<Button variant='outline'>
									<ArrowLeft className='size-4 sm:mr-2' />
									<span className='hidden sm:inline'>Kembali</span>
								</Button>
							</Link>

							{!result.data.is_default && (
								<Button
									variant='outline'
									onClick={() => {
										if (result.data.is_default) return;
										handleDefault(result.data.id);
									}}>
									Jadikan Utama
								</Button>
							)}

							<Link to={'/dashboard/addresses/' + result.data.id + '/edit'}>
								<Button>Edit Alamat</Button>
							</Link>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};

export default ShowAddress;