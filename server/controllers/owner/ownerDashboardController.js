const Order = require("../../models/orders");
const Sale = require("../../models/sale");
const Branch = require("../../models/branches");
const Employee = require("../../models/employees");
const Product = require("../../models/products");

// @desc    Get Owner Dashboard Data (Last 30 Days)
// @route   GET /api/owner/analytics/data
// @access  Private (Owner)
exports.getOwnerDashboardData = async (req, res) => {
  try {
    // 1. Calculate Date Range (Last 30 Days)
    const endDate = new Date();
    endDate.setHours(23, 59, 59, 999); // End of today

    const startDate = new Date();
    startDate.setDate(endDate.getDate() - 29); // Go back 29 days (total 30 days)
    startDate.setHours(0, 0, 0, 0); // Start of that day

    // 2. Fetch Orders and Sales in this range
    const [orders, sales] = await Promise.all([
      Order.find({ ordered_date: { $gte: startDate, $lte: endDate } }).lean(),
      Sale.find({ sales_date: { $gte: startDate, $lte: endDate } }).lean()
    ]);

    // 3. Process data for charts
    const days = [];
    const orderCounts = [];
    const saleCounts = [];
    const profitLossTotals = [];

    // Loop through each of the last 30 days
    for (let i = 0; i < 30; i++) {
      // Create a date object for the current iteration
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + i);

      // Format label (e.g., "Oct 14")
      const dayLabel = currentDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      days.push(dayLabel);

      // Filter Orders for this specific date
      const dailyOrders = orders.filter(order => {
        const orderDate = new Date(order.ordered_date);
        return (
          orderDate.getDate() === currentDate.getDate() &&
          orderDate.getMonth() === currentDate.getMonth() &&
          orderDate.getFullYear() === currentDate.getFullYear()
        );
      });
      orderCounts.push(dailyOrders.length);

      // Filter Sales for this specific date
      const dailySales = sales.filter(sale => {
        const saleDate = new Date(sale.sales_date);
        return (
          saleDate.getDate() === currentDate.getDate() &&
          saleDate.getMonth() === currentDate.getMonth() &&
          saleDate.getFullYear() === currentDate.getFullYear()
        );
      });
      saleCounts.push(dailySales.length);

      // Calculate Daily Profit/Loss
      const dailyProfit = dailySales.reduce((sum, sale) => sum + (sale.profit_or_loss || 0), 0);
      profitLossTotals.push(dailyProfit);
    }

    res.json({
      success: true,
      data: {
        days,
        orderCounts,
        saleCounts,
        profitLossTotals,
        title: "Last 30 Days Performance"
      }
    });

  } catch (error) {
    console.error("[OwnerDashboard] Error:", error.message);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// @desc    Get Salesman Performance Data (optionally filtered by month)
// @route   GET /api/owner/analytics/salesman-performance?month=YYYY-MM
// @access  Private (Owner)
// Note: Only employees with role 'salesman' are included.
//       Employees with role 'manager' are intentionally excluded.
exports.getSalesmanPerformance = async (req, res) => {
  try {
    const { month } = req.query; // e.g. "2026-02"

    // Build date range for the requested month (defaults to current month)
    let startDate, endDate;
    if (month && /^\d{4}-\d{2}$/.test(month)) {
      const [year, mon] = month.split('-').map(Number);
      startDate = new Date(year, mon - 1, 1, 0, 0, 0, 0);
      endDate   = new Date(year, mon,     0, 23, 59, 59, 999); // last day of month
    } else {
      const now = new Date();
      startDate = new Date(now.getFullYear(), now.getMonth(),     1, 0, 0, 0, 0);
      endDate   = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    }

    // Fetch in parallel: branches, active salesmen, month-filtered sales, accepted products,
    // and all sale dates (for building the available-months dropdown)
    const [branches, salesmen, monthSales, products, allSaleDates] = await Promise.all([
      Branch.find().lean(),
      Employee.find({ role: 'salesman', status: 'active' }).lean(),
      Sale.find({ sales_date: { $gte: startDate, $lte: endDate } }).lean(),
      Product.find({ Status: 'Accepted' }).lean(),
      Sale.find({}, { sales_date: 1, _id: 0 }).lean(),
    ]);

    // Derive the list of months that have at least one sale record
    const monthSet = new Set();
    allSaleDates.forEach((s) => {
      const d = new Date(s.sales_date);
      monthSet.add(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
    });
    // Most-recent month first
    const availableMonths = [...monthSet].sort().reverse();

    const branchNames = branches.map((b) => b.b_name);

    // Build unique sorted list of product names that appear in this month's sales
    const productNames = [
      'All',
      ...[
        ...new Set(
          monthSales
            .map((s) => {
              const prod = products.find((p) => p.prod_id === s.product_id);
              return prod ? prod.Prod_name : null;
            })
            .filter(Boolean)
        ),
      ].sort(),
    ];

    // 2. Build performance[branchName][productFilter] = [...]
    const performance = {};

    for (const branch of branches) {
      const bName = branch.b_name;
      performance[bName] = {};

      // Only active salesmen assigned to this branch
      const branchSalesmen = salesmen.filter((e) => e.bid === branch.bid);
      if (branchSalesmen.length === 0) continue;

      const branchSales = monthSales.filter((s) => s.branch_id === branch.bid);

      // 'All' products: both sales count (transactions) and units sold (quantity sum)
      performance[bName]['All'] = branchSalesmen
        .map((emp) => {
          const empSales = branchSales.filter((s) => s.salesman_id === emp.e_id);
          const units = empSales.reduce((sum, s) => sum + (s.quantity || 1), 0);
          const sales = empSales.length;
          return { name: `${emp.f_name} ${emp.last_name}`, units, sales };
        })
        .filter((entry) => entry.units > 0 || entry.sales > 0)
        .sort((a, b) => b.units - a.units);

      // Per-product: both sales count and units sold per salesman
      for (const prodName of productNames.slice(1)) {
        const prodEntry = products.find((p) => p.Prod_name === prodName);
        if (!prodEntry) continue;

        performance[bName][prodName] = branchSalesmen
          .map((emp) => {
            const relevantSales = branchSales.filter(
              (s) => s.salesman_id === emp.e_id && s.product_id === prodEntry.prod_id
            );
            const units = relevantSales.reduce((sum, s) => sum + (s.quantity || 1), 0);
            const sales = relevantSales.length;
            return { name: `${emp.f_name} ${emp.last_name}`, units, sales };
          })
          .filter((entry) => entry.units > 0 || entry.sales > 0)
          .sort((a, b) => b.units - a.units);
      }
    }

    res.json({
      success: true,
      data: { branches: branchNames, products: productNames, performance, availableMonths },
    });
  } catch (error) {
    console.error('[OwnerDashboard] getSalesmanPerformance error:', error.message);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Get Branch Sales Data (product-level breakdown per branch)
// @route   GET /api/owner/analytics/branch-sales
// @access  Private (Owner)
exports.getBranchSales = async (req, res) => {
  try {
    const { month } = req.query; // e.g. "2026-02"

    const [branches, allSales, products] = await Promise.all([
      Branch.find().lean(),
      Sale.find().lean(),
      Product.find({ Status: 'Accepted' }).lean(),
    ]);

    // ── Compute availableMonths from ALL sales (regardless of filter) ──
    const monthSet = new Set();
    allSales.forEach((s) => {
      if (s.sales_date) {
        const d = new Date(s.sales_date);
        if (!isNaN(d))
          monthSet.add(
            `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
          );
      }
    });
    const availableMonths = [...monthSet].sort().reverse(); // newest first

    // ── Filter sales by the requested month (if provided) ──
    let filteredSales = allSales;
    if (month) {
      const [y, m] = month.split('-').map(Number);
      const start = new Date(y, m - 1, 1);
      const end = new Date(y, m, 1); // first of next month
      filteredSales = allSales.filter((s) => {
        if (!s.sales_date) return false;
        const d = new Date(s.sales_date);
        return d >= start && d < end;
      });
    }

    const branchNames = branches.map((b) => b.b_name);

    // Product names that actually appear in the (filtered) sales
    const productNames = [
      'All',
      ...[
        ...new Set(
          filteredSales
            .map((s) => {
              const p = products.find((pr) => pr.prod_id === s.product_id);
              return p ? p.Prod_name : null;
            })
            .filter(Boolean)
        ),
      ].sort(),
    ];

    // branchSales[branchName] = {
    //   totalUnits, totalSales,
    //   byProduct: { productName: { units, sales } }
    // }
    const branchSales = {};
    for (const branch of branches) {
      const bSales = filteredSales.filter((s) => s.branch_id === branch.bid);
      const byProduct = {};

      for (const prodName of productNames.slice(1)) {
        const prod = products.find((p) => p.Prod_name === prodName);
        if (!prod) continue;
        const prodSales = bSales.filter((s) => s.product_id === prod.prod_id);
        const units = prodSales.reduce((sum, s) => sum + (s.quantity || 1), 0);
        const sales = prodSales.length;
        if (units > 0 || sales > 0) byProduct[prodName] = { units, sales };
      }

      branchSales[branch.b_name] = {
        totalUnits: bSales.reduce((sum, s) => sum + (s.quantity || 1), 0),
        totalSales: bSales.length,
        byProduct,
      };
    }

    res.json({
      success: true,
      data: { branches: branchNames, products: productNames, branchSales, availableMonths },
    });
  } catch (error) {
    console.error('[OwnerDashboard] getBranchSales error:', error.message);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};