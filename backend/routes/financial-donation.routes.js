const express = require('express');
const router = express.Router();
const FinancialDonationController = require('../controllers/financial-donation.controller');

const { ROLES } = require('../libs/constant');
const { authorize } = require('../middleware/authorize');

const guest = authorize([ROLES.GUEST, ROLES.ADMIN]);
router.get('/', guest, FinancialDonationController.index);
router.get('/:id', guest, FinancialDonationController.show);

const guestOnly = authorize([ROLES.GUEST]);
router.post('/', guestOnly, FinancialDonationController.store);

const admin = authorize([ROLES.ADMIN]);
router.put('/:id', admin, FinancialDonationController.update);
router.delete('/:id', admin, FinancialDonationController.destroy);

module.exports = router;
