//path:-server/routes/Customer/Complaint_Routes.js
const express = require('express');
const router = express.Router();
const { getComplaints, getEligibleSales, addComplaint } = require('../../controllers/customer/ComplaintController');
const { protect } = require('../../middleware/authMiddleware'); // Use existing auth middleware

// All routes are protected by JWT
router.get('/', protect, getComplaints);
router.get('/eligible', protect, getEligibleSales);
router.post('/add', protect, addComplaint);

module.exports = router;