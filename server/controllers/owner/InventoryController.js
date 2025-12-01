//path:server/controllers/owner/InventoryController.js
const Inventory = require("../../models/inventory");
const Branch = require("../../models/branches");

// Get All Inventory Data
exports.getAllInventory = async (req, res) => {
    try {
        // Fetch all inventory items
        const stocks = await Inventory.find().lean();
        
        // Map to standard format if necessary, though direct usage is fine
        // The frontend expects fields: branch_id, branch_name, product_id, product_name, etc.
        res.json(stocks);
    } catch (err) {
        console.error("Error fetching inventory:", err);
        res.status(500).json({ message: "Server Error" });
    }
};

// Get Branches for Filter Dropdown
exports.getBranchesForInventoryFilter = async (req, res) => {
    try {
        // Fetch active branches for the dropdown
        const branches = await Branch.find({ active: "active" }).select("bid b_name").sort({ b_name: 1 });
        res.json(branches);
    } catch (err) {
        console.error("Error fetching branches:", err);
        res.status(500).json({ message: "Server Error" });
    }
};