//path:server/routes/owner/OrderRoutes.js
const express = require('express');
const router = express.Router();
const { getAllOrders, getOrderById, getBranchesForFilter } = require('../../controllers/owner/OrderController');
const { protect, authorize } = require('../../middleware/authMiddleware');



router.get('/', protect, authorize('owner'), getAllOrders);
router.get('/branches', protect, authorize('owner'), getBranchesForFilter);
router.get('/:id', protect, authorize('owner'), getOrderById);

module.exports = router;