const express = require('express');
const router = express.Router();
const {
  getOwnerDashboardData,
  getSalesmanPerformance,
  getBranchSales,
} = require('../../controllers/owner/ownerDashboardController');
const { protect, authorize } = require('../../middleware/authMiddleware');

// @route   GET /api/owner/analytics/data
router.get('/data', protect, authorize('owner'), getOwnerDashboardData);

// @route   GET /api/owner/analytics/salesman-performance?month=YYYY-MM
router.get('/salesman-performance', protect, authorize('owner'), getSalesmanPerformance);

// @route   GET /api/owner/analytics/branch-sales
router.get('/branch-sales', protect, authorize('owner'), getBranchSales);

module.exports = router;