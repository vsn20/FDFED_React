// path: server/controllers/company/dashboard.js
const Order = require("../../models/orders"); // Placeholder: Assume this model exists
const Sale = require("../../models/sale");   // Placeholder: Assume this model exists
const Company = require("../../models/company");
// Assuming you have a standard Mongoose Company model (from your uploaded company.js model)

// GET /api/company/analytics/data (Endpoint for the dashboard chart data)
async function getDashboardData(req, res) {
  try {
    // req.user is populated by authMiddleware (e.g., from a JWT)
    const user = req.user; 

    if (!user || !user.c_id) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const company = await Company.findOne({ c_id: user.c_id }).lean();
    if (!company) {
      return res.status(404).json({ error: "Company not found" });
    }

    // Calculate the date 6 months ago from today
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    sixMonthsAgo.setDate(1); 
    sixMonthsAgo.setHours(0, 0, 0, 0);

    // Fetch orders and sales for the company from the past 6 months
    const [orders, sales] = await Promise.all([
        // Assuming Order model has 'company_id' field and 'ordered_date' field
        Order.find({
            company_id: company.c_id,
            ordered_date: { $gte: sixMonthsAgo } 
        }).lean(),
        // Assuming Sale model has 'company_id' field and 'sales_date' field
        Sale.find({
            company_id: company.c_id,
            sales_date: { $gte: sixMonthsAgo } 
        }).lean()
    ]);

    const months = [];
    const orderCounts = [];
    const saleCounts = [];
    const currentDate = new Date();

    // Loop through the last 6 months to aggregate counts
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(currentDate.getMonth() - i);
      date.setDate(1); // Set to the start of the month for comparison
      
      const monthYear = date.toLocaleString('default', { month: 'short', year: 'numeric' });
      months.push(monthYear);

      // Filter and count orders for the current month
      const orderCount = orders.filter(order => {
        const orderDate = new Date(order.ordered_date);
        return (
          orderDate.getMonth() === date.getMonth() && 
          orderDate.getFullYear() === date.getFullYear()
        );
      }).length;
      orderCounts.push(orderCount);

      // Filter and count sales for the current month
      const saleCount = sales.filter(sale => {
        const saleDate = new Date(sale.sales_date);
        return (
          saleDate.getMonth() === date.getMonth() && 
          saleDate.getFullYear() === date.getFullYear()
        );
      }).length;
      saleCounts.push(saleCount);
    }

    // Response structure mirrors the data expected by the EJS chart script
    res.json({
      months,
      orderCounts,
      saleCounts
    });
  } catch (error) {
    console.error('[getDashboardData] Error:', error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

module.exports = { getDashboardData };