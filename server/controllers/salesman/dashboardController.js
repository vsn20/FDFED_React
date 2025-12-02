const Sale = require("../../models/sale");
const User = require("../../models/User");

// Helper to get emp_id
const getEmployeeId = async (req) => {
  if (!req.user || !req.user.id) {
    throw new Error("Unauthorized: No user found");
  }
  const user = await User.findOne({ userId: req.user.id }).lean();
  if (!user || !user.emp_id) {
    throw new Error("Employee ID not found for this user");
  }
  return user.emp_id;
};

// @desc    Get Salesman Dashboard Data (Last 30 Days)
// @route   GET /api/salesman/analytics/data
// @access  Private (Salesman)
exports.getSalesmanDashboardData = async (req, res) => {
  try {
    const salesmanId = await getEmployeeId(req);

    // 1. Calculate Date Range (Last 30 Days)
    const endDate = new Date();
    endDate.setHours(23, 59, 59, 999); // End of today

    const startDate = new Date();
    startDate.setDate(endDate.getDate() - 29); // Go back 29 days (total 30 days including today)
    startDate.setHours(0, 0, 0, 0); // Start of that day

    // 2. Fetch sales in this range
    const sales = await Sale.find({
      salesman_id: salesmanId,
      sales_date: { $gte: startDate, $lte: endDate }
    }).lean();

    // 3. Process data for charts
    const days = [];
    const saleCounts = [];
    const profitTotals = [];

    // Loop through each of the last 30 days
    for (let i = 0; i < 30; i++) {
      // Create a date object for the current iteration
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + i);

      // Format label (e.g., "Oct 14")
      const dayLabel = currentDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      days.push(dayLabel);

      // Filter sales for this specific date
      const dailySales = sales.filter(sale => {
        const saleDate = new Date(sale.sales_date);
        return (
          saleDate.getDate() === currentDate.getDate() &&
          saleDate.getMonth() === currentDate.getMonth() &&
          saleDate.getFullYear() === currentDate.getFullYear()
        );
      });

      // A. Count of Sales
      saleCounts.push(dailySales.length);

      // B. Total Profit
      const dailyProfit = dailySales.reduce((sum, sale) => sum + (sale.profit_or_loss || 0), 0);
      profitTotals.push(dailyProfit);
    }

    res.json({
      success: true,
      data: {
        days,       // ["Sep 14", "Sep 15", ... "Oct 14"]
        saleCounts, // [0, 2, 5, ...]
        profitTotals,
        title: "Last 30 Days Performance"
      }
    });

  } catch (error) {
    console.error("[SalesmanDashboard] Error:", error.message);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};