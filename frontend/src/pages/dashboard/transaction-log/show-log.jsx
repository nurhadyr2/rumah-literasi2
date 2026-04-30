import { Link, useParams } from 'react-router';
import useSWR from 'swr';
import { ArrowLeft } from 'lucide-react';

import {
	Heading,
	HeadingDescription,
	HeadingTitle,
} from '@/components/ui/heading';

import { Button } from '@/components/ui/button';
import { Loading } from '@/components/loading';
import { Error } from '@/components/error';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { CodeBlock } from '@/components/codeblock';

const ShowLog = () => {
	const { uuid } = useParams();
	const { error, data: result, isLoading: fetching } = useSWR('/logs/' + uuid);
	return (
		<div className='grid gap-8'>
			<Heading>
				<HeadingTitle>Detail Log</HeadingTitle>
				<HeadingDescription>
					Lihat informasi detail dari entri log ini.
				</HeadingDescription>
			</Heading>

			<Error error={!fetching && error} />
			<Loading loading={fetching} />

			{result && (
				<div className='grid gap-6 lg:grid-cols-2'>
					<div className='col-span-full'>
						<Label htmlFor='action'>Aksi</Label>
						<Input disabled type='text' defaultValue={result.data.action} />
					</div>

					<div className='col-span-full'>
						<Label htmlFor='message'>Pesan</Label>
						<Textarea disabled defaultValue={result.data.message} />
					</div>

					<div>
						<Label htmlFor='resourceType'>Tipe Resource</Label>
						<Input
							disabled
							type='text'
							defaultValue={result.data.resource_type}
						/>
					</div>

					<div>
						<Label htmlFor='resourceId'>ID Resource</Label>
						<Input
							disabled
							type='text'
							defaultValue={result.data.resource_id}
						/>
					</div>

					<div>
						<Label htmlFor='ipAddress'>Alamat IP</Label>
						<Input disabled type='text' defaultValue={result.data.ip_address} />
					</div>

					<div>
						<Label htmlFor='userAgent'>User Agent</Label>
						<Input disabled type='text' defaultValue={result.data.user_agent} />
					</div>

					<div className='col-span-full'>
						<Label htmlFor='metadata'>Metadata</Label>
						<CodeBlock className='whitespace-pre-wrap break-all'>
							{JSON.stringify(result.data.metadata, null, 2)}
						</CodeBlock>
					</div>

					<div className='col-span-full'>
						<div className='flex items-center gap-2'>
							<Link to='/dashboard/logs'>
								<Button variant='outline'>
									<ArrowLeft className='size-4 sm:mr-2' />
									<span className='hidden sm:inline'>Kembali</span>
								</Button>
							</Link>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};

export default ShowLog;
