//path:-server/routes/TopPoductsRoutes.js
const express = require('express');
const router = express.Router();
const { getTopProducts } = require('../controllers/TopProductsController');

// @route   GET /api/topproducts
router.get('/', getTopProducts);

module.exports = router;