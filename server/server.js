const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Enable CORS
app.use(cors());

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from frontend public/uploads directory
// Adjust the path based on your folder structure
app.use('/uploads', express.static(path.join(__dirname, '../client/public/uploads')));

// Mount routers
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/auth/company', require('./routes/companyAuthRoutes'));
app.use('/api/companies', require('./routes/owner/companyRoutes'));
app.use('/api/branches', require('./routes/owner/branchRoutes'));
app.use('/api/employees', require('./routes/owner/employeeRoutes'));
app.use('/api/owner/products', require('./routes/owner/ProductRoutes'));

// Manager routes
app.use('/api/manager/employees', require('./routes/manager/employeeRoutes'));
app.use('/api/manager/orders', require('./routes/managerOrderRoutes'));
app.use('/api/manager/inventory', require('./routes/manager/managerInventoryRoutes'));
app.use('/api/our-branches', require('./routes/publicroutes'));

// Salesman
app.use('/api/salesman/profile', require('./routes/salesman/detailsRoutes'));
app.use('/api/salesman/sales', require('./routes/salesman/salesRoutes'));
app.use('/api/salesman/inventory', require('./routes/salesman/inventoryRoutes'));
app.use('/api/salesman/salaries', require('./routes/salesman/salaryRoutes'));
// Company routes - with products
app.use('/api/company', require('./routes/company'));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    success: false, 
    message: err.message || 'Internal Server Error' 
  });
});

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));