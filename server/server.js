const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet'); // Security middleware
const cookieParser = require('cookie-parser'); // For CSRF cookies
const { doubleCsrf } = require('csrf-csrf'); // Modern CSRF protection
const path = require('path');
const fs = require('fs');
const morgan = require('morgan');
const rfs = require('rotating-file-stream'); // Rotating File Stream
const connectDB = require('./config/db');
const http = require('http');
const { Server } = require("socket.io");

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();

// 1. Create HTTP server
const server = http.createServer(app);

// 2. Initialize Socket.io with Robust CORS
// This fixes the connection issues for real-time messaging
const io = new Server(server, {
  cors: {
    // Allow both with and without trailing slash to prevent connection errors
    origin: ["http://localhost:5173", "http://localhost:5173/"], 
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
  }
});

// 3. Enable CORS for Express (Standard HTTP requests)
app.use(cors({
  origin: ["http://localhost:5173", "http://localhost:5173/"],
  credentials: true
}));

// ============ HELMET SECURITY MIDDLEWARE ============
// Sets various HTTP headers for security
app.use(helmet({
  // Content Security Policy - Controls allowed sources
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"], // For React dev
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:", "blob:"],
      connectSrc: ["'self'", "http://localhost:5173", "ws://localhost:5173"], // API & WebSocket
    }
  },
  // Allow cross-origin for React frontend
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));
// ====================================================

// ============ MORGAN HTTP LOGGER MIDDLEWARE ============
// Custom token: Add user ID from JWT if available
morgan.token('user-id', (req) => {
  return req.user ? req.user.id : 'anonymous';
});

// Custom token: Add colored status
morgan.token('status-colored', (req, res) => {
  const status = res.statusCode;
  if (status >= 500) return `\x1b[31m${status}\x1b[0m`; // Red
  if (status >= 400) return `\x1b[33m${status}\x1b[0m`; // Yellow
  if (status >= 300) return `\x1b[36m${status}\x1b[0m`; // Cyan
  return `\x1b[32m${status}\x1b[0m`; // Green
});

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// ============ ROTATING FILE STREAM SETUP ============
// Creates files like: access-2026-02-05.log, access-2026-02-06.log
const accessLogStream = rfs.createStream(
  (time, index) => {
    if (!time) return 'access.log'; // Initial file name
    
    // Format: access-YYYY-MM-DD.log
    const year = time.getFullYear();
    const month = String(time.getMonth() + 1).padStart(2, '0');
    const day = String(time.getDate()).padStart(2, '0');
    return `access-${year}-${month}-${day}.log`;
  },
  {
    interval: '1d',        // Rotate daily
    path: logsDir,         // Directory for log files
    maxFiles: 14,          // Keep only last 14 days of logs
    maxSize: '10M',        // Also rotate if file exceeds 10MB
    compress: 'gzip'       // Compress old logs to .gz files
  }
);
// ====================================================



// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Cookie Parser (Required for CSRF)
app.use(cookieParser());

// ============ CSRF PROTECTION MIDDLEWARE ============
// Using Double Submit Cookie Pattern (Modern & Secure)
const isProduction = process.env.NODE_ENV === 'production';

const {
  generateCsrfToken,    // v4.x API
  doubleCsrfProtection,
} = doubleCsrf({
  getSecret: () => process.env.JWT_SECRET || 'csrf-secret-key-change-in-production',
  // v4.x requires getSessionIdentifier - use IP + User-Agent as session identifier
  getSessionIdentifier: (req) => req.ip + (req.headers['user-agent'] || ''),
  // __Host- prefix requires secure:true (HTTPS), so only use it in production
  cookieName: isProduction ? '__Host-psifi.x-csrf-token' : 'csrf-token',
  cookieOptions: {
    httpOnly: true,
    sameSite: 'lax',  // For cross-origin compatibility
    secure: isProduction, // HTTPS only in production
    path: '/',
  },
  size: 64, // Token size
  ignoredMethods: ['GET', 'HEAD', 'OPTIONS'], // Don't check CSRF for these
  getTokenFromRequest: (req) => req.headers['x-csrf-token'], // Get token from header
});

// Route to get CSRF token (Frontend calls this first)
app.get('/api/csrf-token', (req, res) => {
  const csrfToken = generateCsrfToken(req, res);  // v4.x API
  res.json({ csrfToken });
});

// Apply CSRF protection to all state-changing routes
// Note: This protects POST, PUT, DELETE, PATCH requests
app.use(doubleCsrfProtection);

// CSRF Error Handler
app.use((err, req, res, next) => {
  if (err.code === 'EBADCSRFTOKEN' || err.message?.includes('csrf')) {
    return res.status(403).json({
      success: false,
      message: 'Invalid or missing CSRF token. Please refresh and try again.'
    });
  }
  next(err);
});
// ====================================================

// Serve static files
app.use('/uploads', express.static(path.join(__dirname, '../client/public/uploads')));

// 4. Middleware to pass 'io' to all routes/controllers
// This allows you to emit socket events from your controllers (like sending a message)
app.use((req, res, next) => {
  req.io = io;
  next();
});

// --- MOUNT ROUTERS ---

// Auth Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/auth/company', require('./routes/companyAuthRoutes'));
app.use('/api/auth/customer', require('./routes/customerAuthRoutes'));
app.use('/api/forgot-password', require('./routes/forgotPasswordRoutes'));

// Owner/Admin Routes
app.use('/api/companies', require('./routes/owner/companyRoutes'));
app.use('/api/branches', require('./routes/owner/branchRoutes'));
app.use('/api/employees', require('./routes/owner/employeeRoutes'));
app.use('/api/owner/products', require('./routes/owner/ProductRoutes'));
app.use('/api/owner/sales', require('./routes/owner/SalesRoutes'));
app.use('/api/owner/orders', require('./routes/owner/OrderRoutes'));
app.use('/api/owner/inventory', require('./routes/owner/InventoryRoutes'));
app.use('/api/owner/salaries', require('./routes/owner/SalariesRoutes'));
app.use('/api/owner/profits', require('./routes/owner/profitRoutes'));
app.use('/api/owner/analytics', require('./routes/owner/ownerDashboardRoutes'));

// *** MESSAGING ROUTE ***
// Ensure your Frontend fetches from: http://localhost:5001/api/owner/messages
app.use('/api/owner/messages', require('./routes/owner/messageRoutes'));

// Manager routes
app.use('/api/manager/employees', require('./routes/manager/employeeRoutes'));
app.use('/api/manager/orders', require('./routes/managerOrderRoutes'));
app.use('/api/manager/inventory', require('./routes/manager/managerInventoryRoutes'));
app.use('/api/manager/sales', require('./routes/manager/SalesRoutes'));
app.use('/api/manager/salary', require('./routes/manager/salaryRoutes'));
app.use('/api/manager/analytics', require('./routes/manager/ManagerAnalyticsControllerRoutes'));
app.use('/api/manager/messages', require('./routes/manager/managerMessageRoutes'));
// Public routes
app.use('/api/our-branches', require('./routes/publicroutes'));

// Salesman


// Salesman Routes
app.use('/api/salesman/profile', require('./routes/salesman/detailsRoutes'));
app.use('/api/salesman/sales', require('./routes/salesman/salesRoutes'));
app.use('/api/salesman/inventory', require('./routes/salesman/inventoryRoutes'));
app.use('/api/salesman/salaries', require('./routes/salesman/salaryRoutes'));
app.use('/api/salesman/analytics', require('./routes/salesman/dashboardRoutes'));
app.use('/api/salesman/messages', require('./routes/salesman/salesmanMessageRoutes'));
// Company routes - with products

// Company Routes
app.use('/api/company', require('./routes/company'));

// Customer Routes
app.use('/api/customer/previouspurchases', require('./routes/customer/previousPurchasesRoutes'));
app.use('/api/customer/complaints', require('./routes/Customer/Complaint_Routes'));
app.use('/api/customer/reviews', require('./routes/Customer/ReviewRoute'));
app.use('/api/customer/blogs', require('./routes/Customer/blogsRoutes'));

// Public Routes
app.use('/api/our-branches', require('./routes/publicroutes'));
app.use('/api/newproducts', require('./routes/newProductsRoutes'));
app.use('/api/ourproducts', require('./routes/OurProductsRoutes'));
app.use('/api/topproducts', require('./routes/TopPoductsRoutes'));
app.use('/api/contact', require('./routes/ContactUsRoute'));

// 5. Socket.io Connection Logic (Debug logs)
io.on("connection", (socket) => {
  console.log("New client connected to Socket.io:", socket.id);

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    success: false, 
    message: err.message || 'Internal Server Error' 
  });
});

const PORT = process.env.PORT || 5001;

// 6. Start the Server
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));