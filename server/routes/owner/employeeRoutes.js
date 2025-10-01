const express = require('express');
const router = express.Router();

const { getEmployees, addEmployee, getSingleEmployee, updateEmployee } = require('../../controllers/owner/EmployeeController');
const { protect, authorize } = require('../../middleware/authMiddleware');

router.route('/')
    .get(protect, authorize('owner'), getEmployees)
    .post(protect, authorize('owner'), addEmployee);

router.route('/:e_id')
    .get(protect, authorize('owner'), getSingleEmployee)
    .put(protect, authorize('owner'), updateEmployee);

module.exports = router;