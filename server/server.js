const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
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

// Mount routers
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/auth/company', require('./routes/companyAuthRoutes'));
app.use('/api/companies', require('./routes/owner/companyRoutes'));
app.use('/api/branches', require('./routes/owner/branchRoutes'));
app.use('/api/employees', require('./routes/owner/employeeRoutes'));

// Manager routes
app.use('/api/manager/employees', require('./routes/manager/employeeRoutes'));

app.use('/api/our-branches', require('./routes/publicroutes'));

//salesman
app.use('/api/salesman/profile', require('./routes/salesman/detailsRoutes'));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));