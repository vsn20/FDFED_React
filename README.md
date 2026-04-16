
# Electroland (Academic Project)

A comprehensive, role-based e-commerce platform built with React and Node.js for academic purposes. Electroland enables seamless interaction between customers, companies, managers, salesmans, and owners.

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Getting Started](#getting-started)
- [User Roles & Capabilities](#user-roles--capabilities)
- [API Documentation](#api-documentation)
- [DB Optimization](#db-optimization)
- [Redis Caching](#redis-caching)
- [Search Optimization](#search-optimization)
- [Testing](#testing)
- [Docker](#docker-containerization)
- [CI Pipeline](#continuous-integration)


## 🎯 Overview

Electroland is a multi-role e-commerce platform (academic project) that supports distinct workflows for different user types:

- **Customers**: Browse products, make purchases, file complaints, leave reviews
- **Companies**: Manage products, handle orders, analyze sales
- **Managers**: Oversee inventory, manage employees, handle orders
- **Owners**: Manage multiple branches, view analytics, control company operations
- **Salesman**: Track sales, manage inventory assignments

## ✨ Features

### Customer Features
- User authentication and profile management
- Browse products and categories
- View company information and branches
- Make purchases with order history
- Submit complaints and reviews
- Read company blogs

### Company Features
- Product management and display
- Order management and tracking
- Complaint handling
- Sales analytics dashboard
- Customer messaging system
- Blog posting capabilities

### Manager Features
- Employee management
- Inventory management and tracking
- Order management
- Sales monitoring
- Message handling
- Salary management

### Owner Features
- Multi-branch management
- Company analytics and insights
- Employee oversight
- Inventory control
- Product management
- Order and sales tracking
- Profit monitoring
- Salary administration

### Salesman Features
- Sales tracking and reporting
- Inventory visibility
- Sales analytics
- Salary information
- Employee details

## 🛠 Tech Stack

### Frontend
- **React** 19.1.1 - UI library
- **Vite** 7.1.7 - Build tool
- **Redux Toolkit** 2.11.0 - State management
- **React Router** 7.9.2 - Client routing
- **Axios** 1.12.2 - HTTP client
- **Chart.js** 4.5.1 - Data visualization
- **Socket.io Client** 4.8.1 - Real-time communication
- **JWT Decode** 2.2.0 - Token handling

### Backend
- **Node.js** - Runtime environment
- **Express** 5.1.0 - Web framework
- **MongoDB** with **Mongoose** 8.18.2 - Database
- **Redis** with **ioredis** 5.6.1 - Caching layer
- **JWT** 9.0.2 - Authentication
- **Socket.io** 4.8.1 - Real-time events
- **Multer** 2.0.2 - File uploads
- **Nodemailer** 7.0.11 - Email service
- **Swagger UI** 5.0.1 - API documentation
- **Jest** 29.7.0 - Unit testing framework

### DevOps
- **Docker** + **Docker Compose** - Containerization
- **GitHub Actions** - CI/CD Pipeline
- **Nginx** - Production web server

## 📁 Project Structure

```
Electroland/
├── .github/
│   └── workflows/
│       └── ci.yml                   # GitHub Actions CI pipeline
├── client/                          # Frontend React application
│   ├── src/
│   │   ├── pages/                  # Page components organized by user role
│   │   ├── components/             # Reusable components
│   │   ├── context/                # React Context (Auth)
│   │   ├── redux/                  # Redux store & slices
│   │   ├── api/                    # API service configuration
│   │   └── App.jsx                 # Main app component
│   ├── Dockerfile                  # Client container (multi-stage with Nginx)
│   ├── nginx.conf                  # Nginx SPA routing + API proxy
│   └── vite.config.js             # Vite configuration
│
├── server/                          # Backend Node.js application
│   ├── controllers/                # Business logic organized by role
│   │   ├── company/                # Company operations
│   │   ├── customer/               # Customer operations
│   │   ├── manager/                # Manager operations
│   │   ├── owner/                  # Owner operations
│   │   ├── salesman/               # Salesman operations
│   │   └── searchController.js     # Full-text search (MongoDB Text Index)
│   ├── models/                     # MongoDB schemas (with B-Tree & Compound indexes)
│   ├── routes/                     # API routes organized by role
│   ├── middleware/
│   │   ├── authMiddleware.js       # JWT auth + role-based access control
│   │   └── cacheMiddleware.js      # Redis cache layer + performance benchmarking
│   ├── config/
│   │   ├── db.js                   # MongoDB connection
│   │   ├── redis.js                # Redis client configuration
│   │   └── swagger.js              # OpenAPI 3.0 specification
│   ├── tests/                      # Unit tests (Jest + MongoDB Memory Server)
│   │   ├── setup.js                # Test environment setup
│   │   ├── auth.test.js            # Authentication tests
│   │   ├── products.test.js        # Product + search tests
│   │   ├── employees.test.js       # Employee CRUD tests
│   │   ├── sales.test.js           # Sales + orders tests
│   │   └── cache.test.js           # Redis caching tests
│   ├── Dockerfile                  # Server container
│   ├── jest.config.js              # Jest configuration
│   ├── server.js                   # Entry point
│   └── .env                        # Environment variables
│
├── docker-compose.yml               # Full-stack orchestration
├── .dockerignore                    # Docker build exclusions
├── .env.example                     # Environment template
├── REDIS_PERFORMANCE_REPORT.md      # Caching performance benchmarks
└── README.md                        # This file
```

## 📦 Prerequisites

- **Node.js** (v18 or higher)
- **npm** package manager
- **MongoDB** (local or cloud instance)
- **Redis** (local or cloud — optional, app works without it)
- **Docker** & **Docker Compose** (for containerized deployment)
- Git

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd Electroland
```

### 2. Install Server Dependencies

```bash
cd server
npm install
```

### 3. Configure Server Environment

Create a `.env` file in the server directory (see `.env.example`):

```env
NODE_ENV=development
PORT=5001
MONGO_URI=mongodb://localhost:27017/electroland
REDIS_URL=redis://localhost:6379
JWT_SECRET=your_jwt_secret_key
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxx
RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxx
```

### Razorpay Test Setup (Salesman Scanner Payment)

1. Create a Razorpay account and switch to **Test Mode**.
2. Open Razorpay Dashboard -> Settings -> API Keys.
3. Generate test keys and set them in server `.env` as:
	- `RAZORPAY_KEY_ID`
	- `RAZORPAY_KEY_SECRET`
4. Restart the server after updating environment variables.

Note: Scanner payment for salesman sale uses a fixed amount from `sold_price * quantity` and sale record is created only after successful payment confirmation.

### 4. Install Client Dependencies

```bash
cd ../client
npm install
```

## 🏃 Getting Started

### Start the Server

From the `server` directory:

```bash
npm start
```

The server will run on `http://localhost:5001` (or your configured PORT)

### Start the Client

From the `client` directory:

```bash
npm run dev
```

The client will run on `http://localhost:5173` (or next available port)

### Build for Production

**Client:**
```bash
npm run build
```

**Server:** Already production-ready with Node.js

## 👥 User Roles & Capabilities

### Customer
- Register and login
- Browse products across companies
- View company information
- Add items to cart and checkout
- Track order history
- File complaints
- Leave product reviews
- Read company blogs

### Company
- Register company account
- Manage product catalog
- Track incoming orders
- Respond to customer complaints
- View sales analytics
- Communicate with customers
- Post blogs and updates

### Manager
- Manage company employees
- Control inventory levels
- Process and track orders
- Monitor sales performance
- Send messages to team
- Manage employee salaries

### Owner
- Create and manage branches
- Monitor company-wide analytics
- Manage all employees
- Control global inventory
- View profit reports
- Manage all orders
- Handle salary administration

### Salesman
- Track personal sales
- View assigned inventory
- Access sales analytics
- Check salary information
- Communicate with management

## 🔌 API Documentation

The backend provides RESTful APIs (OpenAPI 3.0 / Swagger) organized by user role.

### Accessing Swagger UI

Start the server and visit:
```
http://localhost:5001/api-docs
```

### API Categories (B2B & B2C)

**B2C (Business-to-Customer) APIs:**
- Public Routes: Product browsing, branch locations, contact
- Customer Routes: Purchases, complaints, reviews, blogs

**B2B (Business-to-Business) APIs:**
- Company Routes: Product management, order handling, messaging
- Owner Routes: Branch, analytics, employee, salary management
- Manager Routes: Inventory, orders, sales, salary management
- Salesman Routes: Sales tracking, inventory view

### Key Endpoints

| Category | Base Path | Auth Required |
|----------|-----------|---------------|
| Auth | `/api/auth/*` | No |
| Public Products | `/api/ourproducts`, `/api/topproducts` | No |
| Search | `/api/search?q=<query>` | No |
| Performance Report | `/api/performance-report` | No |
| Owner Operations | `/api/owner/*` | Yes (Owner) |
| Manager Operations | `/api/manager/*` | Yes (Manager) |
| Company Operations | `/api/company/*` | Yes (Company) |
| Customer Operations | `/api/customer/*` | Yes (Customer) |
| Salesman Operations | `/api/salesman/*` | Yes (Salesman) |

For detailed API documentation, visit `/api-docs` or refer to `server/README_SWAGGER.md`.

## 🗄️ DB Optimization

### Indexing Strategy

All 12 Mongoose models have strategic **B-Tree** and **Compound indexes** for query optimization:

| Model | Index | Purpose |
|-------|-------|---------|
| Product | `{ Status: 1 }` | Filter accepted/rejected products |
| Product | `{ Com_id: 1, Status: 1 }` | Company product listings |
| Product | `{ Prod_name: 'text', prod_description: 'text', com_name: 'text' }` | Full-text search |
| Order | `{ ordered_date: 1 }` | Dashboard date-range queries |
| Order | `{ company_id: 1, status: 1 }` | Company order filtering |
| Sale | `{ sales_date: 1 }` | Date-range analytics |
| Sale | `{ branch_id: 1, sales_date: 1 }` | Branch sales reports |
| Sale | `{ salesman_id: 1, sales_date: 1 }` | Salesman performance |
| Employee | `{ role: 1, status: 1 }` | Active employee by role |
| Message | `{ to: 1, timestamp: -1 }` | Inbox sorted by time |

### Query Planning Optimization

The `TopProductsController` was refactored from an **N+1 query pattern** (individual `Sale.find()` per product) to a **single MongoDB aggregation pipeline** using `$group`, `$lookup`, and `$sort` — reducing response time from ~350ms to ~15ms.

## 🔴 Redis Caching

### Setup
```bash
# Install Redis locally (or use Docker)
docker run -d --name redis -p 6379:6379 redis:7-alpine

# Set in .env
REDIS_URL=redis://localhost:6379
```

### Cached Endpoints

| Endpoint | TTL | Improvement |
|----------|-----|-------------|
| `GET /api/ourproducts` | 5 min | ~97% faster |
| `GET /api/topproducts` | 10 min | ~99% faster |
| `GET /api/newproducts` | 5 min | ~97% faster |
| `GET /api/search` | 2 min | ~97% faster |

### Verifying Cache

```bash
# Check X-Cache header
curl -v http://localhost:5001/api/ourproducts
# X-Cache: MISS (first request)
# X-Cache: HIT  (subsequent requests)

# View performance report
curl http://localhost:5001/api/performance-report
```

See full report: [REDIS_PERFORMANCE_REPORT.md](REDIS_PERFORMANCE_REPORT.md)

## 🔍 Search Optimization

MongoDB Text Search provides a **Solr-like** full-text search experience:

```bash
# Full-text search
GET /api/search?q=Samsung&page=1&limit=10

# Autocomplete
GET /api/search/autocomplete?q=Sam
```

Uses MongoDB text indexes across `Prod_name`, `prod_description`, and `com_name` with relevance scoring.

## 🧪 Testing

### Running Tests

```bash
cd server

# Run all tests
npm test

# Run with coverage report
npm run test:coverage

# Generate HTML test report
npm run test:report
```

### Test Suites

| File | Tests | Coverage |
|------|-------|----------|
| `auth.test.js` | Signup, Login, edge cases (11 tests) | Auth controller |
| `products.test.js` | Listing, aggregation, search (9 tests) | Product + Search controllers |
| `employees.test.js` | CRUD, validation, status (9 tests) | Employee model |
| `sales.test.js` | Creation, analytics, orders (10 tests) | Sale + Order models |
| `cache.test.js` | HIT/MISS, bypass, error handling (8 tests) | Cache middleware |

### Test Reports

- **Console**: `npm test`
- **Coverage HTML**: `npm run test:coverage` → `server/coverage/index.html`
- **HTML Report**: `npm run test:report` → generates `jest_html_reporters.html`

## 🐳 Docker Containerization

### Quick Start with Docker

```bash
# Build and run everything
docker-compose up --build

# Access the application
# Frontend: http://localhost:80
# Backend:  http://localhost:5001
# API Docs: http://localhost:5001/api-docs
```

### Services

| Service | Image | Port | Description |
|---------|-------|------|-------------|
| `mongodb` | mongo:7 | 27017 | Database |
| `redis` | redis:7-alpine | 6379 | Cache |
| `server` | Custom (Node 20) | 5001 | Backend API |
| `client` | Custom (Nginx) | 80 | Frontend |

### Individual Builds

```bash
# Build server only
docker build -t electroland-server ./server

# Build client only
docker build -t electroland-client ./client
```

## 🔄 Continuous Integration

### GitHub Actions Pipeline

Located at `.github/workflows/ci.yml`, the CI pipeline runs on every push/PR to `main`:

```
Push to main → Install → Test → Coverage → Docker Build → ✅
```

### Pipeline Jobs

1. **Test Job**: Runs Jest tests with MongoDB + Redis services, uploads coverage artifacts
2. **Docker Job**: Verifies Docker Compose builds and containers start successfully

### CI Badge

Add to your repo:
```markdown
![CI](https://github.com/<your-username>/FDFED_React/actions/workflows/ci.yml/badge.svg)
```

---

**Last Updated:** April 2026

---

Thank you for exploring Electroland!
