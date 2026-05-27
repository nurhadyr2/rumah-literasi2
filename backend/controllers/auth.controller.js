const argon2 = require('argon2');

const ApiError = require('../libs/error');
const ApiResponse = require('../libs/response');
const OneTimePassword = require('../libs/otp');
const EmailController = require('./email.controller');
const LogService = require('../libs/log-service');

const { User } = require('../models');
const Encoder = require('../libs/encrpyt');
const { ROLES } = require('../libs/constant');

const LOGGED_AUTH_ROLES = new Set([ROLES.ADMIN, ROLES.SUPERADMIN]);

const AuthController = {
	async signin(req, res, next) {
		try {
			const { email, password } = req.body;
			if (!email || !password) {
				throw new ApiError(400, 'Email or password is required');
			}

			const user = await User.scope('authentication').findOne({
				where: { email },
			});

			if (!user) throw new ApiError(404, 'User not found');
			if (!user.is_verified) {
				throw new ApiError(401, 'Please verify your email address');
			}

			const valid = await argon2.verify(user.password, password);
			if (!valid) throw new ApiError(401, 'Invalid email or password');

			const otp = OneTimePassword.generate();
			EmailController.otp(otp, user);

			req.session.otp = {
				code: otp,
				uuid: user.uuid,
			};

			return res.json(
				new ApiResponse('OTP generated successfully', req.session.id)
			);
		} catch (error) {
			next(error);
		}
	},

	async signup(req, res, next) {
		try {
			const { name, email, password } = req.body;
			if (!name || !email || !password) {
				throw new ApiError(400, 'Name, email or password is required');
			}

			const found = await User.findOne({
				where: {
					email,
				},
			});
			if (found) throw new ApiError(400, 'Email already exists');

			const user = await User.create(req.body);
			const token = Encoder.encode(user.uuid);
			const url = new URL(process.env.APP_URL);
			url.pathname = '/api/auth/verify';
			url.searchParams.set('token', token);
			const href = url.toString();

			await EmailController.verify(href, user);

			return res.json(
				new ApiResponse('User registered successfully', req.session.id)
			);
		} catch (error) {
			next(error);
		}
	},

	async verify(req, res, next) {
		try {
			const { token } = req.query;
			if (!token) throw new ApiError(400, 'Token is required');

			const uuid = Encoder.decode(token);
			const user = await User.findOne({
				where: { uuid },
			});
			if (!user) throw new ApiError(404, 'User not found');
			await user.update({
				is_verified: true,
			});

			const url = new URL(process.env.APP_ORIGIN);
			url.pathname = '/auth/signin';
			url.searchParams.set('token', token);
			const href = url.toString();
			await EmailController.verify(href, user);

			return res.redirect(href);
		} catch (error) {
			next(error);
		}
	},

	async validate(req, res, next) {
		try {
			const { otp } = req.body;

			const user = await User.findOne({
				where: {
					uuid: req.session.otp.uuid,
				},
			});

			if (!user) throw new ApiError(404, 'User not found');
			if (!OneTimePassword.verify(otp, req.session.otp.code)) {
				throw new ApiError(401, 'One time password is invalid or expired');
			}

			req.session.userId = user.uuid;

			if (LOGGED_AUTH_ROLES.has(user.role)) {
				await LogService.createLog(
					'Login',
					user.id,
					'user',
					user.id,
					`${user.name} (${user.role}) berhasil login`,
					{ user_id: user.id, role: user.role, email: user.email },
					req
				);
			}

			return res.json(new ApiResponse('User logged in successfully', user));
		} catch (error) {
			next(error);
		}
	},

	async signout(req, res, next) {
		try {
			const user = req.user;
			if (user && LOGGED_AUTH_ROLES.has(user.role)) {
				await LogService.createLog(
					'Logout',
					user.id,
					'user',
					user.id,
					`${user.name} (${user.role}) logout`,
					{ user_id: user.id, role: user.role },
					req
				);
			}
			req.session.destroy();
			return res.json(new ApiResponse('User logged out successfully'));
		} catch (error) {
			next(error);
		}
	},

	async profile(req, res, next) {
		try {
			const user = await User.findOne({
				where: { uuid: req.user.uuid },
			});
			if (!user) throw new ApiError(404, 'User not found');

			return res.json(new ApiResponse('Profile retrieved successfully', user));
		} catch (error) {
			next(error);
		}
	},

	async forgot(req, res, next) {
		try {
			const { email } = req.body;
			if (!email) throw new ApiError(400, 'Email is required');

			const user = await User.findOne({ where: { email } });
			if (!user) throw new ApiError(404, 'User not found');

			req.session.reset = {
				uuid: user.uuid,
			};

			const token = Encoder.encode(req.session.id);
			const url = new URL(process.env.APP_URL);
			url.pathname = '/api/auth/recover-password';
			url.searchParams.set('token', token);

			await EmailController.forgotPassword(url.toString(), user);

			return res.json(new ApiResponse('Password reset link sent', user));
		} catch (err) {
			next(err);
		}
	},

	async recover(req, res, next) {
		try {
			const { token } = req.query;
			if (!token) throw new ApiError(400, 'Token is required');

			const sid = Encoder.decode(token);
			req.sessionStore.get(sid, (err, session) => {
				if (err || !session || !session.reset) {
					const url = new URL(process.env.APP_ORIGIN);
					url.pathname = '/expired';
					return res.redirect(url.toString());
				}

				const url = new URL(process.env.APP_ORIGIN);
				url.pathname = '/auth/reset-password';
				url.searchParams.set('token', token);

				return res.redirect(url.toString());
			});
		} catch (err) {
			next(err);
		}
	},

	async reset(req, res, next) {
		try {
			const { token, password, password_confirmation } = req.body;
			if (!token) throw new ApiError(400, 'Token is required');
			if (password !== password_confirmation) {
				throw new ApiError(400, 'Password and confirmation do not match');
			}

			const sid = Encoder.decode(token);
			req.sessionStore.get(sid, async (err, session) => {
				if (err || !session || !session.reset) {
					return next(new ApiError(400, 'Invalid or expired token'));
				}

				const user = await User.findOne({
					where: { uuid: session.reset.uuid },
				});

				if (!user) return next(new ApiError(404, 'User not found'));

				await user.update({ password });
				req.sessionStore.destroy(sid, () => {});

				return res.json(new ApiResponse('Password reset successfully', user));
			});
		} catch (err) {
			next(err);
		}
	},
	async resendEmail(req, res, next) {
		try {
			const { email } = req.body;
			if (!email) throw new ApiError(400, 'Email is required');

			const user = await User.findOne({ where: { email } });
			if (!user) throw new ApiError(404, 'User not found');

			if (user.is_verified) {
				throw new ApiError(400, 'Email already verified');
			}

			const token = Encoder.encode(user.uuid);
			const url = new URL(process.env.APP_URL);
			url.pathname = '/api/auth/verify';
			url.searchParams.set('token', token);
			const href = url.toString();

			await EmailController.verify(href, user);

			return res.json(new ApiResponse('Verification email sent successfully'));
		} catch (error) {
			next(error);
		}
	},
};

module.exports = AuthController;
