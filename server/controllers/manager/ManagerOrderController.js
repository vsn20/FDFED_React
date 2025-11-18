const User = require("../../models/User");
const Employee = require("../../models/employees");
const Branch = require("../../models/branches");
const Order = require("../../models/orders");
const Company = require("../../models/company");
const Product = require("../../models/products");
const Inventory = require("../../models/inventory");
const { v4: uuidv4 } = require('uuid');

// Helper: Get Manager and Branch from req.user
// This replaces the repetitive auth checks in every function
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

// Helper: Update inventory when an order is "Accepted"
// This logic is copied from your original orders.js
async function updateInventoryForOrder(order, branch) {
  try {
    const company = await Company.findOne({ c_id: order.company_id }).lean();
    if (!company) {
      return { success: false, message: `Company not found for c_id: ${order.company_id}` };
    }

    const product = await Product.findOne({ prod_id: order.product_id }).lean();
    if (!product) {
      return { success: false, message: `Product not found for prod_id: ${order.product_id}` };
    }

    let inventory = await Inventory.findOne({
      branch_id: branch.bid,
      product_id: order.product_id,
    });

    if (inventory) {
      inventory.quantity += parseInt(order.quantity);
      inventory.updatedAt = new Date();
      await inventory.save();
    } else {
      inventory = new Inventory({
        branch_id: branch.bid,
        branch_name: branch.b_name,
        product_id: order.product_id,
        product_name: product.Prod_name,
        company_id: order.company_id,
        company_name: company.cname,
        model_no: product.Model_no,
        quantity: parseInt(order.quantity)
      });
      await inventory.save();
    }

    return { success: true };
  } catch (error) {
    return { success: false, message: error.message };
  }
}

// GET /manager/orders
exports.getOrders = async (req, res) => {
  try {
    const { branch } = await getManagerAuth(req.user.id);

    const orders = await Order.find({ branch_name: branch.b_name })
      .sort({ createdAt: -1 })
      .lean();
      
    res.json(orders);
  } catch (err) {
    console.error('Error in getOrders:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /manager/orders/form-data
exports.getOrderFormData = async (req, res) => {
    try {
        const { branch } = await getManagerAuth(req.user.id);
        const companies = await Company.find({ active: "active" }).lean();
        
        res.json({
            companies,
            branchname: branch.b_name,
            branchid: branch.bid
        });
    } catch (err) {
        console.error('Error in getOrderFormData:', err);
        res.status(500).json({ success: false, message: err.message });
    }
};

// GET /manager/orders/products/:companyId
exports.getProductsByCompany = async (req, res) => {
    try {
        // Authenticate to ensure user is a manager
        await getManagerAuth(req.user.id);
        const companyId = req.params.companyId;
        const products = await Product.find({ 
          Com_id: companyId, 
          Status: { $ne: 'Rejected' } 
        }).lean();
    
        res.json(products);
    } catch (err) {
        console.error('Error in getProductsByCompany:', err);
        res.status(500).json({ success: false, message: err.message });
    }
};

// GET /manager/orders/:id
exports.getSingleOrder = async (req, res) => {
  try {
    const { branch } = await getManagerAuth(req.user.id);
    
    const order = await Order.findOne({ 
        order_id: req.params.id, 
        branch_name: branch.b_name 
    }).lean();

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found or not in your branch" });
    }

    res.json(order);
  } catch (err) {
    console.error('Error in getSingleOrder:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /manager/orders
exports.addOrder = async (req, res) => {
    try {
        const { branch } = await getManagerAuth(req.user.id);
        const { branch_name, company_id, product_id, quantity, ordered_date } = req.body;

        // Security check: Ensure the order is for the manager's own branch
        if (branch_name !== branch.b_name) {
            return res.status(403).json({ success: false, message: "Cannot add orders for another branch." });
        }

        const company = await Company.findOne({ c_id: company_id }).lean();
        const product = await Product.findOne({ prod_id: product_id }).lean();

        if (!company || !product) {
          return res.status(400).json({ success: false, message: "Invalid company or product" });
        }

        const order = new Order({
          order_id: `ORD-${uuidv4().slice(0, 8)}`,
          branch_id: branch.bid,
          branch_name,
          company_id,
          company_name: company.cname,
          product_id,
          product_name: product.Prod_name,
          quantity: parseInt(quantity),
          ordered_date: new Date(ordered_date),
          status: "pending", // Default status
          installation_type: product.installationType || "None"
        });
    
        await order.save();
        res.status(201).json({ success: true, message: "Order added successfully", order });

    } catch (err) {
        console.error('Error in addOrder:', err);
        if (err.name === "ValidationError") {
          return res.status(400).json({ success: false, message: `Validation error: ${err.message}` });
        }
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.updateOrder = async (req, res) => {
  try {
    const { branch } = await getManagerAuth(req.user.id);
    const { status } = req.body;
    const { id } = req.params;

    if (!status) {
        return res.status(400).json({ success: false, message: "Status is required." });
    }
    
    const order = await Order.findOne({ 
        order_id: id, 
        branch_name: branch.b_name 
    });

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found or not in your branch" });
    }

    const oldStatus = order.status.toLowerCase();
    const newStatus = status.toLowerCase();

    if (newStatus !== "cancelled") {
      return res.status(403).json({ 
        success: false, 
        message: "Managers can only cancel orders. Status cannot be changed to '" + newStatus + "'." 
      });
    }

    if (oldStatus !== "pending") {
      return res.status(400).json({ 
        success: false, 
        message: `Only 'pending' orders can be cancelled. This order is already '${oldStatus}'.`
      });
    }
    
    order.status = newStatus;
    await order.save();

    res.json({
      success: true,
      message: "Order has been cancelled successfully",
      order
    });

  } catch (err) {
    console.error('Error in updateOrder:', err);
    if (err.name === "ValidationError") {
      return res.status(400).json({ success: false, message: `Validation error: ${err.message}` });
    }
    res.status(500).json({ success: false, message: err.message });
  }
};