const express = require('express');
const router = express.Router();
const FinancialDonationController = require('../controllers/financial-donation.controller');

const DokuPaymentController = require('../controllers/doku-payment.controller');

const { ROLES } = require('../libs/constant');
const { authorize, authorizeStrict } = require('../middleware/authorize');
const { upload: local } = require('../middleware/local-upload');
const { upload: vercel } = require('../middleware/vercel-blob');

const IS_PRODUCTION = process.env.NODE_ENV === 'production';
const upload = IS_PRODUCTION ? vercel : local;

const guest = authorize([ROLES.DONATUR, ROLES.ADMIN]);
router.get('/', guest, FinancialDonationController.index);
router.get('/:id', guest, FinancialDonationController.show);

const donaturStrict = authorizeStrict([ROLES.DONATUR]);
router.post('/', donaturStrict, FinancialDonationController.store);

const guestOnly = authorize([ROLES.DONATUR]);
router.post(
	'/:id/pay',
	guestOnly,
	upload.single('payment_proof'),
	FinancialDonationController.pay
);
router.post(
	'/:id/checkout',
	guestOnly,
	DokuPaymentController.checkout('financial')
);
router.get(
	'/:id/payment-status',
	guestOnly,
	DokuPaymentController.status('financial')
);
router.put('/:id', guestOnly, FinancialDonationController.update);
router.delete(
	'/:id',
	authorize([ROLES.DONATUR, ROLES.ADMIN]),
	FinancialDonationController.destroy
);

const admin = authorize([ROLES.ADMIN]);
router.post('/:id/verify', admin, FinancialDonationController.verify);

module.exports = router;
