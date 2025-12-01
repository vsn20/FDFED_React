const express = require('express');
const router = express.Router();
const { getSalaries, getSalaryBranches } = require('../../controllers/owner/SalaryController');
const { protect, authorize } = require('../../middleware/authMiddleware');

router.get('/', protect, authorize('owner'), getSalaries);
router.get('/branches', protect, authorize('owner'), getSalaryBranches);

module.exports = router;