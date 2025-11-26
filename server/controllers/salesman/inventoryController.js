const Inventory = require("../../models/inventory");
const Employee = require("../../models/employees");
const Branch = require("../../models/branches");
const User = require("../../models/User");

exports.getSalesmanInventory = async (req, res) => {
  try {
    // 1. Identify the logged-in user
    if (!req.user || !req.user.id) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const user = await User.findOne({ userId: req.user.id }).lean();
    if (!user || !user.emp_id) {
      return res.status(404).json({ success: false, message: "User or Employee ID not found" });
    }

    // 2. Find the Employee details to get the Branch ID (bid)
    const employee = await Employee.findOne({ e_id: user.emp_id }).lean();
    if (!employee) {
      return res.status(404).json({ success: false, message: "Salesman employee record not found" });
    }

    if (!employee.bid) {
      return res.status(400).json({ success: false, message: "Salesman is not assigned to any branch" });
    }

    // 3. (Optional) Get Branch details for display
    const branch = await Branch.findOne({ bid: employee.bid }).lean();
    const branchName = branch ? branch.b_name : "Unknown Branch";

    // 4. Fetch Inventory for this specific branch
    // The Inventory model uses 'branch_id' as the field name
    const stocks = await Inventory.find({ branch_id: employee.bid }).lean();

    // 5. Format the response
    const formattedStocks = stocks.map(stock => ({
      _id: stock._id,
      pid: stock.product_id,
      pname: stock.product_name,
      cname: stock.company_name,
      modelno: stock.model_no,
      quantity: stock.quantity
    }));

    res.json({
      success: true,
      branchId: employee.bid,
      branchName: branchName,
      stocks: formattedStocks
    });

  } catch (error) {
    console.error("[InventoryController] Error:", error);
    res.status(500).json({ success: false, message: "Server Error fetching inventory" });
  }
};