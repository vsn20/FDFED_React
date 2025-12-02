const express = require('express');
const router = express.Router();
const { getNewProducts } = require('../controllers/newProductsController');

// @route   GET /api/newproducts
router.get('/', getNewProducts);

module.exports = router;