const Sale = require("../../models/sale");
const Employee = require("../../models/employees");
const Branch = require("../../models/branches");

// Helper: Calculate profit for specific branch and date range
async function calculateBranchProfit(branch, startDate, endDate) {
    // 1. Fetch Sales for this branch in date range
    // We use the custom string ID 'bid' as that is how sales reference branches
    const sales = await Sale.find({
        branch_id: branch.bid,
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
        
        // Logic from profits_display.js: 
        // 2% for Salesman, 1% for Manager based on Sold Price
        totalSalesmanComm += (sale.sold_price * sale.quantity * 0.02);
        totalManagerComm += (sale.sold_price * sale.quantity * 0.01);
    });

    const grossProfit = totalSalesRevenue - totalCostPrice;

    // 3. Calculate Salaries
    // Fetch active employees (Manager/Salesman) hired before end of this month
    // Using loose matching for roles to handle casing differences
    const employees = await Employee.find({
        bid: branch.bid,
        status: "active",
        role: { $in: ["manager", "salesman", "Sales Manager", "Salesman"] },
        hiredAt: { $lte: endDate }
    }).lean();

    const totalSalaries = employees.reduce((sum, emp) => sum + (emp.base_salary || 0), 0);

    // 4. Net Profit Calculation
    const totalExpenses = totalSalaries + totalSalesmanComm + totalManagerComm;
    const netProfit = grossProfit - totalExpenses;

    return {
        branch_id: branch.bid,
        branch_name: branch.b_name,
        gross_profit: grossProfit,
        expenses: totalExpenses,
        net_profit: netProfit,
        sale_count: sales.length
    };
}

exports.getMonthlyProfits = async (req, res) => {
    try {
        const { monthYear } = req.query; // Expected: "Jan-2025"

        if (!monthYear) {
            return res.status(400).json({ message: "Month-Year is required" });
        }

        // Date Parsing
        const [monthStr, yearStr] = monthYear.split("-");
        const monthMap = {
            Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5,
            Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11
        };

        if (!monthMap.hasOwnProperty(monthStr) || isNaN(yearStr)) {
            return res.status(400).json({ message: "Invalid date format" });
        }

        const year = parseInt(yearStr);
        const month = monthMap[monthStr];
        const startDate = new Date(year, month, 1);
        const endDate = new Date(year, month + 1, 1);

        // Fetch all active branches
        const branches = await Branch.find({ active: "active" }).lean();

        // Calculate profit for each branch in parallel
        const profitData = await Promise.all(
            branches.map(branch => calculateBranchProfit(branch, startDate, endDate))
        );

        // Sort by Net Profit (High to Low)
        profitData.sort((a, b) => b.net_profit - a.net_profit);

        res.json({
            month: monthYear,
            profits: profitData
        });

    } catch (err) {
        console.error("Error calculating profits:", err);
        res.status(500).json({ message: "Server Error" });
    }
};