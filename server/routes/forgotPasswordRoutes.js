const express = require('express');
const router = express.Router();
const { sendOtp, resetPassword } = require('../controllers/forgotPasswordController');

// @route   POST api/forgot-password/send-otp
router.post('/send-otp', sendOtp);

// @route   POST api/forgot-password/reset
router.post('/reset', resetPassword);

module.exports = router;