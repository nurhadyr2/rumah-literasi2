import * as React from 'react';

import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';

import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';

const ConfirmContext = React.createContext({
	confirm: async () => {},
});

export const ConfirmProvider = ({ children }) => {
	const promise = React.useRef(null);
	const [options, setOptions] = React.useState();

	const confirm = ({ title, description, variant = 'primary' }) => {
		setOptions({
			title,
			variant,
			description,
		});
		return new Promise((resolve, reject) => {
			promise.current = { resolve, reject };
		});
	};

	const handleConfirm = (e) => {
		e.preventDefault();
		if (promise.current) promise.current.resolve(null);
		setOptions(null);
	};

	const handleCancel = (e) => {
		e.preventDefault();
		if (promise.current) promise.current.reject(null);
		setOptions(null);
	};

	return (
		<React.Fragment>
			<ConfirmContext.Provider value={{ confirm }}>
				{children}
			</ConfirmContext.Provider>

			<Dialog
				open={!!options}
				onOpenChange={(open) => !open && setOptions(null)}>
				<DialogContent className='sm:max-w-md'>
					<DialogHeader>
						<DialogTitle className='text-start'>
							{options && options.title}
						</DialogTitle>
						<DialogDescription className='text-zinc-500'>
							{options && options.description}
						</DialogDescription>
					</DialogHeader>
					<DialogFooter>
						<div className='flex justify-end w-full space-x-2'>
							<DialogClose asChild>
								<Button variant='secondary' onClick={handleCancel}>
									Batal
								</Button>
							</DialogClose>
							<DialogClose asChild>
								<Button
									variant={options && options.variant}
									onClick={handleConfirm}
									autoFocus>
									<Check className='mr-2 size-4' />
									Konfirmasi
								</Button>
							</DialogClose>
						</div>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</React.Fragment>
	);
};

export default ConfirmContext;
