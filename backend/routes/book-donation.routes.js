const express = require('express');
const router = express.Router();
const BookDonationController = require('../controllers/book-donation.controller');

const DokuPaymentController = require('../controllers/doku-payment.controller');

const { ROLES } = require('../libs/constant');
const { authorize, authorizeStrict } = require('../middleware/authorize');
const { upload: local } = require('../middleware/local-upload');
const { upload: vercel } = require('../middleware/vercel-blob');

const IS_PRODUCTION = process.env.NODE_ENV === 'production';
const upload = IS_PRODUCTION ? vercel : local;

const guest = authorize([ROLES.DONATUR, ROLES.ADMIN]);
router.get('/', guest, BookDonationController.index);
router.get('/:id', guest, BookDonationController.show);
router.get('/:id/track', guest, BookDonationController.track);

const donaturStrict = authorizeStrict([ROLES.DONATUR]);
router.post('/', donaturStrict, BookDonationController.store);

const guestOnly = authorize([ROLES.DONATUR]);
router.post(
	'/:id/pay',
	guestOnly,
	upload.single('payment_proof'),
	BookDonationController.pay
);
router.post(
	'/:id/checkout',
	guestOnly,
	DokuPaymentController.checkout('book')
);
router.get(
	'/:id/payment-status',
	guestOnly,
	DokuPaymentController.status('book')
);
router.put('/:id', guestOnly, BookDonationController.update);

const admin = authorize([ROLES.ADMIN]);
router.post('/:id/verify', admin, BookDonationController.verify);

router.delete(
	'/:id',
	authorize([ROLES.DONATUR, ROLES.ADMIN]),
	BookDonationController.destroy
);

module.exports = router;
