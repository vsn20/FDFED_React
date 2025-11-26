const express = require('express');
const router = express.Router();
const { getAllSales, getSaleById } = require('../../controllers/owner/SalesController');

// Route to get all sales data
router.get('/', getAllSales);

// Route to get specific sale details
router.get('/:id', getSaleById);

module.exports = router;