const express = require('express');
const router = express.Router();
const { getCustomerBlogs } = require('../../controllers/company/blogsController');
const { protect } = require('../../middleware/authMiddleware');

// @route   GET /api/customer/blogs
router.get('/', protect, getCustomerBlogs);

module.exports = router;