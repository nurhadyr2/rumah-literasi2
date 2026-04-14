const express = require('express');
const router = express.Router();
const BookDonationController = require('../controllers/book-donation.controller');

const { ROLES } = require('../libs/constant');
const { authorize } = require('../middleware/authorize');

const guest = authorize([ROLES.GUEST, ROLES.ADMIN]);
router.get('/', guest, BookDonationController.index);
router.post('/', guest, BookDonationController.store);
router.get('/:id', guest, BookDonationController.show);
router.get('/:id/track', guest, BookDonationController.track);
router.delete('/:id', guest, BookDonationController.destroy);

const admin = authorize([ROLES.ADMIN,]);
router.put('/:id', admin, BookDonationController.update);

module.exports = router;
