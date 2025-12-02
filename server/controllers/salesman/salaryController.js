const Employee = require("../../models/employees");
const Sale = require("../../models/sale");
const User = require("../../models/User");

// Helper function to get emp_id from req.user
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

// @desc    Get salary data for the logged-in salesman
// @route   GET /api/salesman/salaries
// @access  Private (Salesman)
exports.getSalesmanSalary = async (req, res) => {
  try {
    const emp_id = await getEmployeeId(req);
    
    // Case-insensitive check for role and status
    const employee = await Employee.findOne({ 
      e_id: emp_id, 
      role: /^Salesman$/i, 
      status: /^active$/i 
    }).lean();

    if (!employee) {
      return res.status(404).json({ success: false, message: "Salesman not found" });
    }

    if (!employee.bid) {
      return res.status(400).json({ success: false, message: "No branch assigned to employee" });
    }

    // --- Date Logic ---
    const currentDate = new Date();
    
    // Generate options for the last 6 months (X-7 to X-1)
    const monthYearOptions = [];
    for (let i = 1; i <= 6; i++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const monthYear = date.toLocaleString('en-US', { month: 'short', year: 'numeric' }).replace(' ', '-');
      monthYearOptions.push(monthYear);
    }

    // Determine selected month-year (default to previous month)
    const defaultMonthYear = monthYearOptions[0]; 
    const requestedMonthYear = req.query.monthYear || defaultMonthYear;

    // Parse selected Month-Year
    const [monthStr, yearStr] = requestedMonthYear.split("-");
    const monthMap = {
      Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5,
      Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11
    };
    
    const normalizedMonth = monthStr.charAt(0).toUpperCase() + monthStr.slice(1).toLowerCase();

    if (!monthMap.hasOwnProperty(normalizedMonth) || isNaN(yearStr)) {
       return res.status(400).json({ success: false, message: "Invalid month-year format" });
    }

    const month = monthMap[normalizedMonth];
    const year = parseInt(yearStr);
    
    const startDate = new Date(year, month, 1);
    const endDate = new Date(year, month + 1, 1);

    // --- Calculation Logic ---
    const hireDate = new Date(employee.hiredAt);
    const isHired = startDate >= new Date(hireDate.getFullYear(), hireDate.getMonth(), 1);

    let salaryData = null;

    if (!isHired) {
      salaryData = {
        employee_name: `${employee.f_name} ${employee.last_name}`,
        base_salary: 0,
        commission: 0,
        total_salary: 0,
        note: "Not hired in this month"
      };
    } else {
      // Calculate Commission (2% of profit from sales in that month)
      const sales = await Sale.find({
        salesman_id: employee.e_id,
        sales_date: { $gte: startDate, $lt: endDate }
      }).lean();

      const commission = sales.reduce((sum, sale) => sum + (sale.profit_or_loss * 0.02), 0);
      const totalSalary = employee.base_salary + commission;

      salaryData = {
        employee_name: `${employee.f_name} ${employee.last_name}`,
        base_salary: employee.base_salary,
        commission: commission,
        total_salary: totalSalary,
        note: null
      };
    }

    res.json({
      success: true,
      data: salaryData,
      monthYearOptions,
      selectedMonthYear: requestedMonthYear
    });

  } catch (error) {
    console.error("[GetSalesmanSalary] Error:", error.message);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};