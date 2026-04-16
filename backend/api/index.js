const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');
const cors = require('cors');
const session = require('express-session');
const SequelizeStore = require('connect-session-sequelize')(session.Store);
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');

const { sequelize } = require('../models');

dotenv.config();

const PORT = process.env.APP_PORT || 3001;
const URL = process.env.APP_URL;
const ORIGIN = process.env.APP_ORIGIN;
const SECRET = process.env.APP_SECRET;

const isProduction = process.env.NODE_ENV === 'production';

const app = express();

app.use(helmet());
app.set('trust proxy', 1);

const allowedOrigins = ['https://www.mraenmimpi.com', 'https://mraenmimpi.com'];

app.use(
	cors({
		origin: function (origin, callback) {
			if (!origin) return callback(null, true);
			if (allowedOrigins.indexOf(origin) !== -1) {
				callback(null, true);
			} else {
				callback(new Error('Not allowed by CORS'));
			}
		},
		credentials: true,
		methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
		allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
	})
);

app.options('*', cors());
const store = new SequelizeStore({
	db: sequelize,
	tableName: 'sessions',
	checkExpirationInterval: 15 * 60 * 1000,
	expiration: 24 * 60 * 60 * 1000,
});

app.use(
	session({
		store: store,
		secret: SECRET,
		resave: false,
		saveUninitialized: false,
		rolling: true,
		proxy: true,
		cookie: {
			httpOnly: true,
			secure: isProduction,
			sameSite: isProduction ? 'none' : 'lax',
			maxAge: 24 * 60 * 60 * 1000,
		},
	})
);

if (isProduction) {
	app.use(morgan('combined'));
} else {
	app.use(morgan('dev'));
}

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

app.use(
	'uploads',
	express.static('uploads', {
		maxAge: '7d',
	})
);

const limiter = rateLimit({
	windowMs: 60 * 1000,
	max: 100,
	standardHeaders: true,
	legacyHeaders: false,
});

app.use('/api', limiter);

const errorHandler = require('../middleware/errors');
const { authenticate } = require('../middleware/authenticate');

const authRoutes = require('../routes/auth.routes');
const paymentRoutes = require('../routes/payment.routes');
const teritoriesRoutes = require('../routes/teritory.route');
const publicRoutes = require('../routes/public.routes');
const bookDonationRoutes = require('../routes/book-donation.routes');
const financialDonationRoutes = require('../routes/financial-donation.routes');
const deliveryRoutes = require('../routes/delivery.routes');
const addressRoutes = require('../routes/address.routes');
const eventRoutes = require('../routes/event.routes');
const userRoutes = require('../routes/user.routes');
const merchantRoutes = require('../routes/merchant.routes');
const logRoutes = require('../routes/log.routes');

app.get('/api/_healthcheck', (req, res) => {
	res.status(200).json({
		status: 'ok',
		time: new Date(),
	});
});

app.use('/api/auth', authRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/teritories', teritoriesRoutes);
app.use('/api/public', publicRoutes);
app.use('/uploads', require('express').static('uploads'));
app.use(authenticate);
app.use('/api/book-donations', bookDonationRoutes);
app.use('/api/financial-donations', financialDonationRoutes);
app.use('/api/deliveries', deliveryRoutes);
app.use('/api/addresses', addressRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/members', userRoutes);
app.use('/api/merchant', merchantRoutes);
app.use('/api/logs', logRoutes);

app.use((req, res) => {
	res.status(404).json({ message: 'Not Found' });
});

app.use(errorHandler);

(async () => {
	try {
		await sequelize.authenticate();
		await store.sync();

		app.listen(PORT, () => {
			console.log(`Server running at ${URL}`);
		});
	} catch (err) {
		console.error('Failed to start server:', err);
		process.exit(1);
	}
})();
