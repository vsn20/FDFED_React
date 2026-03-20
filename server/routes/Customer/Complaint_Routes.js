//path:-server/routes/Customer/Complaint_Routes.js
const express = require('express');
const router = express.Router();
const { getComplaints, getEligibleSales, addComplaint } = require('../../controllers/customer/ComplaintController');
const { protect, authorize } = require('../../middleware/authMiddleware');

// All routes are protected by JWT + customer role
router.get('/', protect, authorize('customer'), getComplaints);
router.get('/eligible', protect, authorize('customer'), getEligibleSales);
router.post('/add', protect, authorize('customer'), addComplaint);

module.exports = router;
