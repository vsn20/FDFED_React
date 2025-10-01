const express = require('express');
const router = express.Router();

const { getSalesmanDetails, updateSalesmanDetails } = require('../../controllers/salesman/detailsController');
const { protect, authorize } = require('../../middleware/authMiddleware');

router.route('/')
    .get(protect, authorize('salesman'), getSalesmanDetails);

router.route('/update')
    .post(protect, authorize('salesman'), updateSalesmanDetails);

module.exports = router;