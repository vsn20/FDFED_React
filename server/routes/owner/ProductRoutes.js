const express = require('express');
const router = express.Router();
const {
  getAcceptedProducts,
  getRejectedProducts,
  getNewProducts,
  getProductById,
  updateProductStatus
} = require('../../controllers/owner/ProductController'); // Adjust path if needed
const authMiddleware = require('../../middleware/authMiddleware'); // Assuming you have auth middleware

// Note: Add your owner role protection middleware as needed
// For example: router.use(authMiddleware, protectRole('owner'));

/**
 * @route   GET /api/owner/products/accepted
 * @desc    Get all accepted products
 * @access  Private (Owner)
 */
router.get('/accepted', getAcceptedProducts);

/**
 * @route   GET /api/owner/products/rejected
 * @desc    Get all rejected products
 * @access  Private (Owner)
 */
router.get('/rejected', getRejectedProducts);

/**
 * @route   GET /api/owner/products/new
 * @desc    Get all new (hold) products
 * @access  Private (Owner)
 */
router.get('/new', getNewProducts);

/**
 * @route   GET /api/owner/products/:prod_id
 * @desc    Get a single product by prod_id
 * @access  Private (Owner)
 */
router.get('/:prod_id', getProductById);

/**
 * @route   PUT /api/owner/products/:prod_id/status
 * @desc    Update a product's status
 * @access  Private (Owner)
 */
router.put('/:prod_id/status', updateProductStatus);

module.exports = router;