const express = require('express');
const router = express.Router();

const {
  getOrders,
  getSingleOrder,
  addOrder,
  updateOrder,
  getOrderFormData,
  getProductsByCompany
} = require('../controllers/manager/ManagerOrderController');

const { protect, authorize } = require('../middleware/authMiddleware');

// All routes are protected and for 'manager' role
router.use(protect, authorize('manager'));

router.route('/')
  .get(getOrders)
  .post(addOrder);

router.route('/form-data')
  .get(getOrderFormData);

router.route('/products/:companyId')
    .get(getProductsByCompany);

router.route('/:id')
  .get(getSingleOrder)
  .put(updateOrder);

module.exports = router;