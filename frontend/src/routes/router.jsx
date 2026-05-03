import * as React from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';

import LazyRoute from '@/routes/lazy';
import ScrollToTop from '@/components/scroll-to-top';
import AuthLayout from '@/layouts/auth-layout';
import AuthorizeLayout from '@/layouts/authorize-layout';
import LandingLayout from '@/layouts/landing-layout';
import DashboardLayout from '@/layouts/dashboard-layout';

import SignIn from '@/pages/auth/sign-in';
import SignUp from '@/pages/auth/sign-up';
import SignUpVerify from '@/pages/auth/verify-email';
import OneTimePassword from '@/pages/auth/otp';
import ProfileDetail from '@/pages/setting/profile';
import ForgotPassword from '@/pages/auth/forgot-password';
import ResetPassword from '@/pages/auth/reset-password';
import NotFound from '@/pages/errors/not-found';
import ExpiredLink from '@/pages/errors/expired-link';
import Unauhtorized from '@/pages/errors/unauthorized';

import ListEventsPage from '@/pages/events/list-events';
import ShowEventPage from '@/pages/events/show-event';

import { ROLES } from '@/libs/constant';

const load = (callback) => {
	const Component = React.lazy(callback);
	return (props) => <LazyRoute component={Component} {...props} />;
};

const Home = load(() => import('@/pages/home'));
const About = load(() => import('@/pages/about'));
const Contact = load(() => import('@/pages/contact'));

const Dashboard = load(() => import('~/dashboard'));

const ListEvents = load(() => import('~/events/list-events'));
const AddEvent = load(() => import('~/events/create-event'));
const EditEvent = load(() => import('~/events/edit-event'));
const ShowEvent = load(() => import('~/events/show-event'));

const ListUsers = load(() => import('~/members/list-member'));
const AddUser = load(() => import('~/members/create-member'));
const EditUser = load(() => import('~/members/edit-member'));

const ListBookDonations = load(
	() => import('~/book-donations/list-book-donations')
);
const AddBookDonation = load(
	() => import('~/book-donations/create-book-donation')
);
const AppendBookDonation = load(
	() => import('~/book-donations/append-book-donation')
);
const UpdateBookDonation = load(
	() => import('~/book-donations/update-book-donation')
);
const EditBookDonation = load(
	() => import('~/book-donations/edit-book-donation')
);
const DetailBookDonation = load(
	() => import('~/book-donations/detail-book-donation')
);
const ShowBookDonation = load(
	() => import('~/book-donations/show-book-donation')
);
const CourierBookDonation = load(
	() => import('~/book-donations/courier-book-donation')
);
const ReviewBookDonation = load(
	() => import('~/book-donations/review-book-donation')
);
const ListDonations = load(
	() => import('~/financial-donations/list-financial-donations')
);
const AddDonation = load(
	() => import('~/financial-donations/create-financial-donation')
);
const EditDonation = load(
	() => import('~/financial-donations/edit-financial-donation')
);
const ShowDonation = load(
	() => import('~/financial-donations/show-financial-donation')
);

const ListAddresses = load(() => import('~/addresses/list-addresses'));
const AddAddress = load(() => import('~/addresses/create-address'));
const EditAddress = load(() => import('~/addresses/edit-address'));
const ShowAddress = load(() => import('~/addresses/show-address'));
const ShowMerchant = load(() => import('~/merchant/show-merchant'));
const EditMerchant = load(() => import('~/merchant/edit-merchant'));

const ListLogs = load(
	() => import('@/pages/dashboard/transaction-log/list-logs')
);
const ShowLog = load(
	() => import('@/pages/dashboard/transaction-log/show-log')
);

const Router = () => {
	return (
		<BrowserRouter>
			<ScrollToTop />

			<Routes>
				<Route path='/' element={<LandingLayout />}>
					<Route index element={<Home />} />
					<Route path='about' element={<About />} />
					<Route path='contact' element={<Contact />} />
					<Route path='events'>
						<Route index element={<ListEventsPage />} />
						<Route path=':id' element={<ShowEventPage />} />
					</Route>
				</Route>

				<Route path='auth' element={<AuthLayout />}>
					<Route index element={<Navigate to='/auth/signin' />} />
					<Route path='signin' element={<SignIn />} />
					<Route path='signup' element={<SignUp />} />
					<Route path='otp' element={<OneTimePassword />} />
					<Route path='forgot-password' element={<ForgotPassword />} />
					<Route path='reset-password' element={<ResetPassword />} />
					<Route path='verify-email' element={<SignUpVerify />} />
				</Route>

				<Route path='dashboard' element={<DashboardLayout />}>
					<Route index element={<Dashboard />} />

					<Route path='members' element={<AuthorizeLayout />}>
						<Route index element={<ListUsers />} />
						<Route path='create' element={<AddUser />} />
						<Route path=':uuid/edit' element={<EditUser />} />
					</Route>

					<Route
						path='events'
						element={<AuthorizeLayout allowed={[ROLES.ADMIN]} />}>
						<Route index element={<ListEvents />} />
						<Route path='create' element={<AddEvent />} />
						<Route path=':id' element={<ShowEvent />} />
						<Route path=':id/edit' element={<EditEvent />} />
					</Route>

					<Route path='financial-donations'>
						<Route
							element={
								<AuthorizeLayout allowed={[ROLES.DONATUR, ROLES.ADMIN]} />
							}>
							<Route index element={<ListDonations />} />
							<Route path=':id' element={<ShowDonation />} />
						</Route>

						<Route element={<AuthorizeLayout allowed={[ROLES.DONATUR]} />}>
							<Route path='create' element={<AddDonation />} />
						</Route>

						<Route element={<AuthorizeLayout allowed={[ROLES.ADMIN]} />}>
							<Route path=':id/edit' element={<EditDonation />} />
						</Route>
					</Route>
					<Route path='book-donations'>
						<Route
							element={
								<AuthorizeLayout allowed={[ROLES.DONATUR, ROLES.ADMIN]} />
							}>
							<Route index element={<ListBookDonations />} />
							<Route path=':id' element={<ShowBookDonation />} />
						</Route>

						<Route element={<AuthorizeLayout allowed={[ROLES.DONATUR]} />}>
							<Route path='create' element={<AddBookDonation />} />
							<Route path='create/append' element={<AppendBookDonation />} />
							<Route path='create/:id/edit' element={<UpdateBookDonation />} />
							<Route path='create/detail' element={<DetailBookDonation />} />
							<Route path='create/courier' element={<CourierBookDonation />} />
							<Route path='create/review' element={<ReviewBookDonation />} />
						</Route>

						<Route element={<AuthorizeLayout allowed={[ROLES.ADMIN]} />}>
							<Route path=':id/edit' element={<EditBookDonation />} />
						</Route>
					</Route>

					<Route path='profile' element={<ProfileDetail />} />

					<Route
						path='addresses'
						element={
							<AuthorizeLayout allowed={[ROLES.DONATUR, ROLES.ADMIN]} />
						}>
						<Route index element={<ListAddresses />} />
						<Route path='create' element={<AddAddress />} />
						<Route path=':id/edit' element={<EditAddress />} />
						<Route path=':id' element={<ShowAddress />} />
					</Route>

					<Route
						path='merchant'
						element={<AuthorizeLayout allowed={[ROLES.ADMIN]} />}>
						<Route index element={<ShowMerchant />} />
						<Route path='edit' element={<AuthorizeLayout />}>
							<Route index element={<EditMerchant />} />
						</Route>
					</Route>

					<Route
						path='logs'
						element={
							<AuthorizeLayout allowed={[ROLES.ADMIN, ROLES.SUPERADMIN]} />
						}>
						<Route index element={<ListLogs />} />
						<Route path=':uuid/detail' element={<ShowLog />} />
					</Route>
				</Route>

				<Route path='expired' element={<ExpiredLink />} />
				<Route path='unauthorized' element={<Unauhtorized />} />
				<Route path='*' element={<NotFound />} />
			</Routes>
		</BrowserRouter>
	);
};

export default Router;
