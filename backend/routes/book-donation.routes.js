const express = require('express');
const router = express.Router();
const BookDonationController = require('../controllers/book-donation.controller');

const { ROLES } = require('../libs/constant');
const { authorize } = require('../middleware/authorize');

const guest = authorize([ROLES.DONATUR, ROLES.ADMIN]);
router.get('/', guest, BookDonationController.index);
router.get('/:id', guest, BookDonationController.show);
router.get('/:id/track', guest, BookDonationController.track);

const guestOnly = authorize([ROLES.DONATUR]);
router.post('/', guestOnly, BookDonationController.store);

const admin = authorize([ROLES.ADMIN]);
router.put('/:id', admin, BookDonationController.update);
router.delete('/:id', admin, BookDonationController.destroy);

module.exports = router;
