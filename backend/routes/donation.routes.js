const express = require('express');
const router = express.Router();
const DonationController = require('../controllers/donation.controller');

const { ROLES } = require('../libs/constant');
const { authorize } = require('../middleware/authorize');

const guest = authorize([ROLES.GUEST, ROLES.ADMIN]);
router.get('/', guest, DonationController.index);
router.get('/:id', guest, DonationController.show);
router.delete('/:id', guest, DonationController.destroy);

const guestOnly = authorize([ROLES.GUEST]);
router.post('/', guestOnly, DonationController.store);

const admin = authorize([ROLES.ADMIN]);
router.put('/:id', admin, DonationController.update);

module.exports = router;
