// path: server/routes/manager/ManagerAnalyticsControllerRoutes.js
const express = require("express");
const router = express.Router();
const Employee = require("../../models/employees"); // Model for employees 
const Branch = require("../../models/branches"); // Model for branches 
const Sale = require("../../models/sale"); // Model for sales 
const Product = require("../../models/products"); // Model for products 
const Order = require("../../models/orders"); // Model for orders 
const { protect, authorize } = require('../../middleware/authMiddleware'); // Assuming middleware path
const User = require('../../models/User'); // Assuming User model for finding emp_id

// --- Helper Functions (From original salesmanager.js) ---

// Helper to get Manager and Branch for authorization
const getManagerAuth = async (userId) => {
    // Find the User document using the session userId (req.user.id)
    const userDoc = await User.findOne({ userId });
    if (!userDoc || !userDoc.emp_id) {
        throw new Error("Manager profile not found");
    }

    // Find the Employee document using the emp_id from the user document
    const employee = await Employee.findOne({ e_id: userDoc.emp_id, status: "active" });
    if (!employee || employee.role !== "manager") {
        throw new Error("Access denied or employee not active/manager role");
    }

    // Find the Branch assigned to this manager (using the employee's bid)
    const branch = await Branch.findOne({ bid: employee.bid, active: "active" });
    if (!branch) {
        throw new Error("No active branch assigned to this manager");
    }
    
    return { employee, branch };
};

// Helper function to calculate profit (extracted from salesmanager.js) 
async function calculateProfit(sales, branchId, startDate) {
    let totalSalesAmount = 0;
    let totalRetailCost = 0;
    let totalOrderPurchaseCost = 0;

    for (const sale of sales) {
        totalSalesAmount += sale.sold_price * sale.quantity;
        const product = await Product.findOne({ prod_id: sale.product_id });
        if (product && product.Retail_price != null) {
            totalRetailCost += sale.quantity * parseFloat(product.Retail_price);
        }
    }

    const orders = await Order.find({
        branch_id: branchId,
        status: "accepted",
        ordered_date: { $gte: startDate } // Use ordered_date for orders 
    });

    for (const order of orders) {
        const product = await Product.findOne({ prod_id: order.product_id });
        if (product && product.Purchase_price != null) {
            totalOrderPurchaseCost += order.quantity * parseFloat(product.Purchase_price);
        }
    }

    // Calculate Salaries: Only include salaries from startDate onwards
    const salesmen = await Employee.find({
        bid: branchId,
        role: "salesman",
        status: "active"
    });
    const totalSalesmenSalaries = salesmen.reduce((sum, salesman) => {
        // Only include salary if hired before or on the start date of the period
        if (salesman.hiredAt && salesman.hiredAt > startDate) {
            return sum;
        }
        return sum + (salesman.base_salary || 0);
    }, 0);

    const branch = await Branch.findOne({ bid: branchId, active: "active" });
    let salesManagerSalary = 0;
    if (branch && branch.manager_id) {
        const salesManager = await Employee.findOne({ _id: branch.manager_id, status: "active" });
        if (salesManager && (!salesManager.hiredAt || salesManager.hiredAt <= startDate)) {
            salesManagerSalary = salesManager.base_salary || 0;
        }
    }

    // Profit = Total Sales - (Retail Cost + Order Purchase Cost + Total Salaries)
    const profit = totalSalesAmount - (totalRetailCost + totalOrderPurchaseCost + totalSalesmenSalaries + salesManagerSalary);
    return profit;
}

// --- Controller Logic (getDashboardData) ---

// @desc    Get Manager Dashboard Data (Cumulative, Previous Month Profit)
// @route   GET /api/manager/analytics/dashboard-data
// @access  Private (Manager)
const getDashboardData = async (req, res) => {
    try {
        const { branch } = await getManagerAuth(req.user.id);
        const branchId = branch.bid;

        const now = new Date();
        const currentYear = now.getUTCFullYear();
        const currentMonth = now.getUTCMonth();

        // 1. Calculate Previous Month Dates
        const previousMonthStart = new Date(Date.UTC(currentYear, currentMonth - 1, 1));
        const previousMonthEnd = new Date(Date.UTC(currentYear, currentMonth, 0));
        const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        const previousMonthName = monthNames[previousMonthStart.getUTCMonth()];

        // 2. Fetch Sales for Previous Month
        const previousMonthSales = await Sale.find({
            branch_id: branchId,
            sales_date: { $gte: previousMonthStart, $lte: previousMonthEnd }
        });

        // 3. Fetch Cumulative Sales (up to end of previous month)
        const cumulativeSales = await Sale.find({
            branch_id: branchId,
            sales_date: { $lte: previousMonthEnd }
        });

        // 4. Calculate Profits
        const previousMonthProfit = await calculateProfit(previousMonthSales, branchId, previousMonthStart);
        // Cumulative profit considers everything from the start of time (Date(0))
        const cumulativeProfit = await calculateProfit(cumulativeSales, branchId, new Date(0));

        // 5. Generate month list for dropdown (last 7 months including previous month)
        const months = [];
        for (let i = 7; i >= 1; i--) {
            const date = new Date(Date.UTC(currentYear, currentMonth - i, 1));
            months.push({
                year: date.getUTCFullYear(),
                month: date.getUTCMonth() + 1,
                name: `${monthNames[date.getUTCMonth()]} ${date.getUTCFullYear()}`,
                key: `${date.getUTCFullYear()}-${date.getUTCMonth() + 1}`
            });
        }

        res.json({
            success: true,
            cumulativeProfit: cumulativeProfit.toFixed(2),
            previousMonthProfit: previousMonthProfit.toFixed(2),
            branchName: branch.b_name,
            previousMonthName: previousMonthName,
            months: months,
        });

    } catch (error) {
        console.error('[Error] Failed to fetch salesmanager home data:', error);
        res.status(403).json({ 
            success: false, 
            message: error.message || "Failed to load dashboard data.",
            cumulativeProfit: null,
            previousMonthProfit: null,
            branchName: "N/A",
            previousMonthName: "",
            months: []
        });
    }
};

// @desc    Get Monthly Profit
// @route   GET /api/manager/analytics/profit-by-month?month=YYYY-MM
// @access  Private (Manager)
const getProfitByMonth = async (req, res) => {
    try {
        const { branch } = await getManagerAuth(req.user.id);
        const branchId = branch.bid;
        const monthKey = req.query.month; // e.g., "2024-10"

        if (!monthKey) {
            return res.status(400).json({ error: "Month parameter is required." });
        }

        const [year, month] = monthKey.split('-').map(Number);

        // Get start date of the requested month
        const monthStart = new Date(Date.UTC(year, month - 1, 1));
        // Get end date of the requested month
        const monthEnd = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999)); 

        // Fetch sales for the requested month
        const monthlySales = await Sale.find({
            branch_id: branchId,
            sales_date: { $gte: monthStart, $lte: monthEnd }
        });

        const monthlyProfit = await calculateProfit(monthlySales, branchId, monthStart);

        res.json({
            success: true,
            profit: monthlyProfit.toFixed(2)
        });

    } catch (error) {
        console.error('[Error] Failed to fetch monthly profit:', error);
        res.status(500).json({ success: false, error: error.message || "Error fetching profit data" });
    }
};


// --- Route Definition ---
// Apply protection and authorization middleware
router.use(protect, authorize('manager'));

// Routes:
// 1. Main Dashboard Data
router.route('/dashboard-data')
    .get(getDashboardData);

// 2. Profit by Month
router.route('/profit-by-month')
    .get(getProfitByMonth);

module.exports = router;