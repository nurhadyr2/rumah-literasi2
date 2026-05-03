const express = require('express');
const router = express.Router();
const GiftController = require('../controllers/gift.controller');

const { ROLES } = require('../libs/constant');
const { authorize } = require('../middleware/authorize');

const guest = authorize([ROLES.DONATUR, ROLES.ADMIN]);
router.get('/', guest, GiftController.index);
router.post('/', guest, GiftController.store);
router.get('/:id', guest, GiftController.show);
router.delete('/:id', guest, GiftController.destroy);

const admin = authorize([ROLES.ADMIN]);
router.put('/:id', admin, GiftController.update);

module.exports = router;
