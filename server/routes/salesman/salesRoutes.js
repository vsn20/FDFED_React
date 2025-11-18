const express = require('express');
const router = express.Router();
const {
  getSalesData,
  getSaleDetails,
  addSale,
  getCompanies,
  getProductsByCompany,
  checkUniqueCode,
  checkInventory
} = require('../../controllers/salesman/salesController');
const { protect, authorize } = require('../../middleware/authMiddleware'); // Assuming auth middleware location

// Main Sales Routes
router.route('/')
  .get(protect, authorize('salesman'), getSalesData)
  .post(protect, authorize('salesman'), addSale);

router.route('/:sales_id')
  .get(protect, authorize('salesman'), getSaleDetails);

// Helper Routes for AddSale Form
router.route('/helpers/companies')
  .get(protect, authorize('salesman'), getCompanies);
  
router.route('/helpers/products-by-company/:companyId')
  .get(protect, authorize('salesman'), getProductsByCompany);

router.route('/helpers/check-unique-code')
  .post(protect, authorize('salesman'), checkUniqueCode);
  
router.route('/helpers/check-inventory')
  .post(protect, authorize('salesman'), checkInventory);

module.exports = router;