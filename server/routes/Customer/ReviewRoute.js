//path:-server/routes/Customer/ReviewRoute.js
const express = require('express');
const router = express.Router();
const { getReviews, submitReview } = require('../../controllers/customer/ReviewController');
const { protect } = require('../../middleware/authMiddleware');

router.get('/', protect, getReviews);
router.post('/', protect, submitReview);

module.exports = router;