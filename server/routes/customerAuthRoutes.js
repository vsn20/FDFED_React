const express = require('express');
const router = express.Router();
const { customerLogin } = require('../controllers/customerAuthController');

// @route   POST api/auth/customer/login
router.post('/login', customerLogin);

module.exports = router;