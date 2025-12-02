const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');
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

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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
// Public routes
app.use('/api/our-branches', require('./routes/publicroutes'));

// Salesman

// Salesman Routes
app.use('/api/salesman/profile', require('./routes/salesman/detailsRoutes'));
app.use('/api/salesman/sales', require('./routes/salesman/salesRoutes'));
app.use('/api/salesman/inventory', require('./routes/salesman/inventoryRoutes'));
app.use('/api/salesman/salaries', require('./routes/salesman/salaryRoutes'));
app.use('/api/salesman/analytics', require('./routes/salesman/dashboardRoutes'));
// Company routes - with products

// Company Routes
app.use('/api/company', require('./routes/company'));

// Customer Routes
app.use('/api/customer/previouspurchases', require('./routes/customer/previousPurchasesRoutes'));
app.use('/api/customer/complaints', require('./routes/Customer/Complaint_Routes'));
app.use('/api/customer/reviews', require('./routes/Customer/ReviewRoute'));

// Public Routes
app.use('/api/our-branches', require('./routes/publicroutes'));
app.use('/api/newproducts', require('./routes/newProductsRoutes'));
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