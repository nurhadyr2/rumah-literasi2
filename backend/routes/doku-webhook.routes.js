const express = require('express');

const DokuPaymentController = require('../controllers/doku-payment.controller');

const router = express.Router();

router.post(
	'/',
	express.json({
		type: () => true,
		verify: (req, res, buf) => {
			req.rawBody = buf;
		},
	}),
	DokuPaymentController.notification
);

module.exports = router;
