const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointmentController');

router.get('/', appointmentController.getAppointments);
router.post('/', appointmentController.createAppointment);
router.post('/arrive', appointmentController.recordTruckArrival);
router.post('/assign', appointmentController.assignTruckToDock);
router.post('/update-status', appointmentController.updateAppointmentStatus);
router.post('/depart', appointmentController.recordTruckDeparture);

module.exports = router;