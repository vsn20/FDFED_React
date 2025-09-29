const express = require('express');
const { signup, login } = require('../controllers/authController');
const router = express.Router();

// @route   POST api/auth/signup
// @desc    Register a user (creates an Employee and a User)
// @access  Public
router.post('/signup', signup);

// @route   POST api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post('/login', login);

module.exports = router;
