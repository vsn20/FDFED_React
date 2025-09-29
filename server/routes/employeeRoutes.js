const express = require('express');
const router = express.Router();
const { 
    getEmployees, 
    addEmployee, 
    getEmployeeById, 
    updateEmployee 
} = require('../controllers/employeeController');
const { protect, authorize } = require('../middleware/authMiddleware');

// All routes below are protected and require an 'owner' role.
// The protect middleware will run first, then the authorize middleware.
router.route('/')
    .get(protect, authorize('owner'), getEmployees)
    .post(protect, authorize('owner'), addEmployee);

router.route('/:id')
    .get(protect, authorize('owner'), getEmployeeById)
    .put(protect, authorize('owner'), updateEmployee);

module.exports = router;
