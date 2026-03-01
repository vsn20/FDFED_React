const express = require('express');
const router = express.Router();
const {
  getOwnerDashboardData,
  getSalesmanPerformance,
  getBranchSales,
  getCompanySales,
  getProductSales,
} = require('../../controllers/owner/ownerDashboardController');
const { protect, authorize } = require('../../middleware/authMiddleware');

// @route   GET /api/owner/analytics/data
router.get('/data', protect, authorize('owner'), getOwnerDashboardData);

// @route   GET /api/owner/analytics/salesman-performance?month=YYYY-MM
router.get('/salesman-performance', protect, authorize('owner'), getSalesmanPerformance);

// @route   GET /api/owner/analytics/branch-sales?month=YYYY-MM
router.get('/branch-sales', protect, authorize('owner'), getBranchSales);

// @route   GET /api/owner/analytics/company-sales?month=YYYY-MM
router.get('/company-sales', protect, authorize('owner'), getCompanySales);

// @route   GET /api/owner/analytics/product-sales?month=YYYY-MM&company=CompanyName
router.get('/product-sales', protect, authorize('owner'), getProductSales);

module.exports = router;