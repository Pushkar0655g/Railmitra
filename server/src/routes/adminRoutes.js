const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { adminOnly } = require('../middleware/adminMiddleware');
const { getStats, getPendingAssistants, approveAssistant, rejectAssistant, getAllBookings, getSOSAlerts } = require('../controllers/adminController');

router.get('/stats', protect, adminOnly, getStats);
router.get('/pending-assistants', protect, adminOnly, getPendingAssistants);
router.post('/assistants/:id/approve', protect, adminOnly, approveAssistant);
router.post('/assistants/:id/reject', protect, adminOnly, rejectAssistant);
router.get('/bookings', protect, adminOnly, getAllBookings);
router.get('/sos-alerts', protect, adminOnly, getSOSAlerts);

module.exports = router;