const Employee = require("../../models/employees");
const Sale = require("../../models/sale");
const Branch = require("../../models/branches");

exports.getSalaries = async (req, res) => {
    try {
        const { monthYear } = req.query; // Expected: "Jan-2025"
        
        if (!monthYear) {
            return res.status(400).json({ message: "Month-Year is required" });
        }

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

        // 1. Fetch Active Sales Staff (REMOVED .populate to prevent CastError)
        const employees = await Employee.find({
            role: { $in: ["manager", "salesman", "Sales Manager", "Salesman"] },
            status: "active"
        }).lean();

        // 2. Fetch All Branches manually to create a Map
        // This avoids Mongoose trying to cast "B004" to an ObjectId
        const branches = await Branch.find({}).lean();
        const branchMap = {};
        branches.forEach(b => {
            branchMap[b.bid] = b.b_name; // Map 'B004' -> 'Main Branch'
        });

        const salaryData = await Promise.all(employees.map(async (emp) => {
            const hireDate = new Date(emp.hiredAt);
            const isHired = startDate >= new Date(hireDate.getFullYear(), hireDate.getMonth(), 1);

            // Normalize Role
            const role = emp.role.toLowerCase();
            const isManager = role === "manager" || role === "sales manager";
            const isSalesman = role === "salesman";

            // Resolve Branch Name using our manual map
            // emp.bid is a string like "B004"
            const branchName = branchMap[emp.bid] || "Unknown Branch";

            const empData = {
                _id: emp._id,
                eid: emp.e_id,
                ename: `${emp.f_name} ${emp.last_name}`,
                role: emp.role,
                branch_name: branchName,
                branch_id: emp.bid, 
                salary: emp.base_salary || 0,
                commission: 0,
                total: 0,
                note: ""
            };

            if (!isHired) {
                empData.salary = 0;
                empData.note = "Not hired in this month";
                return empData;
            }

            let commission = 0;

            if (isSalesman) {
                // Salesman: 2% of profit from OWN sales
                // Queries using string IDs ("B004", "E001") work fine here
                const sales = await Sale.find({
                    salesman_id: emp.e_id,
                    branch_id: emp.bid, 
                    sales_date: { $gte: startDate, $lt: endDate }
                }).lean();
                
                commission = sales.reduce((sum, sale) => sum + (sale.profit_or_loss * 0.02), 0);

            } else if (isManager) {
                // Manager: 1% of profit from BRANCH sales
                const branchSales = await Sale.find({
                    branch_id: emp.bid, 
                    sales_date: { $gte: startDate, $lt: endDate }
                }).lean();

                commission = branchSales.reduce((sum, sale) => sum + (sale.profit_or_loss * 0.01), 0);
            }

            empData.commission = commission;
            empData.total = (emp.base_salary || 0) + commission;

            return empData;
        }));

        res.json({
            selectedMonthYear: monthYear,
            salaries: salaryData
        });

    } catch (err) {
        console.error("Error calculating salaries:", err);
        res.status(500).json({ message: "Server Error" });
    }
};

exports.getSalaryBranches = async (req, res) => {
    try {
        const branches = await Branch.find({ active: "active" }).select("bid b_name").sort({ b_name: 1 });
        res.json(branches);
    } catch (err) {
        console.error("Error fetching branches:", err);
        res.status(500).json({ message: "Server Error" });
    }
};