const express = require('express');
const router = express.Router();
const { 
    getManagerSales, 
    addSale, 
    getSaleById, 
    updateSale,
    getSalesmen,
    getCompanies,
    getProductsByCompany
} = require('../../controllers/manager/ManagerSalesController');
const { protect, authorize } = require('../../middleware/authMiddleware');

router.get('/', protect, authorize('manager'), getManagerSales);
router.post('/', protect, authorize('manager'), addSale);

router.get('/form-data/salesmen', protect, authorize('manager'), getSalesmen);
router.get('/form-data/companies', protect, authorize('manager'), getCompanies);
router.get('/form-data/products/:companyId', protect, authorize('manager'), getProductsByCompany);

router.get('/:id', protect, authorize('manager'), getSaleById);
router.put('/:id', protect, authorize('manager'), updateSale);

module.exports = router;