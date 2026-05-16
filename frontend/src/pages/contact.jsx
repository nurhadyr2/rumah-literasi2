import * as React from 'react';

import {
	Heading,
	HeadingDescription,
	Supertitle,
} from '@/components/ui/heading';
import { FadeIn } from '@/components/fade-in';
import { Phone, Mail, MapPin } from 'lucide-react';

const LOCATIONS = [
	{
		id: 'Yogyakarta',
		label: 'Lokasi Utama – Mraen Mimpi',
		address:
			'Gg. Mawar Jl. Tegal Mraen No.101, RT.03/RW.10, Dukuh, Sendangadi, Kec. Mlati, Kabupaten Sleman, Daerah Istimewa Yogyakarta 55285',
		mapSrc:
			'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3953.3829528396577!2d110.359404!3d-7.749143500000001!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e7a59cd16b50811%3A0xbb55d2ffb26d108d!2sMraen%20Mimpi!5e0!3m2!1sid!2sid!4v1778959105783!5m2!1sid!2sid',
	},
	{
		id: 'Bekasi',
		label: 'Perpustakaan Gratis - Bekasi',
		address:
			'Jl. Woodhill Residence No.B1, RT.001/RW.011, Jatiluhur, Kec. Jatiasih, Kota Bks, Jawa Barat 17425',
		mapSrc:
			'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3965.497559249471!2d106.9481536!3d-6.329516099999999!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e699300437cb27b%3A0x28cc11f541178719!2sPERPUSTAKAAN%20GRATIS%20BOOKHILL%20RESIDENCE!5e0!3m2!1sid!2sid!4v1778959215659!5m2!1sid!2sid',
	},
	{
		id: 'Jombang',
		label: 'Samperin Buku - Jombang',
		address:
			'SAMBONG PERMAI No.F-24, Sambong Dukuh, Kec. Jombang, Kabupaten Jombang, Jawa Timur 61416',
		mapSrc:
			'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3955.4044678391633!2d112.22979930000001!3d-7.530787199999998!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e783ffc0de2948b%3A0x6b9a5fd4d4991b15!2sSAMPERIN%20BUKU!5e0!3m2!1sid!2sid!4v1778959348058!5m2!1sid!2sid',
	},
];

const CONTACTS = [
	{
		label: '+085755478336',
		href: 'https://wa.me/+6285755478336',
		note: 'WhatsApp & Telepon (Koordinator Utama)',
		icon: Phone,
	},
	{
		label: '+6283876473520',
		href: 'https://wa.me/+6283876473520',
		note: 'WhatsApp Tim Bekasi',
		icon: Phone,
	},
	{
		label: 'mraenmimpi@gmail.com',
		href: 'mailto:mraenmimpi@gmail.com',
		note: 'Email Umum',
		icon: Mail,
	},
];

const Contact = () => {
	return (
		<React.Fragment>
			<div className='container grid gap-10 py-24 max-w-7xl'>
				<FadeIn direction='up' duration={600}>
					<Heading>
						<Supertitle>Kontak</Supertitle>
						<HeadingDescription>
							Temukan lokasi dan hubungi kami melalui saluran berikut.
						</HeadingDescription>
					</Heading>
				</FadeIn>

				<FadeIn direction='up' duration={600} delay={100}>
					<div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
						{CONTACTS.map((c) => {
							const Icon = c.icon;
							return (
								<a
									key={c.href}
									href={c.href}
									className='flex items-start gap-3 p-4 border border-zinc-200 rounded-xl hover:border-primary-500 transition-colors'>
									<Icon className='size-5 text-primary-500 flex-none mt-0.5' />
									<div>
										<p className='font-medium text-sm'>{c.label}</p>
										{c.note && (
											<p className='text-xs text-zinc-500 mt-0.5'>{c.note}</p>
										)}
									</div>
								</a>
							);
						})}
					</div>
				</FadeIn>

				<div className='grid gap-10'>
					{LOCATIONS.map((loc, i) => (
						<FadeIn key={loc.id} direction='up' duration={600} delay={i * 100}>
							<div className='grid gap-4'>
								<div className='flex items-start gap-2'>
									<MapPin className='size-5 text-primary-500 flex-none mt-0.5' />
									<div>
										<h3 className='font-semibold'>{loc.label}</h3>
										<p className='text-zinc-600 text-sm mt-0.5'>
											{loc.address}
										</p>
									</div>
								</div>
								<div className='p-4 overflow-hidden border bg-zinc-50 rounded-xl'>
									<iframe
										className='w-full rounded-xl aspect-banner bg-zinc-100'
										src={loc.mapSrc}
										allowFullScreen
										loading='lazy'
										referrerPolicy='no-referrer-when-downgrade'
										title={loc.label}
									/>
								</div>
							</div>
						</FadeIn>
					))}
				</div>
			</div>
		</React.Fragment>
	);
};

export default Contact;
