const Order = require("../../models/orders");
const Sale = require("../../models/sale");

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