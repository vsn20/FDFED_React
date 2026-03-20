const express = require('express');
const router = express.Router();
const { getCustomerBlogs } = require('../../controllers/company/blogsController');
const { protect, authorize } = require('../../middleware/authMiddleware');

router.get('/', protect, authorize('customer'), getCustomerBlogs);

module.exports = router;