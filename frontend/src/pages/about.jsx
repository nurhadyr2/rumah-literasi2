import * as React from 'react';
import { FadeIn } from '@/components/fade-in';
import { LazyImage } from '@/components/lazy-image';

const About = () => {
	return (
		<React.Fragment>
			<div className='container grid items-center gap-8 py-10 sm:py-16 lg:py-24 lg:grid-cols-2 max-w-7xl'>
				<FadeIn direction='left' duration={700}>
					<div className='relative order-first mx-auto w-full max-w-lg p-4 sm:p-6 rounded-xl bg-zinc-50 shadow-sm lg:order-last hidden lg:block'>
						<LazyImage
							src='/galleries/gallery-3.jpg'
							alt='tentang kami'
							className='w-full rounded-xl aspect-video object-cover'
						/>

						<div className='absolute top-0 xl:-right-20 xl:top-16 hidden xl:block'>
							<div className='relative p-6 text-sm origin-center bg-white border w-72 animate-slow-hover border-zinc-200 rounded-xl'>
								<div className='absolute top-0 left-0 -m-1'>
									<div className='relative'>
										<div className='absolute inset-0 rounded-full size-3 bg-primary-500'></div>
										<div className='absolute inset-0 rounded-full size-3 bg-primary-500 animate-ping'></div>
									</div>
								</div>

								<span className='font-semibold'>
									Bergabung dengan komunitas kami
								</span>
								<p className='text-zinc-600'>
									Mari bergabung dengan komunitas kami dan bagikan kecintaan
									Anda pada buku bersama orang lain. Bersama, kita bisa
									menciptakan lingkungan yang hidup dan mendukung bagi pecinta
									buku dari semua usia.
								</p>
							</div>
						</div>
					</div>
				</FadeIn>

				<FadeIn direction='right' duration={700} delay={150}>
					<div className='flex flex-col gap-6'>
						<h1 className='text-4xl sm:text-5xl lg:text-6xl font-bold'>Tentang Kami</h1>
						<p className='text-zinc-600'>
							Mraen adalah sebuah dusun di kabupaten Sleman, Yogyakarta, dimana
							bermula dari gang kecil inilah lahir sebuah gerakan literasi
							bernama MRAEN MIMPI. Kata "mraen" kami umpamakan sebagai kata yang
							memiliki arti "meraih", kemudian kami menambahkan kata "mimpi"
							setelahnya. Iya, kami sedang meniti langkah untuk meraih sebuah
							mimpi. Mraen Mimpi sebagai gerakan literasi yang menggunakan media
							gerobak bernama "PELAN2" (dibaca pelan-pelan), memiliki filosofi
							yang bermakna; kami pelan-pelan berproses dengan memulai dari
							sesuatu yang mampu kami lakukan, yakni berupa Perpustakaan
							Jalan-jalan.
						</p>
					</div>
				</FadeIn>
			</div>
		</React.Fragment>
	);
};

export default About;