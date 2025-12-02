const express = require('express');
const router = express.Router();
const { getMonthlyProfits } = require('../../controllers/owner/ProfitController');
const { protect, authorize } = require('../../middleware/authMiddleware');

// Mount path: /api/owner/profits

router.get('/', protect, authorize('owner'), getMonthlyProfits);

module.exports = router;