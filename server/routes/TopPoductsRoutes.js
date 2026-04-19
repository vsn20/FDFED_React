//path:-server/routes/TopPoductsRoutes.js
const express = require('express');
const router = express.Router();
const { getTopProducts, getTopProductsWithoutOptimization } = require('../controllers/TopProductsController');

// @route   GET /api/topproducts
router.get('/', getTopProducts);

// @route   GET /api/topproductswithoutoptimization
// Unoptimized version (N+1 query pattern) - For demonstration only
router.get('/without-optimization', getTopProductsWithoutOptimization);

module.exports = router;