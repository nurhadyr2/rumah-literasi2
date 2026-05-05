const express = require('express');
const router = express.Router();
const DeliveryController = require('../controllers/delivery.controller');

router.post('/couriers', DeliveryController.rates);
router.post('/dropoff-points', DeliveryController.dropoffPoints);

module.exports = router;
