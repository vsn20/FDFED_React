//path:-server/routes/OurProductsRoutes.js
const express = require('express');
const router = express.Router();
const { getOurProducts } = require('../controllers/OurProductsController');

// @route   GET /api/ourproducts
router.get('/', getOurProducts);

module.exports = router;