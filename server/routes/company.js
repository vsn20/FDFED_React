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

// Configure multer for file uploads
// IMPORTANT: Save to frontend/public/uploads directory
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Adjust this path to point to your frontend public/uploads folder
    // If backend is at /backend and frontend is at /frontend:
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
    
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error("Error: Images Only!"));
  }
});

// Apply auth middleware to all routes
router.use(protect);
router.use(authorize('company'));

// Products list (JSON)
router.get("/products", companyproducts_display);

// Product details (JSON)
router.get("/products/details/:prod_id", getProductById);

// Add product (POST with file upload)
router.post("/products/add", upload.array('prod_photos', 10), addProduct);

// Update stock availability
router.post("/products/update-stockavailability/:prod_id", updateStockAvailability);

module.exports = router;