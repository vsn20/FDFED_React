//path:-server/routes/Customer/ReviewRoute.js
const express = require('express');
const router = express.Router();
const { getReviews, submitReview } = require('../../controllers/customer/ReviewController');
const { protect, authorize } = require('../../middleware/authMiddleware');

router.get('/', protect, authorize('customer'), getReviews);
router.post('/', protect, authorize('customer'), submitReview);

module.exports = router;