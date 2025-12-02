const express = require('express');
const router = express.Router();
const { getCustomerPurchases } = require('../../controllers/customer/PreviousPurchases');

// FIX: Destructure 'protect' from the middleware file
// previously: const authMiddleware = require(...)
const { protect } = require('../../middleware/authMiddleware'); 

// @route   GET /api/customer/previouspurchases
// FIX: Use 'protect' instead of 'authMiddleware'
router.get('/', protect, getCustomerPurchases);

module.exports = router;