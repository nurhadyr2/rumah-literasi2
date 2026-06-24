import * as React from 'react';
import useSWR from 'swr';
import { Landmark, Wallet, QrCode, Copy, Check } from 'lucide-react';

import { cn, assetUrl } from '@/libs/utils';
import { Loading } from '@/components/loading';
import { Error } from '@/components/error';

const TYPE_META = {
	bank: { label: 'Transfer Bank', icon: Landmark },
	ewallet: { label: 'E-Wallet', icon: Wallet },
	qr: { label: 'QR', icon: QrCode },
};

const ChannelCard = ({ channel, selected, onSelect }) => {
	const [copied, setCopied] = React.useState(false);

	const copy = (e) => {
		e.stopPropagation();
		navigator.clipboard?.writeText(channel.account_number);
		setCopied(true);
		setTimeout(() => setCopied(false), 1500);
	};

	const isQr = channel.type === 'qr';

	return (
		<button
			type='button'
			onClick={() => onSelect(channel)}
			className={cn(
				'flex w-full flex-col gap-1 rounded-xl border p-4 text-left transition',
				selected
					? 'border-amber-500 ring-2 ring-amber-200 bg-amber-50'
					: 'border-zinc-200 hover:border-zinc-300'
			)}>
			<span className='font-semibold'>{channel.name}</span>
			{selected && (
				<React.Fragment>
					{isQr ? (
						channel.logo && (
							<img
								src={assetUrl(channel.logo)}
								alt={`QR ${channel.name}`}
								className='mt-2 max-h-64 rounded-lg border border-zinc-200 object-contain'
							/>
						)
					) : (
						<React.Fragment>
							<div className='flex items-center gap-2'>
								<span className='font-mono text-sm'>
									{channel.account_number}
								</span>
								<span
									onClick={copy}
									className='inline-flex items-center text-zinc-400 hover:text-amber-500 cursor-pointer'>
									{copied ? <Check size={14} /> : <Copy size={14} />}
								</span>
							</div>
							<span className='text-xs text-zinc-500'>
								a.n. {channel.account_holder}
							</span>
						</React.Fragment>
					)}
					{channel.instructions && (
						<span className='mt-1 text-xs text-zinc-500'>
							{channel.instructions}
						</span>
					)}
				</React.Fragment>
			)}
		</button>
	);
};

const PaymentChannelPicker = ({ value, onChange }) => {
	const { data, error, isLoading } = useSWR('/payment-channels');

	const grouped = React.useMemo(() => {
		const rows = data?.data || [];
		return {
			bank: rows.filter((c) => c.type === 'bank'),
			ewallet: rows.filter((c) => c.type === 'ewallet'),
			qr: rows.filter((c) => c.type === 'qr'),
		};
	}, [data]);

	return (
		<div className='grid gap-6'>
			<Error error={!isLoading && error} />
			<Loading loading={isLoading} />

			{data &&
				Object.entries(TYPE_META).map(([type, meta]) => {
					const channels = grouped[type] || [];
					if (!channels.length) return null;
					const Icon = meta.icon;
					return (
						<div key={type} className='grid gap-3'>
							<div className='flex items-center gap-2 text-sm font-medium text-zinc-600'>
								<Icon className='size-4' />
								{meta.label}
							</div>
							<div className='grid gap-3 sm:grid-cols-2'>
								{channels.map((channel) => (
									<ChannelCard
										key={channel.id}
										channel={channel}
										selected={value === channel.id}
										onSelect={(c) => onChange(c.id)}
									/>
								))}
							</div>
						</div>
					);
				})}
		</div>
	);
};

export default PaymentChannelPicker;
