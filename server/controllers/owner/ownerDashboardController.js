const Order = require("../../models/orders");
const Sale = require("../../models/sale");
const Branch = require("../../models/branches");
const Employee = require("../../models/employees");
const Product = require("../../models/products");
const Company = require("../../models/company");

// @desc    Get Owner Dashboard Data (Last 30 Days)
// @route   GET /api/owner/analytics/data
// @access  Private (Owner)
exports.getOwnerDashboardData = async (req, res) => {
  try {
    const endDate = new Date();
    endDate.setHours(23, 59, 59, 999);

    const startDate = new Date();
    startDate.setDate(endDate.getDate() - 29);
    startDate.setHours(0, 0, 0, 0);

    const [orders, sales] = await Promise.all([
      Order.find({ ordered_date: { $gte: startDate, $lte: endDate } }).lean(),
      Sale.find({ sales_date: { $gte: startDate, $lte: endDate } }).lean()
    ]);

    const days = [];
    const orderCounts = [];
    const saleCounts = [];
    const profitLossTotals = [];

    for (let i = 0; i < 30; i++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + i);

      const dayLabel = currentDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      days.push(dayLabel);

      const dailyOrders = orders.filter(order => {
        const orderDate = new Date(order.ordered_date);
        return (
          orderDate.getDate() === currentDate.getDate() &&
          orderDate.getMonth() === currentDate.getMonth() &&
          orderDate.getFullYear() === currentDate.getFullYear()
        );
      });
      orderCounts.push(dailyOrders.length);

      const dailySales = sales.filter(sale => {
        const saleDate = new Date(sale.sales_date);
        return (
          saleDate.getDate() === currentDate.getDate() &&
          saleDate.getMonth() === currentDate.getMonth() &&
          saleDate.getFullYear() === currentDate.getFullYear()
        );
      });
      saleCounts.push(dailySales.length);

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
exports.getSalesmanPerformance = async (req, res) => {
  try {
    const { month } = req.query;

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

    const [branches, salesmen, monthSales, products, allSaleDates] = await Promise.all([
      Branch.find().lean(),
      Employee.find({ role: 'salesman', status: 'active' }).lean(),
      Sale.find({ sales_date: { $gte: startDate, $lte: endDate } }).lean(),
      Product.find({ Status: 'Accepted' }).lean(),
      Sale.find({}, { sales_date: 1, _id: 0 }).lean(),
    ]);

    const monthSet = new Set();
    allSaleDates.forEach((s) => {
      const d = new Date(s.sales_date);
      monthSet.add(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
    });
    const availableMonths = [...monthSet].sort().reverse();

    const branchNames = branches.map((b) => b.b_name);

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

    const performance = {};

    for (const branch of branches) {
      const bName = branch.b_name;
      performance[bName] = {};

      const branchSalesmen = salesmen.filter((e) => e.bid === branch.bid);
      if (branchSalesmen.length === 0) continue;

      const branchSales = monthSales.filter((s) => s.branch_id === branch.bid);

      performance[bName]['All'] = branchSalesmen
        .map((emp) => {
          const empSales = branchSales.filter((s) => s.salesman_id === emp.e_id);
          const units = empSales.reduce((sum, s) => sum + (s.quantity || 1), 0);
          const sales = empSales.length;
          return { name: `${emp.f_name} ${emp.last_name}`, units, sales };
        })
        .filter((entry) => entry.units > 0 || entry.sales > 0)
        .sort((a, b) => b.units - a.units);

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
// @route   GET /api/owner/analytics/branch-sales?month=YYYY-MM
// @access  Private (Owner)
exports.getBranchSales = async (req, res) => {
  try {
    const { month } = req.query;

    const [branches, allSales, products] = await Promise.all([
      Branch.find().lean(),
      Sale.find().lean(),
      Product.find({ Status: 'Accepted' }).lean(),
    ]);

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
    const availableMonths = [...monthSet].sort().reverse();

    let filteredSales = allSales;
    if (month) {
      const [y, m] = month.split('-').map(Number);
      const start = new Date(y, m - 1, 1);
      const end = new Date(y, m, 1);
      filteredSales = allSales.filter((s) => {
        if (!s.sales_date) return false;
        const d = new Date(s.sales_date);
        return d >= start && d < end;
      });
    }

    const branchNames = branches.map((b) => b.b_name);

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

// @desc    Get Company Sales Data
// @route   GET /api/owner/analytics/company-sales?month=YYYY-MM
// @access  Private (Owner)
exports.getCompanySales = async (req, res) => {
  try {
    const { month } = req.query;

    const [companies, allSales] = await Promise.all([
      Company.find({ active: 'active' }).lean(),
      Sale.find({}, { sales_date: 1, company_id: 1, quantity: 1, _id: 0 }).lean(),
    ]);

    // Build availableMonths from all sales
    const monthSet = new Set();
    allSales.forEach((s) => {
      if (s.sales_date) {
        const d = new Date(s.sales_date);
        if (!isNaN(d))
          monthSet.add(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
      }
    });
    const availableMonths = [...monthSet].sort().reverse();

    // Filter by month
    let filteredSales = allSales;
    if (month) {
      const [y, m] = month.split('-').map(Number);
      const start = new Date(y, m - 1, 1);
      const end = new Date(y, m, 1);
      filteredSales = allSales.filter((s) => {
        if (!s.sales_date) return false;
        const d = new Date(s.sales_date);
        return d >= start && d < end;
      });
    }

    // Build companySales map: { companyName: { totalUnits, totalSales } }
    const companyNames = [];
    const companySales = {};

    for (const company of companies) {
      const cSales = filteredSales.filter((s) => s.company_id === company.c_id);
      // Only include companies that have at least 1 sale (in filtered or all time)
      companyNames.push(company.cname);
      companySales[company.cname] = {
        totalUnits: cSales.reduce((sum, s) => sum + (s.quantity || 1), 0),
        totalSales: cSales.length,
      };
    }

    res.json({
      success: true,
      data: { companies: companyNames, companySales, availableMonths },
    });
  } catch (error) {
    console.error('[OwnerDashboard] getCompanySales error:', error.message);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Get Product Sales Data (optionally filtered by company)
// @route   GET /api/owner/analytics/product-sales?month=YYYY-MM&company=CompanyName
// @access  Private (Owner)
// Note: When a company filter is applied, only products sold under that company
//       appear on the x-axis, giving a per-company product breakdown.
exports.getProductSales = async (req, res) => {
  try {
    const { month, company } = req.query;

    const [companies, products, allSales] = await Promise.all([
      Company.find({ active: 'active' }).lean(),
      Product.find({ Status: 'Accepted' }).lean(),
      Sale.find({}, { sales_date: 1, company_id: 1, product_id: 1, quantity: 1, _id: 0 }).lean(),
    ]);

    // Build availableMonths
    const monthSet = new Set();
    allSales.forEach((s) => {
      if (s.sales_date) {
        const d = new Date(s.sales_date);
        if (!isNaN(d))
          monthSet.add(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
      }
    });
    const availableMonths = [...monthSet].sort().reverse();

    // Filter by month
    let filteredSales = allSales;
    if (month) {
      const [y, m] = month.split('-').map(Number);
      const start = new Date(y, m - 1, 1);
      const end = new Date(y, m, 1);
      filteredSales = allSales.filter((s) => {
        if (!s.sales_date) return false;
        const d = new Date(s.sales_date);
        return d >= start && d < end;
      });
    }

    // Filter by company — narrows products to those sold under that company
    if (company && company !== 'All') {
      const companyDoc = companies.find((c) => c.cname === company);
      if (companyDoc) {
        filteredSales = filteredSales.filter((s) => s.company_id === companyDoc.c_id);
      }
    }

    // Build productSales: { productName: { totalUnits, totalSales } }
    // Only include products that appear in the filtered sales
    const productSales = {};
    for (const product of products) {
      const pSales = filteredSales.filter((s) => s.product_id === product.prod_id);
      if (pSales.length > 0) {
        productSales[product.Prod_name] = {
          totalUnits: pSales.reduce((sum, s) => sum + (s.quantity || 1), 0),
          totalSales: pSales.length,
        };
      }
    }

    const companyNames = ['All', ...companies.map((c) => c.cname)];

    res.json({
      success: true,
      data: { companies: companyNames, productSales, availableMonths },
    });
  } catch (error) {
    console.error('[OwnerDashboard] getProductSales error:', error.message);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};