const express = require("express");
const router = express.Router();
const Employee = require("../../models/employees");
const Branch = require("../../models/branches");
const Sale = require("../../models/sale");
const Order = require("../../models/orders");
const Product = require("../../models/products");
const Company = require("../../models/company");
const User = require('../../models/User');
const { protect, authorize } = require('../../middleware/authMiddleware');

// ---------------------------------------------------------------------------
// Helper: Resolve the logged-in manager → their active branch
// ---------------------------------------------------------------------------
const getManagerAuth = async (userId) => {
    const userDoc = await User.findOne({ userId });
    if (!userDoc || !userDoc.emp_id) throw new Error("Manager profile not found");

    const employee = await Employee.findOne({ e_id: userDoc.emp_id, status: "active" });
    if (!employee || employee.role !== "manager")
        throw new Error("Access denied or employee not active/manager role");

    const branch = await Branch.findOne({ bid: employee.bid, active: "active" });
    if (!branch) throw new Error("No active branch assigned to this manager");

    return { employee, branch };
};

// ---------------------------------------------------------------------------
// Helper: Net profit for a branch over a date range
// ---------------------------------------------------------------------------
async function calculateProfit(branchId, startDate, endDate) {
    const sales = await Sale.find({
        branch_id: branchId,
        sales_date: { $gte: startDate, $lt: endDate }
    }).lean();

    let totalSalesRevenue = 0;
    let totalCostPrice = 0;
    let totalSalesmanComm = 0;
    let totalManagerComm = 0;

    sales.forEach(sale => {
        totalSalesRevenue += (sale.sold_price * sale.quantity);
        totalCostPrice    += (sale.purchased_price * sale.quantity);
        totalSalesmanComm += (sale.sold_price * sale.quantity * 0.02);
        totalManagerComm  += (sale.sold_price * sale.quantity * 0.01);
    });

    const grossProfit = totalSalesRevenue - totalCostPrice;

    const employees = await Employee.find({
        bid: branchId,
        status: "active",
        role: { $in: ["manager", "salesman", "Sales Manager", "Salesman"] },
        hiredAt: { $lte: endDate }
    }).lean();

    const totalSalaries  = employees.reduce((sum, emp) => sum + (emp.base_salary || 0), 0);
    const totalExpenses  = totalSalaries + totalSalesmanComm + totalManagerComm;
    return grossProfit - totalExpenses;
}

// ---------------------------------------------------------------------------
// [LEGACY] GET /dashboard-data  — kept for backward compatibility
// ---------------------------------------------------------------------------
const getDashboardData = async (req, res) => {
    try {
        const { branch } = await getManagerAuth(req.user.id);
        const branchId = branch.bid;

        const now = new Date();
        const currentYear  = now.getUTCFullYear();
        const currentMonth = now.getUTCMonth();
        const monthNames   = ["January","February","March","April","May","June","July","August","September","October","November","December"];

        const prevMonthCalcStart = new Date(Date.UTC(currentYear, currentMonth - 1, 1));
        const prevMonthCalcEnd   = new Date(Date.UTC(currentYear, currentMonth, 1));
        const previousMonthName  = monthNames[currentMonth - 1];

        const previousMonthProfit = await calculateProfit(branchId, prevMonthCalcStart, prevMonthCalcEnd);
        const cumulativeProfit    = await calculateProfit(branchId, new Date(0), prevMonthCalcEnd);

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
            previousMonthName,
            months,
        });
    } catch (error) {
        console.error('[ManagerAnalytics] getDashboardData error:', error.message);
        res.status(403).json({
            success: false,
            message: error.message || "Failed to load dashboard data.",
            cumulativeProfit: null, previousMonthProfit: null,
            branchName: "N/A", previousMonthName: "", months: []
        });
    }
};

// ---------------------------------------------------------------------------
// [LEGACY] GET /profit-by-month?month=YYYY-MM — kept for backward compatibility
// ---------------------------------------------------------------------------
const getProfitByMonth = async (req, res) => {
    try {
        const { branch } = await getManagerAuth(req.user.id);
        const monthKey = req.query.month;
        if (!monthKey) return res.status(400).json({ error: "Month parameter is required." });

        const [year, month] = monthKey.split('-').map(Number);
        const startDate = new Date(Date.UTC(year, month - 1, 1));
        const endDate   = new Date(Date.UTC(year, month, 1));

        const monthlyProfit = await calculateProfit(branch.bid, startDate, endDate);
        res.json({ success: true, profit: monthlyProfit.toFixed(2) });
    } catch (error) {
        console.error('[ManagerAnalytics] getProfitByMonth error:', error.message);
        res.status(500).json({ success: false, error: error.message });
    }
};

// ---------------------------------------------------------------------------
// NEW  GET /overview
// @desc  Last-30-days branch performance: orders, sales counts per day,
//        and daily profit/loss totals (same shape as owner overview but
//        scoped to this manager's branch).
// ---------------------------------------------------------------------------
const getOverview = async (req, res) => {
    try {
        const { branch } = await getManagerAuth(req.user.id);
        const branchId = branch.bid;

        const endDate = new Date();
        endDate.setHours(23, 59, 59, 999);
        const startDate = new Date();
        startDate.setDate(endDate.getDate() - 29);
        startDate.setHours(0, 0, 0, 0);

        const [orders, sales] = await Promise.all([
            Order.find({ branch_id: branchId, ordered_date: { $gte: startDate, $lte: endDate } }).lean(),
            Sale.find({ branch_id: branchId, sales_date: { $gte: startDate, $lte: endDate } }).lean(),
        ]);

        const days = [], orderCounts = [], saleCounts = [], profitLossTotals = [];

        for (let i = 0; i < 30; i++) {
            const cur = new Date(startDate);
            cur.setDate(startDate.getDate() + i);

            days.push(cur.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));

            const same = (d, ref) =>
                d.getDate() === ref.getDate() &&
                d.getMonth() === ref.getMonth() &&
                d.getFullYear() === ref.getFullYear();

            const dailyOrders = orders.filter(o => same(new Date(o.ordered_date), cur));
            const dailySales  = sales.filter(s => same(new Date(s.sales_date), cur));

            orderCounts.push(dailyOrders.length);
            saleCounts.push(dailySales.length);
            profitLossTotals.push(
                dailySales.reduce((sum, s) => sum + (s.profit_or_loss || 0), 0)
            );
        }

        res.json({
            success: true,
            data: {
                branchName: branch.b_name,
                days, orderCounts, saleCounts, profitLossTotals,
                title: "Last 30 Days — Branch Performance",
            }
        });
    } catch (error) {
        console.error('[ManagerAnalytics] getOverview error:', error.message);
        res.status(500).json({ success: false, message: error.message });
    }
};

// ---------------------------------------------------------------------------
// NEW  GET /salesman-performance?month=YYYY-MM
// @desc  Performance of all salesmen in this manager's branch.
//        No branch filter — always scoped to the logged-in manager's branch.
//        Returns: { products, performance, availableMonths }
// ---------------------------------------------------------------------------
const getSalesmanPerformance = async (req, res) => {
    try {
        const { branch } = await getManagerAuth(req.user.id);
        const branchId = branch.bid;
        const { month } = req.query;

        // Build date range
        let startDate, endDate;
        if (month && /^\d{4}-\d{2}$/.test(month)) {
            const [year, mon] = month.split('-').map(Number);
            startDate = new Date(year, mon - 1, 1, 0, 0, 0, 0);
            endDate   = new Date(year, mon,     0, 23, 59, 59, 999);
        } else {
            const now = new Date();
            startDate = new Date(now.getFullYear(), now.getMonth(),     1, 0, 0, 0, 0);
            endDate   = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
        }

        const [salesmen, monthSales, products, allSaleDates] = await Promise.all([
            Employee.find({ bid: branchId, role: 'salesman', status: 'active' }).lean(),
            Sale.find({ branch_id: branchId, sales_date: { $gte: startDate, $lte: endDate } }).lean(),
            Product.find({ Status: 'Accepted' }).lean(),
            Sale.find({ branch_id: branchId }, { sales_date: 1, _id: 0 }).lean(),
        ]);

        // Build availableMonths from all branch sales
        const monthSet = new Set();
        allSaleDates.forEach(s => {
            const d = new Date(s.sales_date);
            monthSet.add(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
        });
        const availableMonths = [...monthSet].sort().reverse();

        // Products that appear in this month's sales
        const productNames = [
            'All',
            ...[...new Set(
                monthSales
                    .map(s => { const p = products.find(pr => pr.prod_id === s.product_id); return p ? p.Prod_name : null; })
                    .filter(Boolean)
            )].sort(),
        ];

        // performance[productFilter] = [{ name, units, sales }]
        const performance = {};

        // 'All' products
        performance['All'] = salesmen
            .map(emp => {
                const empSales = monthSales.filter(s => s.salesman_id === emp.e_id);
                const units = empSales.reduce((sum, s) => sum + (s.quantity || 1), 0);
                return { name: `${emp.f_name} ${emp.last_name}`, units, sales: empSales.length };
            })
            .filter(e => e.units > 0 || e.sales > 0)
            .sort((a, b) => b.units - a.units);

        // Per-product
        for (const prodName of productNames.slice(1)) {
            const prodEntry = products.find(p => p.Prod_name === prodName);
            if (!prodEntry) continue;
            performance[prodName] = salesmen
                .map(emp => {
                    const rel = monthSales.filter(s => s.salesman_id === emp.e_id && s.product_id === prodEntry.prod_id);
                    const units = rel.reduce((sum, s) => sum + (s.quantity || 1), 0);
                    return { name: `${emp.f_name} ${emp.last_name}`, units, sales: rel.length };
                })
                .filter(e => e.units > 0 || e.sales > 0)
                .sort((a, b) => b.units - a.units);
        }

        res.json({
            success: true,
            data: { branchName: branch.b_name, products: productNames, performance, availableMonths }
        });
    } catch (error) {
        console.error('[ManagerAnalytics] getSalesmanPerformance error:', error.message);
        res.status(500).json({ success: false, message: error.message });
    }
};

// ---------------------------------------------------------------------------
// NEW  GET /company-sales?month=YYYY-MM
// @desc  Sales grouped by company, scoped to this manager's branch.
//        Returns: { companies, companySales, availableMonths }
// ---------------------------------------------------------------------------
const getCompanySales = async (req, res) => {
    try {
        const { branch } = await getManagerAuth(req.user.id);
        const branchId = branch.bid;
        const { month } = req.query;

        const [companies, allSales] = await Promise.all([
            Company.find({ active: 'active' }).lean(),
            Sale.find({ branch_id: branchId }, { sales_date: 1, company_id: 1, quantity: 1, _id: 0 }).lean(),
        ]);

        // availableMonths from this branch's sales
        const monthSet = new Set();
        allSales.forEach(s => {
            if (s.sales_date) {
                const d = new Date(s.sales_date);
                if (!isNaN(d)) monthSet.add(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
            }
        });
        const availableMonths = [...monthSet].sort().reverse();

        // Filter by month
        let filteredSales = allSales;
        if (month) {
            const [y, m] = month.split('-').map(Number);
            const start = new Date(y, m - 1, 1);
            const end   = new Date(y, m, 1);
            filteredSales = allSales.filter(s => {
                if (!s.sales_date) return false;
                const d = new Date(s.sales_date);
                return d >= start && d < end;
            });
        }

        const companyNames = [];
        const companySales = {};
        for (const company of companies) {
            const cSales = filteredSales.filter(s => s.company_id === company.c_id);
            companyNames.push(company.cname);
            companySales[company.cname] = {
                totalUnits: cSales.reduce((sum, s) => sum + (s.quantity || 1), 0),
                totalSales: cSales.length,
            };
        }

        res.json({
            success: true,
            data: { companies: companyNames, companySales, availableMonths }
        });
    } catch (error) {
        console.error('[ManagerAnalytics] getCompanySales error:', error.message);
        res.status(500).json({ success: false, message: error.message });
    }
};

// ---------------------------------------------------------------------------
// NEW  GET /product-sales?month=YYYY-MM&company=CompanyName
// @desc  Sales grouped by product, scoped to this manager's branch.
//        Optional company filter narrows the x-axis to products from that company.
//        Returns: { companies, productSales, availableMonths }
// ---------------------------------------------------------------------------
const getProductSales = async (req, res) => {
    try {
        const { branch } = await getManagerAuth(req.user.id);
        const branchId = branch.bid;
        const { month, company } = req.query;

        const [companies, products, allSales] = await Promise.all([
            Company.find({ active: 'active' }).lean(),
            Product.find({ Status: 'Accepted' }).lean(),
            Sale.find({ branch_id: branchId }, { sales_date: 1, company_id: 1, product_id: 1, quantity: 1, _id: 0 }).lean(),
        ]);

        // availableMonths
        const monthSet = new Set();
        allSales.forEach(s => {
            if (s.sales_date) {
                const d = new Date(s.sales_date);
                if (!isNaN(d)) monthSet.add(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
            }
        });
        const availableMonths = [...monthSet].sort().reverse();

        // Filter by month
        let filteredSales = allSales;
        if (month) {
            const [y, m] = month.split('-').map(Number);
            const start = new Date(y, m - 1, 1);
            const end   = new Date(y, m, 1);
            filteredSales = allSales.filter(s => {
                if (!s.sales_date) return false;
                const d = new Date(s.sales_date);
                return d >= start && d < end;
            });
        }

        // Filter by company
        if (company && company !== 'All') {
            const companyDoc = companies.find(c => c.cname === company);
            if (companyDoc) filteredSales = filteredSales.filter(s => s.company_id === companyDoc.c_id);
        }

        const productSales = {};
        for (const product of products) {
            const pSales = filteredSales.filter(s => s.product_id === product.prod_id);
            if (pSales.length > 0) {
                productSales[product.Prod_name] = {
                    totalUnits: pSales.reduce((sum, s) => sum + (s.quantity || 1), 0),
                    totalSales: pSales.length,
                };
            }
        }

        const companyNames = ['All', ...companies.map(c => c.cname)];

        res.json({
            success: true,
            data: { companies: companyNames, productSales, availableMonths }
        });
    } catch (error) {
        console.error('[ManagerAnalytics] getProductSales error:', error.message);
        res.status(500).json({ success: false, message: error.message });
    }
};

// ---------------------------------------------------------------------------
// Route definitions
// ---------------------------------------------------------------------------
router.use(protect, authorize('manager'));

// Legacy routes (kept for backward compatibility)
router.get('/dashboard-data',    getDashboardData);
router.get('/profit-by-month',   getProfitByMonth);

// New analytics routes
router.get('/overview',              getOverview);
router.get('/salesman-performance',  getSalesmanPerformance);
router.get('/company-sales',         getCompanySales);
router.get('/product-sales',         getProductSales);

module.exports = router;