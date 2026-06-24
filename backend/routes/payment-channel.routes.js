const express = require('express');
const router = express.Router();

const PaymentChannelController = require('../controllers/payment-channel.controller');

const { ROLES } = require('../libs/constant');
const { authorize } = require('../middleware/authorize');
const { upload: local } = require('../middleware/local-upload');
const { upload: vercel } = require('../middleware/vercel-blob');

const IS_PRODUCTION = process.env.NODE_ENV === 'production';
const upload = IS_PRODUCTION ? vercel : local;

const reader = authorize([ROLES.DONATUR, ROLES.ADMIN]);
router.get('/', reader, PaymentChannelController.index);
router.get('/:id', reader, PaymentChannelController.show);

const superadmin = authorize();
router.post('/', superadmin, upload.single('logo'), PaymentChannelController.store);
router.put('/:id', superadmin, upload.single('logo'), PaymentChannelController.update);
router.delete('/:id', superadmin, PaymentChannelController.destroy);

module.exports = router;
