const express = require('express');
const router = express.Router();
const { getSalesmanDashboardData } = require('../../controllers/salesman/dashboardController');
const { protect, authorize } = require('../../middleware/authMiddleware');

// @route   GET /api/salesman/analytics/data
router.get('/data', protect, authorize('salesman'), getSalesmanDashboardData);

module.exports = router;