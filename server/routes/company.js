// routes/company.js
const express = require("express");
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { protect, authorize } = require("../middleware/authMiddleware");

const {
  companyproducts_display,
  getProductById,
  addProduct,
  updateStockAvailability
} = require("../controllers/company/companyproducts_display");

// Import the NEW Orders Controller
const {
  getCompanyOrders,
  updateOrderStatus
} = require("../controllers/company/orders_controller");

// --- Multer Configuration (Kept as is from your upload) ---
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
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
  limits: { fileSize: 5 * 1024 * 1024 }, 
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
router.post("/products/add", upload.array('prod_photos', 10), addProduct);
router.post("/products/update-stockavailability/:prod_id", updateStockAvailability);

// --- NEW ORDER ROUTES ---
router.get("/orders", getCompanyOrders); // Handles list, search, pagination
router.put("/orders/:order_id", updateOrderStatus); // Handles status updates

module.exports = router;