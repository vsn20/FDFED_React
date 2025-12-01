//path: server/server.js
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');
// 1. Import http and socket.io
const http = require('http');
const { Server } = require("socket.io");

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();

// 2. Create HTTP server
const server = http.createServer(app);

// 3. Initialize Socket.io with CORS
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173/", 
    methods: ["GET", "POST", "PUT", "DELETE"]
  }
});

// Enable CORS for Express
app.use(cors());

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use('/uploads', express.static(path.join(__dirname, '../client/public/uploads')));

// 4. Middleware to pass 'io' to all routes/controllers
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Mount routers
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/auth/company', require('./routes/companyAuthRoutes'));
app.use('/api/companies', require('./routes/owner/companyRoutes'));
app.use('/api/branches', require('./routes/owner/branchRoutes'));
app.use('/api/employees', require('./routes/owner/employeeRoutes'));
app.use('/api/owner/products', require('./routes/owner/ProductRoutes'));
app.use('/api/owner/sales', require('./routes/owner/SalesRoutes'));
app.use('/api/owner/orders', require('./routes/owner/OrderRoutes'));
app.use('/api/owner/inventory', require('./routes/owner/InventoryRoutes'));
app.use('/api/owner/salaries', require('./routes/owner/SalariesRoutes'));
app.use('/api/owner/profits',require('./routes/owner/profitRoutes'))

// Manager routes
app.use('/api/manager/employees', require('./routes/manager/employeeRoutes'));
app.use('/api/manager/orders', require('./routes/managerOrderRoutes'));
app.use('/api/manager/inventory', require('./routes/manager/managerInventoryRoutes'));
app.use('/api/manager/sales', require('./routes/manager/SalesRoutes'));
app.use('/api/manager/salary', require('./routes/manager/salaryRoutes'));

// Public routes
app.use('/api/our-branches', require('./routes/publicroutes'));

// Salesman
app.use('/api/salesman/profile', require('./routes/salesman/detailsRoutes'));
app.use('/api/salesman/sales', require('./routes/salesman/salesRoutes'));
app.use('/api/salesman/inventory', require('./routes/salesman/inventoryRoutes'));

// Company routes
app.use('/api/company', require('./routes/company'));

// 5. Socket.io Connection Logic
io.on("connection", (socket) => {
  console.log("New client connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});
app.use('/api/salesman/salaries', require('./routes/salesman/salaryRoutes'));
// Company routes - with products
app.use('/api/company', require('./routes/company'));

// Public Routes
app.use('/api/newproducts', require('./routes/newProductsRoutes'));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    success: false, 
    message: err.message || 'Internal Server Error' 
  });
});

const PORT = process.env.PORT || 5001;

// 6. Change app.listen to server.listen
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));