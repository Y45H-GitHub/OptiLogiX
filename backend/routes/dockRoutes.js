const express = require('express');
const router = express.Router();
const dockController = require('../controllers/dockController');

// Routes for docks
router.get('/', dockController.getDocks);
router.get('/available', dockController.getAvailableDocks);
router.post('/assign', dockController.assignTruckToDock);
router.post('/:dockId/release', dockController.releaseDock);

module.exports = router;
