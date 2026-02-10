const express = require("express");
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const rfs = require('rotating-file-stream');
const { protect, authorize } = require("../middleware/authMiddleware");

// Import Controllers
const { getDashboardData } = require("../controllers/company/dashboard");

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

// --- Error Log Stream Setup ---
const logsDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

const getDateString = (date = new Date()) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const errorLogStream = rfs.createStream(
  (time, index) => {
    const dateStr = getDateString(time || new Date());
    return `error-${dateStr}.log`;
  },
  {
    interval: '1d',
    path: logsDir,
    maxFiles: 30
  }
);

// --- 1. Multer Configuration (REQUIRED for File Uploads) ---
const MAX_PHOTOS = 3; // Maximum allowed product photos

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
  limits: { 
    fileSize: 5 * 1024 * 1024, // 5MB limit per file
    files: MAX_PHOTOS          // Maximum 3 files
  },
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|gif|webp/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    if (mimetype && extname) return cb(null, true);
    cb(new Error("Error: Images Only!"));
  }
});

// --- Multer Error Handler Middleware ---
const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    // Log the error
    const errorLog = `[${new Date().toISOString()}] MULTER ERROR - Code: ${err.code} - IP: ${req.ip} - User: ${req.user?.c_id || 'unknown'} - Field: ${err.field || 'unknown'}\n`;
    errorLogStream.write(errorLog);
    
    if (err.code === 'LIMIT_FILE_COUNT' || err.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        success: false,
        message: `Maximum ${MAX_PHOTOS} photos allowed. Please select only ${MAX_PHOTOS} images.`
      });
    }
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File too large. Maximum size is 5MB per image.'
      });
    }
    return res.status(400).json({
      success: false,
      message: `Upload error: ${err.message}`
    });
  }
  
  if (err.message === 'Error: Images Only!') {
    const errorLog = `[${new Date().toISOString()}] INVALID FILE TYPE - IP: ${req.ip} - User: ${req.user?.c_id || 'unknown'}\n`;
    errorLogStream.write(errorLog);
    return res.status(400).json({
      success: false,
      message: 'Only image files (jpeg, jpg, png, gif, webp) are allowed.'
    });
  }
  
  next(err);
};

// --- Middleware ---
router.use(protect);
router.use(authorize('company'));

// --- PRODUCT ROUTES ---
router.get("/products", companyproducts_display);
router.get("/products/details/:prod_id", getProductById);

// *** Product Add with max 3 photos - includes error handling ***
router.post("/products/add", upload.array('prod_photos', MAX_PHOTOS), handleMulterError, addProduct);

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

router.get("/analytics/data", getDashboardData);


module.exports = router;