const express = require("express");
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { protect, authorize } = require("../middleware/authMiddleware");

// Import Controllers
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

const {
  getCompanyComplaints,
  updateComplaintStatus
} = require("../controllers/company/complaints_controller");

const {
  getInbox,
  getSent,
  getSalesManagers,
  sendMessage
} = require("../controllers/company/messages_controller");

const {
  getCompanySales,
  getSaleDetails,
  updateInstallationStatus
} = require("../controllers/company/sales_controller");

// --- 1. Multer Configuration (REQUIRED for File Uploads) ---
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Ensure this path exists: client/public/uploads
    const uploadsPath = path.join(__dirname, '../../client/public/uploads');
    cb(null, uploadsPath);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|gif|webp/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    if (mimetype && extname) return cb(null, true);
    cb(new Error("Error: Images Only!"));
  }
});

// --- Middleware ---
router.use(protect);
router.use(authorize('company'));

// --- PRODUCT ROUTES ---
router.get("/products", companyproducts_display);
router.get("/products/details/:prod_id", getProductById);

// *** KEY FIX: Add 'upload.array' middleware here ***
router.post("/products/add", upload.array('prod_photos', 10), addProduct);

router.post("/products/update-stockavailability/:prod_id", updateStockAvailability);

// --- ORDER ROUTES ---
router.get("/orders", getCompanyOrders);
router.put("/orders/:order_id", updateOrderStatus);

// --- COMPLAINT ROUTES ---
router.get("/complaints", getCompanyComplaints);
router.put("/complaints/:complaint_id/status", updateComplaintStatus);

router.get("/sales", getCompanySales);
router.get("/sales/:id", getSaleDetails);
router.put("/sales/:id/installation", updateInstallationStatus);

// --- MESSAGE ROUTES ---
router.get("/messages/inbox", getInbox);
router.get("/messages/sent", getSent);
router.get("/messages/sales-managers", getSalesManagers);
router.post("/messages/send", sendMessage);

module.exports = router;