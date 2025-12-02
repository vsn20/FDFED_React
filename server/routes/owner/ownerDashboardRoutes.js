const express = require('express');
const router = express.Router();
const { getOwnerDashboardData } = require('../../controllers/owner/ownerDashboardController');
const { protect, authorize } = require('../../middleware/authMiddleware');

// @route   GET /api/owner/analytics/data
router.get('/data', protect, authorize('owner'), getOwnerDashboardData);

module.exports = router;