import * as React from 'react';
import useSWR from 'swr';
import { Link } from 'react-router';

import {
	Heading,
	HeadingDescription,
	HeadingTitle,
} from '@/components/ui/heading';
import { Loading } from '@/components/loading';
import { Error } from '@/components/error';
import { Button } from '@/components/ui/button';
import { MapPin, Phone, Mail } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Map } from '@/components/map';
import { Card } from '@/components/card';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/hooks/use-auth';
import { ROLES } from '@/libs/constant';

const ShowMerchant = () => {
	const { user, loading } = useAuth();
	const { error, data: result, isLoading: fetching } = useSWR('/merchant');

	const allowed = React.useMemo(() => {
		if (loading) return false;
		return [ROLES.SUPERADMIN].includes(user.role);
	}, [user, loading]);

	return (
		<div className='grid gap-8'>
			<Heading>
				<HeadingTitle>Detail Merchant</HeadingTitle>
				<HeadingDescription>
					Kelola informasi dan detail merchant
				</HeadingDescription>
			</Heading>

			<Loading loading={fetching} />
			<Error error={!fetching && error} />

			{result && (
				<React.Fragment>
					<div className='grid gap-6 lg:grid-cols-3'>
						<Link to={'tel:' + result.data.phone}>
							<Card
								className='text-sm'
								content={{
									icon: Phone,
									title: 'Telepon',
									description: result.data.phone,
								}}
							/>
						</Link>

						<Link to={'mailto:' + result.data.email}>
							<Card
								className='text-sm'
								content={{
									icon: Mail,
									title: 'Email',
									description: result.data.email,
								}}
							/>
						</Link>

						<Card
							className='text-sm'
							content={{
								icon: MapPin,
								title: 'ID Area',
								description: result.data.area_id,
							}}
						/>
					</div>

					<div className='grid gap-6 lg:grid-cols-2'>
						<div className='col-span-full'>
							<Label htmlFor='title'>Nama</Label>
							<Input disabled type='text' defaultValue={result.data.name} />
						</div>

						<div className='col-span-full'>
							<Label htmlFor='description'>Alamat</Label>
							<Textarea
								disabled
								type='text'
								defaultValue={result.data.address}
							/>
						</div>

						<div className='col-span-full'>
							<Label htmlFor='description'>Kode Pos</Label>
							<Input disabled type='text' defaultValue={result.data.zipcode} />
						</div>

						<div className='col-span-full'>
							<Label htmlFor='location'>Lokasi</Label>
							<div className='mt-2'>
								<Map
									location={{
										latitude: result.data.latitude,
										longitude: result.data.longitude,
									}}
									className='w-full aspect-banner'
									readonly
								/>
							</div>
						</div>
					</div>

					{allowed && (
						<div className='flex items-center gap-2'>
							<Link to={'/dashboard/merchant/edit'}>
								<Button>Edit Merchant</Button>
							</Link>
						</div>
					)}
				</React.Fragment>
			)}
		</div>
	);
};

export default ShowMerchant;