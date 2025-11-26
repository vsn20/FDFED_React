const express = require('express');
const router = express.Router();
const { getBranchInventory } = require('../../controllers/manager/ManagerInventoryController');
const { protect, authorize } = require('../../middleware/authMiddleware');

// All routes are protected and for 'manager' role
router.use(protect, authorize('manager'));

router.route('/')
  .get(getBranchInventory);

module.exports = router;