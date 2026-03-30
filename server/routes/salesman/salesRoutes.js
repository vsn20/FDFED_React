const express = require('express');
const router = express.Router();
const {
  getSalesData,
  getSaleDetails,
  addSale,
  initiateOnlinePayment,
  verifyOnlinePaymentAndCreateSale,
  initiateScannerPayment,
  getScannerPaymentStatus,
  getCompanies,
  getProductsByCompany,
  checkUniqueCode,
  checkInventory
} = require('../../controllers/salesman/salesController');
const { protect, authorize } = require('../../middleware/authMiddleware');

// Apply auth to all routes
router.use(protect, authorize('salesman'));

// Helper Routes MUST come before /:sales_id to avoid route conflict
router.get('/helpers/companies', getCompanies);
router.get('/helpers/products-by-company/:companyId', getProductsByCompany);
router.post('/helpers/check-unique-code', checkUniqueCode);
router.post('/helpers/check-inventory', checkInventory);
router.post('/payments/initiate-online', initiateOnlinePayment);
router.post('/payments/verify-online', verifyOnlinePaymentAndCreateSale);
router.post('/payments/initiate-scanner', initiateScannerPayment);
router.get('/payments/status/:payment_reference_id', getScannerPaymentStatus);

// Main Sales Routes
router.route('/')
  .get(getSalesData)
  .post(addSale);

router.get('/:sales_id', getSaleDetails);

module.exports = router;
