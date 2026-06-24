const express = require('express');
const router = express.Router();
const BookDonationController = require('../controllers/book-donation.controller');

const { ROLES } = require('../libs/constant');
const { authorize } = require('../middleware/authorize');
const { upload: local } = require('../middleware/local-upload');
const { upload: vercel } = require('../middleware/vercel-blob');

const IS_PRODUCTION = process.env.NODE_ENV === 'production';
const upload = IS_PRODUCTION ? vercel : local;

const guest = authorize([ROLES.DONATUR, ROLES.ADMIN]);
router.get('/', guest, BookDonationController.index);
router.get('/:id', guest, BookDonationController.show);
router.get('/:id/track', guest, BookDonationController.track);

const guestOnly = authorize([ROLES.DONATUR]);
router.post('/', guestOnly, BookDonationController.store);
router.post(
	'/:id/pay',
	guestOnly,
	upload.single('payment_proof'),
	BookDonationController.pay
);

const admin = authorize([ROLES.ADMIN]);
router.post('/:id/verify', admin, BookDonationController.verify);
router.put('/:id', admin, BookDonationController.update);
router.delete('/:id', admin, BookDonationController.destroy);

module.exports = router;
