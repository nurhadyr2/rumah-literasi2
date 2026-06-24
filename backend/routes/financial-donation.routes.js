const express = require('express');
const router = express.Router();
const FinancialDonationController = require('../controllers/financial-donation.controller');

const { ROLES } = require('../libs/constant');
const { authorize } = require('../middleware/authorize');
const { upload: local } = require('../middleware/local-upload');
const { upload: vercel } = require('../middleware/vercel-blob');

const IS_PRODUCTION = process.env.NODE_ENV === 'production';
const upload = IS_PRODUCTION ? vercel : local;

const guest = authorize([ROLES.DONATUR, ROLES.ADMIN]);
router.get('/', guest, FinancialDonationController.index);
router.get('/:id', guest, FinancialDonationController.show);

const guestOnly = authorize([ROLES.DONATUR]);
router.post('/', guestOnly, FinancialDonationController.store);
router.post(
	'/:id/pay',
	guestOnly,
	upload.single('payment_proof'),
	FinancialDonationController.pay
);

const admin = authorize([ROLES.ADMIN]);
router.post('/:id/verify', admin, FinancialDonationController.verify);
router.put('/:id', admin, FinancialDonationController.update);
router.delete('/:id', admin, FinancialDonationController.destroy);

module.exports = router;
