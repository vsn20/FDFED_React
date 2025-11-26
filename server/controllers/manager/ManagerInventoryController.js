const User = require("../../models/User"); // Assuming User model path
const Employee = require("../../models/employees"); // Assuming Employee model path
const Branch = require("../../models/branches"); // Assuming Branch model path
const Inventory = require("../../models/inventory"); // Your existing Inventory model

// Helper: Get Manager and Branch from req.user (Reused logic for role/branch authorization)
const getManagerAuth = async (userId) => {
  const userDoc = await User.findOne({ userId });
  if (!userDoc || !userDoc.emp_id) {
    throw new Error("Manager profile not found");
  }

  const managerEmployee = await Employee.findOne({ e_id: userDoc.emp_id });
  if (!managerEmployee || managerEmployee.role !== "manager" || managerEmployee.status !== "active") {
    throw new Error("Access denied or manager account inactive");
  }

  if (!managerEmployee.bid) {
    throw new Error("Manager not assigned to a branch");
  }
  
  const branch = await Branch.findOne({ bid: managerEmployee.bid, active: "active" });
  if (!branch) {
      throw new Error(`No active branch found for bid: ${managerEmployee.bid}`);
  }

  return { managerEmployee, branch };
};


// @desc    Get Inventory for the Manager's Branch
// @route   GET /api/manager/inventory
// @access  Private (Manager)
const getBranchInventory = async (req, res) => {
  try {
    const { branch } = await getManagerAuth(req.user.id);

    // Find all inventory records for the manager's branch
    const inventoryList = await Inventory.find({ branch_id: branch.bid }).lean();

    res.json({
      success: true,
      data: inventoryList,
      branchName: branch.b_name,
    });
  } catch (error) {
    console.error("[getBranchInventory] Error:", error.message);
    res.status(403).json({ success: false, message: error.message });
  }
};

module.exports = {
  getBranchInventory,
};