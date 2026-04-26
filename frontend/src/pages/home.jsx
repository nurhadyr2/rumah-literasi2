import * as React from 'react';
import { Link } from 'react-router';
import useSWR from 'swr';
import { Button } from '@/components/ui/button';
import { EventCard } from '@/components/events/event-card';
import { useResultState } from '@/hooks/use-result-state';
import { Empty } from '@/components/empty';
import { Loading } from '@/components/loading';
import { Error } from '@/components/error';
import { usePagination } from '@/hooks/use-pagination';
import { FadeIn } from '@/components/fade-in';
import { LazyImage } from '@/components/lazy-image';

const Home = () => {
	const ref = React.useRef(null);
	const { page } = usePagination();

	const {
		error,
		data,
		isLoading: loading,
	} = useSWR([
		'public/events',
		{
			params: {
				page: page,
				limit: 3,
			},
		},
	]);

	const { result, empty } = useResultState(error, loading, data);

	return (
		<React.Fragment>
			<div className='w-full overflow-x-hidden'>
				<div className='container grid items-center gap-6 py-10 sm:py-16 lg:py-10 lg:grid-cols-2 max-w-7xl'>
					<FadeIn direction='left' duration={700}>
						<div className='flex flex-col gap-6 order-last lg:order-first'>
							<h1 className='text-3xl sm:text-4xl lg:text-6xl font-bold'>
								Memberdayakan Komunitas Melalui Literasi
							</h1>
							<p className='text-zinc-600'>
								Mraen Mimpi adalah inisiatif nirlaba yang berfokus pada
								redistribusi buku bekas ke komunitas yang membutuhkan.
								Bergabunglah bersama kami untuk mendorong pendidikan, mengurangi
								limbah, dan menciptakan dampak sosial melalui literasi.
							</p>
							<div className='flex items-center gap-2'>
								<Button
									onClick={() =>
										ref.current.scrollIntoView({ behavior: 'smooth' })
									}>
									Baca Selengkapnya
								</Button>
								<Link to='/about'>
									<Button variant='outline'>Tentang Kami</Button>
								</Link>
							</div>
						</div>
					</FadeIn>

					<FadeIn direction='right' duration={700} delay={150}>
						<div className='relative order-first lg:order-last mx-auto w-full max-w-lg p-1 sm:p-2 rounded-xl'>
							<LazyImage
								src='/hero.jpg'
								alt='beranda'
								className='w-full rounded-xl aspect-video object-cover'
							/>

							<div className='absolute top-0 xl:-right-20 xl:top-16 hidden lg:block'>
								<div className='relative p-6 text-sm origin-center bg-white border w-72 animate-slow-hover border-zinc-200 rounded-xl'>
									<div className='absolute top-0 left-0 -m-1'>
										<div className='relative'>
											<div className='absolute inset-0 rounded-full size-3 bg-primary-500'></div>
											<div className='absolute inset-0 rounded-full size-3 bg-primary-500 animate-ping'></div>
										</div>
									</div>

									<h2 className='font-semibold'>Donasikan buku Anda</h2>
									<p className='text-zinc-600'>
										Daripada membuang buku lama Anda, biarkan mereka bermanfaat
										lebih jauh
									</p>
								</div>
							</div>
						</div>
					</FadeIn>
				</div>

				<div className='container py-24 max-w-7xl'>
					<FadeIn direction='up' duration={600}>
						<div className='flex flex-col items-center gap-6 mb-16 text-center'>
							<h2 className='text-4xl font-bold'>Acara Terbaru</h2>
							<p className='max-w-2xl text-zinc-600'>
								Tetap terhubung dengan acara dan kegiatan terbaru kami di
								komunitas.
							</p>
						</div>
					</FadeIn>

					<Error error={!loading && error} />
					<Empty empty={!loading && empty} />
					<Loading loading={loading} />

					<div className='grid gap-8 mb-8 md:grid-cols-2 lg:grid-cols-3'>
						{result.map((event, i) => (
							<FadeIn
								key={event.id}
								direction='up'
								delay={i * 100}
								duration={600}>
								<Link to={'/events/' + event.id}>
									<EventCard event={event} />
								</Link>
							</FadeIn>
						))}
					</div>

					<FadeIn direction='up' delay={300}>
						<div className='flex justify-center'>
							<Link to='/events'>
								<Button variant='outline'>Lihat Semua Acara</Button>
							</Link>
						</div>
					</FadeIn>
				</div>

				<div
					ref={ref}
					className='container grid items-center gap-6 py-10 lg:grid-cols-2 max-w-7xl'>
					<FadeIn direction='left' duration={700}>
						 <div className='relative mx-auto w-full max-w-lg p-1 sm:p-2 rounded-xl overflow-hidden'>
							<LazyImage
								src='/galleries/gallery-3.jpg'
								alt='tentang kami'
								className='w-full rounded-xl aspect-video object-cover'
							/>
						</div>
					</FadeIn>

					<FadeIn direction='right' duration={700} delay={150}>
						<div className='flex flex-col gap-6'>
							<h2 className='text-4xl font-bold'>Tentang Kami</h2>
							<p className='text-zinc-600'>
								Mraen adalah sebuah dusun di kabupaten Sleman, Yogyakarta, di
								mana bermula dari gang kecil inilah lahir sebuah gerakan
								literasi bernama MRAEN MIMPI. Kata "mraen" kami umpamakan
								sebagai kata yang memiliki arti "meraih", kemudian kami
								menambahkan kata "mimpi" setelahnya. Iya, kami sedang meniti
								langkah untuk meraih sebuah mimpi. Mraen Mimpi sebagai gerakan
								literasi yang menggunakan media gerobak bernama "PELAN2" (dibaca
								pelan-pelan), memiliki filosofi yang bermakna; kami pelan-pelan
								berproses dengan memulai dari sesuatu yang mampu kami lakukan,
								yakni berupa Perpustakaan Jalan-jalan.
							</p>
						</div>
					</FadeIn>
				</div>

				<div className='grid py-24 text-white bg-primary-600'>
					<div className='container max-w-7xl'>
						<FadeIn direction='up' duration={600}>
							<div className='flex flex-col gap-6 text-center'>
								<h2 className='text-4xl font-bold'>Alur Donasi Buku</h2>
								<p>
									Donasi buku adalah kegiatan sosial untuk mengumpulkan dan
									mendistribusikan buku kepada yang membutuhkan, seperti sekolah
									terpencil. Proses donasi meliputi pengumpulan, penyortiran,
									dan pendistribusian buku ke perpustakaan dan komunitas baca
									yang membutuhkan. Selain buku, donasi dalam bentuk uang juga
									diterima untuk membantu fasilitas literasi di tempat yang
									kurang akses buku dan sumber belajar. Anda dapat berdonasi
									melalui website dan mengirimkan buku langsung ke alamat
									komunitas.
								</p>
								<div className='grid gap-6 mt-10 grid-cols-2 lg:grid-cols-4'>
									{[1, 2, 3, 4].map((n, i) => (
										<FadeIn
											key={n}
											direction='up'
											delay={i * 120}
											duration={600}>
											<LazyImage
												src={`/steps/step-${n}.jpg`}
												alt={`langkah ${n}`}
												className='w-full rounded-xl aspect-thumbnail'
											/>
										</FadeIn>
									))}
								</div>
							</div>
						</FadeIn>
					</div>
				</div>

				<div className='container py-10 max-w-7xl'>
					<FadeIn direction='up' duration={600}>
						<div className='flex flex-col gap-6 text-center'>
							<h2 className='text-4xl font-bold'>Apa Itu Taman Baca?</h2>
							<p>
								Taman bacaan masyarakat adalah tempat yang menyediakan layanan
								baca dan sumber belajar bagi masyarakat sekitar, tanpa memandang
								latar belakang sosial, ekonomi, atau pendidikan.
							</p>

							<FadeIn direction='up' delay={100}>
								<LazyImage
									src='/description.jpg'
									alt='deskripsi'
									className='w-full max-w-lg mx-auto rounded-xl aspect-square'
								/>
							</FadeIn>

							<p>
								Jika buku adalah jendelanya, maka taman baca bagi komunitas
								adalah pintu yang terbuka lebar bagi warga untuk keluar dari
								keterbatasan informasi dan masuk ke ruang kolaborasi.
							</p>

							<p>
								TBM berperan penting dalam memfasilitasi kegiatan literasi
								baca-tulis, terutama bagi anak-anak dan masyarakat umum yang
								tinggal di sekitar lingkungan taman baca. Mraen Mimpi membuka
								Lapak Buku Bacaan dan Mainan Edukasi di beberapa kegiatan
								anak-anak maupun dewasa, bekerjasama serta kolaborasi dengan
								komunitas, organisasi atau lembaga lainnya.
							</p>

							<h2 className='mt-10 text-4xl font-bold'>Galeri Kami</h2>

							<div className='grid gap-6 md:grid-cols-2'>
								{[1, 2, 3, 4].map((n, i) => (
									<FadeIn key={n} direction='up' delay={i * 100} duration={600}>
										<LazyImage
											src={`/galleries/gallery-${n}.jpg`}
											alt={`galeri ${n}`}
											className='w-full rounded-xl aspect-video'
										/>
									</FadeIn>
								))}
								<FadeIn
									direction='up'
									delay={400}
									duration={600}
									className='md:col-span-2'>
									<LazyImage
										src='/galleries/gallery-5.jpg'
										alt='galeri 5'
										className='w-full rounded-xl aspect-video'
									/>
								</FadeIn>
							</div>
						</div>
					</FadeIn>
				</div>
			</div>
		</React.Fragment>
	);
};

export default Home;
