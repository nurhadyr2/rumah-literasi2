// import useSWR from 'swr';
// import { Link, useParams } from 'react-router';

// import { formatDate } from '@/libs/utils';

// import { Error } from '@/components/error';
// import { Loading } from '@/components/loading';
// import { Button } from '@/components/ui/button';
// import { HeadingTitle } from '@/components/ui/heading';
// import { Calendar, User2, ArrowLeft, MapPin, Clock } from 'lucide-react';

// const ShowEvent = () => {
// 	const { id } = useParams();
// 	const {
// 		error,
// 		data: result,
// 		isLoading: fetching,
// 	} = useSWR('/public/events/' + id);

// 	return (
// 		<div className='container min-h-screen gap-6 py-24 max-w-7xl'>
// 			<Error error={!fetching && error} />
// 			<Loading loading={fetching} />

// 			<div className='flex flex-col items-start gap-4 mb-8'>
// 				<Link to='/events'>
// 					<Button variant='outline' className='flex items-center gap-2'>
// 						<ArrowLeft className='size-4 text-primary-500' />
// 						Kembali ke Daftar Acara
// 					</Button>
// 				</Link>
// 			</div>

// 			{result && (
// 				<div className='grid gap-8'>
// 					<div>
// 						<HeadingTitle className='text-3xl md:text-4xl'>
// 							{result.data.title}
// 						</HeadingTitle>

// 						<div className='flex flex-wrap gap-4 mt-4 text-sm text-zinc-600'>
// 							<div className='flex items-center gap-2'>
// 								<Calendar className='size-5 text-primary-500' />
// 								<span>{formatDate(result.data.date)}</span>
// 							</div>

// 							{result.data.time && (
// 								<div className='flex items-center gap-2'>
// 									<Clock className='size-5 text-primary-500' />
// 									<span>{result.data.time}</span>
// 								</div>
// 							)}

// 							{result.data.location && (
// 								<div className='flex items-center gap-2'>
// 									<MapPin className='size-5 text-primary-500' />
// 									<span>{result.data.location}</span>
// 								</div>
// 							)}
// 						</div>
// 					</div>

// 					<img
// 						src={result.data.media}
// 						alt={result.data.title}
// 						className='object-cover w-full h-full aspect-[2/1] border rounded-xl'
// 					/>

// 					<div className='prose max-w-none'>
// 						<p className='text-lg leading-relaxed text-zinc-700'>
// 							{result.data.description}
// 						</p>
// 					</div>

// 					{result.data.user && (
// 						<div className='flex items-center gap-2'>
// 							<div className='flex items-center justify-center border rounded-full size-12'>
// 								<User2 className='size-5 text-primary-500' />
// 							</div>
// 							<p className='text-zinc-600'>
// 								Dibuat oleh {result.data.user.name}
// 							</p>
// 						</div>
// 					)}
// 				</div>
// 			)}
// 		</div>
// 	);
// };

// export default ShowEvent;

import useSWR from 'swr';
import { Link, useParams } from 'react-router';

import { formatDate } from '@/libs/utils';

import { Error } from '@/components/error';
import { Loading } from '@/components/loading';
import { Button } from '@/components/ui/button';
import { HeadingTitle } from '@/components/ui/heading';
import { Calendar, User2, ArrowLeft, MapPin, Clock } from 'lucide-react';

const ShowEvent = () => {
	const { id } = useParams();
	const {
		error,
		data: result,
		isLoading: fetching,
	} = useSWR('/public/events/' + id);

	return (
		<div className='container min-h-screen gap-6 py-24 max-w-7xl'>
			<Error error={!fetching && error} />
			<Loading loading={fetching} />

			<div className='flex flex-col items-start gap-4 mb-8'>
				<Link to='/events'>
					<Button variant='outline' className='flex items-center gap-2'>
						<ArrowLeft className='size-4 text-primary-500' />
						Kembali ke Daftar Acara
					</Button>
				</Link>
			</div>

			{result && (
				<div className='grid gap-8'>
					<div>
						<HeadingTitle className='text-3xl md:text-4xl'>
							{result.data.title}
						</HeadingTitle>

						<div className='flex flex-wrap gap-4 mt-4 text-sm text-zinc-600'>
							<div className='flex items-center gap-2'>
								<Calendar className='size-5 text-primary-500' />
								<span>{formatDate(result.data.date)}</span>
							</div>

							{result.data.time && (
								<div className='flex items-center gap-2'>
									<Clock className='size-5 text-primary-500' />
									<span>{result.data.time}</span>
								</div>
							)}

							{result.data.location && (
								<div className='flex items-center gap-2'>
									<MapPin className='size-5 text-primary-500' />
									<span>{result.data.location}</span>
								</div>
							)}
						</div>
					</div>

					<img
						src={result.data.media}
						alt={result.data.title}
						className='object-cover w-full h-full aspect-[2/1] border rounded-xl'
					/>

					<div className='prose max-w-none'>
						<p className='text-lg leading-relaxed whitespace-pre-line text-zinc-700'>
							{result.data.description}
						</p>
					</div>

					{result.data.user && (
						<div className='flex items-center gap-2'>
							<div className='flex items-center justify-center border rounded-full size-12'>
								<User2 className='size-5 text-primary-500' />
							</div>
							<p className='text-zinc-600'>
								Dibuat oleh {result.data.user.name}
							</p>
						</div>
					)}
				</div>
			)}
		</div>
	);
};

export default ShowEvent;