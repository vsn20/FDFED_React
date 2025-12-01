// path: server/routes/manager/salaryRoutes.js
const express = require('express');
const router = express.Router();

const {
  getSalariesByMonth,
  getMonthOptions
} = require('../../controllers/manager/ManagerSalaryController');

const { protect, authorize } = require('../../middleware/authMiddleware'); // Assumed authentication middleware

// All routes are protected and restricted to 'manager' role
router.use(protect, authorize('manager')); 

// Route to get the list of month options for the dropdown
router.route('/months')
  .get(getMonthOptions);

// Route to fetch calculated salaries for the selected month
router.route('/')
  .get(getSalariesByMonth);

module.exports = router;