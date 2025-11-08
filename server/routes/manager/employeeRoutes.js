const express = require('express');
const router = express.Router();

const {
  getEmployees,
  getSingleEmployee,
  updateEmployee,
  getManagerProfile,
  updateManagerProfile,
  addSalesman 
} = require('../../controllers/manager/ManagerEmployeeController');

const { protect, authorize } = require('../../middleware/authMiddleware');

router.route('/')
  .get(protect, authorize('manager'), getEmployees)
  .post(protect, authorize('manager'), addSalesman);

router.route('/me')
  .get(protect, authorize('manager'), getManagerProfile)
  .put(protect, authorize('manager'), updateManagerProfile);

router.route('/:e_id')
  .get(protect, authorize('manager'), getSingleEmployee)
  .put(protect, authorize('manager'), updateEmployee);

module.exports = router;