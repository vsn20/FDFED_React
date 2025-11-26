// routes/company.js
const express = require("express");
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { protect, authorize } = require("../middleware/authMiddleware");

// ... (Keep your existing imports for products and orders) ...

const {
  companyproducts_display,
  getProductById,
  addProduct,
  updateStockAvailability
} = require("../controllers/company/companyproducts_display");

const {
  getCompanyOrders,
  updateOrderStatus
} = require("../controllers/company/orders_controller");

// IMPORT NEW COMPLAINTS CONTROLLER
const {
  getCompanyComplaints,
  updateComplaintStatus
} = require("../controllers/company/complaints_controller");

// ... (Keep your existing Multer config) ...

// Apply auth middleware
router.use(protect);
router.use(authorize('company'));

// ... (Keep Product and Order routes) ...
router.get("/products", companyproducts_display);
router.get("/products/details/:prod_id", getProductById);
router.post("/products/add", addProduct); // Note: Add multer middleware if needed here as per your previous code
router.post("/products/update-stockavailability/:prod_id", updateStockAvailability);

router.get("/orders", getCompanyOrders);
router.put("/orders/:order_id", updateOrderStatus);

// --- NEW COMPLAINT ROUTES ---
router.get("/complaints", getCompanyComplaints);
router.put("/complaints/:complaint_id/status", updateComplaintStatus);

module.exports = router;