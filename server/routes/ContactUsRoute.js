//path:-server/routes/ContactUsRoute.js
const express = require('express');
const router = express.Router();
const { submitContact } = require('../controllers/ContactUsController');

// Route: POST /api/contact/submit
router.post('/submit', submitContact);

module.exports = router;