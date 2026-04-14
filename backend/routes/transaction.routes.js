const express = require('express');
const router = express.Router();

const TransactionController = require('../controllers/transaction.controller');

const { ROLES } = require('../libs/constant');
const { authorize } = require('../middleware/authorize');

const guest = authorize([ROLES.GUEST, ROLES.ADMIN]);
router.get('/', guest, TransactionController.index);
router.post('/', guest, TransactionController.store);
router.get('/:uuid', guest, TransactionController.show);
router.delete('/:uuid', guest, TransactionController.destroy);
router.get('/:uuid/track', guest, TransactionController.track);

const admin = authorize([ROLES.ADMIN]);
router.put('/:uuid', admin, TransactionController.update);
router.post('/:uuid/status', admin, TransactionController.status);

module.exports = router;
