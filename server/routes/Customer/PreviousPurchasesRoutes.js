const express = require('express');
const router = express.Router();
const { getCustomerPurchases } = require('../../controllers/customer/PreviousPurchases');
const { protect, authorize } = require('../../middleware/authMiddleware');

router.get('/', protect, authorize('customer'), getCustomerPurchases);

module.exports = router;