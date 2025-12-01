// path: server/controllers/manager/ManagerSalaryController.js
const Employee = require("../../models/employees"); 
const User = require("../../models/User");         
const Sale = require("../../models/sale"); // Assuming Sale model exists

// Helper to get the manager's Employee document from the authenticated User ID
const getManagerEmployee = async (userId) => {
    // This function assumes User.js stores the login details (userId, emp_id)
    const userDoc = await User.findOne({ userId });
    if (!userDoc || !userDoc.emp_id) {
        throw new Error("User or Employee ID not found");
    }
    // Find the actual employee profile
    const managerEmployee = await Employee.findOne({ e_id: userDoc.emp_id, role: "manager" });
    if (!managerEmployee) {
        throw new Error("Manager profile not found or role mismatch");
    }
    return managerEmployee;
};

// Logic for calculating salary for an individual employee
const calculateEmployeeSalary = async (emp, startDate, endDate, branchSales) => {
    const hireDate = emp.hiredAt;
    
    // Check if the employee was hired in or before this month's start
    const firstDayOfMonth = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
    const firstDayOfHireMonth = new Date(hireDate.getFullYear(), hireDate.getMonth(), 1);

    if (firstDayOfMonth < firstDayOfHireMonth) {
        return {
            employee_name: `${emp.f_name} ${emp.last_name}`,
            role: emp.role,
            e_id: emp.e_id,
            baseSalary: "0.00",
            commission: "0.00",
            totalSalary: "0.00",
            note: "Not hired for this entire month"
        };
    }

    let commission = 0;
    let baseSalary = emp.base_salary || 0;
    
    // Salesman Commission: 2% of profit/loss from *their own* sales in the period
    if (emp.role.toLowerCase() === "salesman") {
        const sales = await Sale.find({
            salesman_id: emp.e_id,
            branch_id: emp.bid,
            sales_date: { $gte: startDate, $lt: endDate }
        }).lean();
        
        // Assuming Sale model has 'profit_or_loss' field from salesmanager.js
        commission = sales.reduce((sum, sale) => sum + (sale.profit_or_loss * 0.02), 0); 
    } 
    // Manager Commission: 1% of total branch profit/loss in the period
    else if (emp.role.toLowerCase() === "manager") {
        commission = branchSales.reduce((sum, sale) => sum + (sale.profit_or_loss * 0.01), 0);
    }
    
    // Ensure commission is not negative if policy dictates minimum 0 commission
    commission = Math.max(0, commission);

    const totalSalary = baseSalary + commission;
    let note = "";
    if (emp.status.toLowerCase() !== 'active') {
        note = `Employee Status: ${emp.status.toUpperCase()}`;
    }

    return {
        employee_name: `${emp.f_name} ${emp.last_name}`,
        role: emp.role,
        e_id: emp.e_id,
        baseSalary: baseSalary.toFixed(2),
        commission: commission.toFixed(2),
        totalSalary: totalSalary.toFixed(2),
        note: note
    };
};


// @desc    Get the list of available month/year options
// @route   GET /api/manager/salary/months
// @access  Private (Manager only)
exports.getMonthOptions = async (req, res) => {
    // Logic adapted from salary.js to generate the previous 6 months (X-7 to X-1)
    const currentDate = new Date();
    const monthYearOptions = [];
    
    // Generate the last 7 months, going back 7 but stopping at 1 (previous month)
    for (let i = 7; i >= 1; i--) {
        const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
        const monthYear = date
            .toLocaleString('en-US', { month: 'short', year: 'numeric' })
            .replace(' ', '-');
        monthYearOptions.push(monthYear);
    }
    
    res.status(200).json({ success: true, monthYearOptions });
};

// @desc    Calculate and return salaries for the selected month
// @route   GET /api/manager/salary?monthYear=...
// @access  Private (Manager only)
exports.getSalariesByMonth = async (req, res) => {
    const { monthYear } = req.query;

    if (!monthYear) {
        return res.status(400).json({ success: false, message: "Month and Year selection is required." });
    }

    try {
        const managerEmployee = await getManagerEmployee(req.user.id);
        const managerBid = managerEmployee.bid;

        if (!managerBid) {
            return res.status(400).json({ success: false, message: "Manager not assigned to a branch." });
        }

        // --- Date Parsing Logic ---
        const [monthStr, yearStr] = monthYear.split('-');
        const monthIndex = new Date(Date.parse(monthStr + " 1, 2012")).getMonth(); 
        const year = parseInt(yearStr);
        
        const startDate = new Date(year, monthIndex, 1);
        const endDate = new Date(year, monthIndex + 1, 1);

        // Fetch all active/resigned employees (manager + salesmen) in the branch
        const employees = await Employee.find({
            bid: managerBid,
            role: { $in: ["salesman", "manager"] },
            status: { $in: ["active", "resigned"] } 
        });

        if (employees.length === 0) {
            return res.status(200).json({ success: true, salaries: [], message: "No active or resigned employees found in your branch." });
        }

        // --- SORTING LOGIC ADDED HERE ---
        // 1. Separate Manager and Salesmen
        const manager = employees.find(emp => emp.role === 'manager');
        const salesmen = employees.filter(emp => emp.role === 'salesman').sort((a, b) => a.e_id.localeCompare(b.e_id));

        // 2. Recombine: Manager first, then Salesmen
        const sortedEmployees = manager ? [manager, ...salesmen] : [...salesmen];

        // 3. Calculate total sales/profit for the whole branch
        const branchSales = await Sale.find({
            branch_id: managerBid,
            sales_date: { $gte: startDate, $lt: endDate }
        }).lean();

        // 4. Calculate salary for each employee in the sorted list
        const salaryPromises = sortedEmployees.map(emp => 
            calculateEmployeeSalary(emp, startDate, endDate, branchSales)
        );

        const salaries = await Promise.all(salaryPromises);

        res.status(200).json({ success: true, salaries });

    } catch (error) {
        console.error("Error in getSalariesByMonth:", error.message);
        res.status(500).json({ success: false, message: "Server error calculating salaries." });
    }
};