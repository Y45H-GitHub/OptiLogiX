const express = require('express');
const router = express.Router();
const recentAssignmentController = require('../controllers/recentAssignmentController');

router.get('/', recentAssignmentController.getRecentAssignments);

module.exports = router;