//path:server/controllers/owner/OrderController.js
const Order = require("../../models/orders");
const Branch = require("../../models/branches");

// Get All Orders
exports.getAllOrders = async (req, res) => {
    try {
        // Fetch all orders, sorted by most recent
        const orders = await Order.find().sort({ ordered_date: -1 }).lean();
        res.json(orders);
    } catch (err) {
        console.error("Error fetching orders:", err);
        res.status(500).json({ message: "Server Error" });
    }
};

// Get Order Details by ID
exports.getOrderById = async (req, res) => {
    try {
        const order = await Order.findOne({ order_id: req.params.id }).lean();
        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }
        res.json(order);
    } catch (err) {
        console.error("Error fetching order details:", err);
        res.status(500).json({ message: "Server Error" });
    }
};

// Get Branches for Filter Dropdown
exports.getBranchesForFilter = async (req, res) => {
    try {
        const branches = await Branch.find({ active: "active" }).select("b_name").sort({ b_name: 1 });
        res.json(branches);
    } catch (err) {
        console.error("Error fetching branches:", err);
        res.status(500).json({ message: "Server Error" });
    }
};