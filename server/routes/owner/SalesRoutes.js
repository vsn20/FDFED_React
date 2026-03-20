const express = require('express');
const router = express.Router();
const { getAllSales, getSaleById } = require('../../controllers/owner/SalesController');
const { protect, authorize } = require('../../middleware/authMiddleware');

// Apply auth middleware to all routes
router.use(protect, authorize('owner'));

router.get('/', getAllSales);
router.get('/:id', getSaleById);

module.exports = router;
