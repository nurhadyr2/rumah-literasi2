import { Outlet, Navigate } from 'react-router';
import { useAuth } from '@/hooks/use-auth';
import { Loading } from '@/components/loading';
import { ROLES } from '@/libs/constant';

const DEFAULT = [];

const AuthorizeLayout = ({ allowed = DEFAULT }) => {
	const { user, loading } = useAuth();
	const set = new Set([...allowed, ROLES.SUPERADMIN]);
	const authorized = user && set.has(user.role);

	if (loading) {
		return (
			<div className='grid gap-8'>
				<div className='grid gap-2'>
					<div className='w-1/3 h-10 bg-zinc-100 animate-pulse rounded-xl' />
					<div className='flex flex-col gap-2'>
						<div className='w-full h-4 bg-zinc-100 animate-pulse rounded-xl' />
						<div className='w-1/2 h-4 bg-zinc-100 animate-pulse rounded-xl' />
					</div>
				</div>
				<Loading loading={loading} />
			</div>
		);
	}

	if (authorized) return <Outlet />;

	return (
		<Navigate
			to='/unauthorized'
			state={{
				from: location.pathname,
			}}
		/>
	);
};

export default AuthorizeLayout;
