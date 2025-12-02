const express = require("express");
const router = express.Router();
const Employee = require("../../models/employees"); 
const Branch = require("../../models/branches"); 
const Sale = require("../../models/sale"); 
const User = require('../../models/User'); 
const { protect, authorize } = require('../../middleware/authMiddleware'); 

// --- Helper Functions ---

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

async function calculateProfit(branchId, startDate, endDate) {
    // 1. Fetch Sales for this branch in date range
    const sales = await Sale.find({
        branch_id: branchId,
        sales_date: { $gte: startDate, $lt: endDate }
    }).lean();

    let totalSalesRevenue = 0;
    let totalCostPrice = 0;
    let totalSalesmanComm = 0;
    let totalManagerComm = 0;

    // 2. Calculate Revenue & Commissions
    sales.forEach(sale => {
        totalSalesRevenue += (sale.sold_price * sale.quantity);
        totalCostPrice += (sale.purchased_price * sale.quantity);
        
        // Logic from ProfitController: 
        // 2% for Salesman, 1% for Manager based on Sold Price
        totalSalesmanComm += (sale.sold_price * sale.quantity * 0.02);
        totalManagerComm += (sale.sold_price * sale.quantity * 0.01);
    });

    const grossProfit = totalSalesRevenue - totalCostPrice;

    // 3. Calculate Salaries
    // Fetch active employees (Manager/Salesman) hired before end of this period
    // Matches ProfitController logic exactly
    const employees = await Employee.find({
        bid: branchId,
        status: "active",
        role: { $in: ["manager", "salesman", "Sales Manager", "Salesman"] },
        hiredAt: { $lte: endDate }
    }).lean();

    const totalSalaries = employees.reduce((sum, emp) => sum + (emp.base_salary || 0), 0);

    // 4. Net Profit Calculation
    const totalExpenses = totalSalaries + totalSalesmanComm + totalManagerComm;
    const netProfit = grossProfit - totalExpenses;

    return netProfit;
}


const getDashboardData = async (req, res) => {
    try {
        const { branch } = await getManagerAuth(req.user.id);
        const branchId = branch.bid;

        const now = new Date();
        const currentYear = now.getUTCFullYear();
        const currentMonth = now.getUTCMonth();
        const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

        // 1. Calculate Previous Month Dates
        const previousMonthStart = new Date(Date.UTC(currentYear, currentMonth - 1, 1));
        const previousMonthEnd = new Date(Date.UTC(currentYear, currentMonth, 0)); // Last day of prev month
        const previousMonthName = monthNames[previousMonthStart.getUTCMonth()];

        // 2. Calculate Profits using the new helper
        // Previous Month Profit
        // We pass 'previousMonthEnd' as the cutoff for salaries/sales
        // Note: For 'end date' in logic $lt, we might need the first day of next month to include the last day fully, 
        // or ensure previousMonthEnd includes time. 
        // ProfitController uses $lt endDate. 
        // So for "Jan", we want $gte Jan 1 and $lt Feb 1.
        
        // Adjusting dates to match ProfitController expectation (Start of month to Start of next month)
        const prevMonthCalcStart = new Date(Date.UTC(currentYear, currentMonth - 1, 1));
        const prevMonthCalcEnd = new Date(Date.UTC(currentYear, currentMonth, 1)); // 1st of current month

        const previousMonthProfit = await calculateProfit(branchId, prevMonthCalcStart, prevMonthCalcEnd);

        // Cumulative Profit (Start of time -> Start of current month)
        // This covers everything up to the end of the previous month
        const cumulativeProfit = await calculateProfit(branchId, new Date(0), prevMonthCalcEnd);

        // 3. Generate month list for dropdown (last 7 months)
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

        // Calculate Start and End dates for the helper
        // Start: 1st of the requested month
        const startDate = new Date(Date.UTC(year, month - 1, 1));
        // End: 1st of the NEXT month (so $lt covers the full requested month)
        const endDate = new Date(Date.UTC(year, month, 1)); 

        const monthlyProfit = await calculateProfit(branchId, startDate, endDate);

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
router.use(protect, authorize('manager'));

router.route('/dashboard-data')
    .get(getDashboardData);

router.route('/profit-by-month')
    .get(getProfitByMonth);

module.exports = router;