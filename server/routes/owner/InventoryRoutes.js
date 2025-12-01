//path:-server/routes/owner/InventoryRoutes.js
const express = require('express');
const router = express.Router();
const { getAllInventory, getBranchesForInventoryFilter } = require('../../controllers/owner/InventoryController');
const { protect, authorize } = require('../../middleware/authMiddleware');

// Mount path in server.js should be: app.use('/api/owner/inventory', require('./routes/owner/InventoryRoutes'));

router.get('/', protect, authorize('owner'), getAllInventory);
router.get('/branches', protect, authorize('owner'), getBranchesForInventoryFilter);

module.exports = router;