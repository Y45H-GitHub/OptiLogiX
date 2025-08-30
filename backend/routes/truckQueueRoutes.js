const express = require('express');
const router = express.Router();
const truckQueueController = require('../controllers/truckQueueController');

router.get('/', truckQueueController.getTruckQueue);

module.exports = router;