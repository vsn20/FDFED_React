const express = require('express');
const router = express.Router();
// Adjust path to your new controller
const { login, signup } = require('../controllers/companyAuthController'); 

// @route   POST api/auth/company/login
router.post('/login', login);

// @route   POST api/auth/company/signup
router.post('/signup', signup);

module.exports = router;