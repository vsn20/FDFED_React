const express = require('express');
const router = express.Router();
const { getSalesmanSalary } = require('../../controllers/salesman/salaryController');
const { protect, authorize } = require('../../middleware/authMiddleware');

// @route   GET /api/salesman/salaries
router.route('/')
  .get(protect, authorize('salesman'), getSalesmanSalary);

module.exports = router;