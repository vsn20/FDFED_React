const express = require('express');
const router = express.Router();
const {
  getAcceptedProducts,
  getRejectedProducts,
  getNewProducts,
  getProductById,
  updateProductStatus
} = require('../../controllers/owner/ProductController');
const { protect, authorize } = require('../../middleware/authMiddleware');

// Apply auth middleware to all routes
router.use(protect, authorize('owner'));

router.get('/accepted', getAcceptedProducts);
router.get('/rejected', getRejectedProducts);
router.get('/new', getNewProducts);
router.get('/:prod_id', getProductById);
router.put('/:prod_id/status', updateProductStatus);

module.exports = router;
