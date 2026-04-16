// ============ SEARCH ROUTES ============
const express = require('express');
const router = express.Router();
const { searchProducts, autocomplete } = require('../controllers/searchController');

// GET /api/search?q=<query>&page=1&limit=10
router.get('/', searchProducts);

// GET /api/search/autocomplete?q=<partial query>
router.get('/autocomplete', autocomplete);

module.exports = router;
