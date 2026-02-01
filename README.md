
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
- **JWT** 9.0.2 - Authentication
- **Socket.io** 4.8.1 - Real-time events
- **Multer** 2.0.2 - File uploads
- **Nodemailer** 7.0.11 - Email service
- **OTP Generator** 4.0.1 - One-time passwords
- **CORS** 2.8.5 - Cross-origin requests

## 📁 Project Structure

```
Electroland/
├── client/                          # Frontend React application
│   ├── src/
│   │   ├── pages/                  # Page components organized by user role
│   │   │   ├── company/            # Company dashboard pages
│   │   │   ├── customer/           # Customer pages
│   │   │   ├── manager/            # Manager pages
│   │   │   ├── owner/              # Owner pages
│   │   │   ├── salesman/           # Salesman pages
│   │   │   └── *.jsx               # Public pages (Login, Home, etc.)
│   │   ├── components/             # Reusable components
│   │   │   ├── auth/               # Authentication components
│   │   │   └── layout/             # Layout components
│   │   ├── context/                # React Context (Auth)
│   │   ├── redux/                  # Redux store & slices
│   │   ├── api/                    # API service configuration
│   │   └── App.jsx                 # Main app component
│   ├── public/                     # Static assets
│   │   └── uploads/                # User uploads directory
│   └── vite.config.js             # Vite configuration
│
├── server/                          # Backend Node.js application
│   ├── controllers/                # Business logic organized by role
│   │   ├── company/                # Company operations
│   │   ├── customer/               # Customer operations
│   │   ├── manager/                # Manager operations
│   │   ├── owner/                  # Owner operations
│   │   ├── salesman/               # Salesman operations
│   │   └── *.js                    # Public operations
│   ├── models/                     # MongoDB schemas
│   ├── routes/                     # API routes organized by role
│   │   ├── Customer/               # Customer routes
│   │   ├── manager/                # Manager routes
│   │   ├── owner/                  # Owner routes
│   │   ├── salesman/               # Salesman routes
│   │   └── *.js                    # Public routes
│   ├── middleware/                 # Express middleware
│   ├── config/                     # Database configuration
│   ├── server.js                   # Entry point
│   └── .env                        # Environment variables
│
└── README.md                        # This file
```

## 📦 Prerequisites

- **Node.js** (v14 or higher)
- **npm** or **yarn** package manager
- **MongoDB** (local or cloud instance)
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

Create a `.env` file in the server directory with the following variables:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/electroland
JWT_SECRET=your_jwt_secret_key
NODEMAILER_USER=your_email@gmail.com
NODEMAILER_PASSWORD=your_app_password
CORS_ORIGIN=http://localhost:5173
```

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

The server will run on `http://localhost:5000` (or your configured PORT)

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

The backend provides RESTful APIs organized by user role:

- **Public Routes**: Authentication, product browsing, contact
- **Customer Routes**: Purchases, complaints, reviews
- **Company Routes**: Product management, order handling
- **Manager Routes**: Employee, inventory, salary management
- **Owner Routes**: Branch, analytics, global management
- **Salesman Routes**: Sales tracking, inventory view


For detailed API documentation, refer to the route files in `server/routes/`


**Last Updated:** February 2026

---

Thank you for exploring Electroland!

