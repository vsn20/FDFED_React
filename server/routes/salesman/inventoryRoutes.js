const express = require('express');
const router = express.Router();
const { getSalesmanInventory } = require('../../controllers/salesman/inventoryController');
const { protect, authorize } = require('../../middleware/authMiddleware');

router.route('/')
    .get(protect, authorize('salesman'), getSalesmanInventory);

module.exports = router;