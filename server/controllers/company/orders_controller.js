const Order = require("../../models/orders");
const Inventory = require("../../models/inventory");
const Product = require("../../models/products");
const Branch = require("../../models/branches");
const Company = require("../../models/company");

// Display Orders with Search and Pagination
async function getCompanyOrders(req, res) {
  try {
    const { page = 1, limit = 10, search = "" } = req.query;
    const companyId = req.user.c_id;

    // Build Query
    const query = { company_id: companyId };

    if (search) {
      // Search by Order ID, Branch Name, or Product Name
      query.$or = [
        { order_id: { $regex: search, $options: "i" } },
        { branch_name: { $regex: search, $options: "i" } },
        { product_name: { $regex: search, $options: "i" } }
      ];
    }

    // Execute Query with Pagination
    const orders = await Order.find(query)
      .sort({ createdAt: -1 }) // Newest first
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .lean();

    // Get total count for pagination
    const totalOrders = await Order.countDocuments(query);

    res.json({
      success: true,
      orders,
      totalPages: Math.ceil(totalOrders / parseInt(limit)),
      currentPage: parseInt(page),
      totalOrders
    });

  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
}

// Update Order Status and handle Inventory logic
async function updateOrderStatus(req, res) {
  try {
    const { order_id } = req.params;
    const { status, delivery_date } = req.body;
    const companyId = req.user.c_id;

    // 1. Find the existing order
    const order = await Order.findOne({ order_id, company_id: companyId });

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    // 2. Validation: Cannot edit if already Delivered or Rejected
    const currentStatus = order.status.toLowerCase();
    if (currentStatus === 'delivered' || currentStatus === 'rejected') {
      return res.status(400).json({ 
        success: false, 
        message: `Cannot update order. Current status is '${currentStatus}'.` 
      });
    }

    // 3. Prepare Update Object
    const updateData = { status: status.toLowerCase() };
    
    // If provided, update delivery date (allowed for Shipped or Delivered)
    if (delivery_date) {
      updateData.delivery_date = new Date(delivery_date);
    }

    // Requirement: If status is delivered, delivery_date is mandatory
    if (updateData.status === 'delivered' && !delivery_date && !order.delivery_date) {
      return res.status(400).json({ 
        success: false, 
        message: "Delivery date is required when marking as Delivered." 
      });
    }

    // 4. INVENTORY UPDATE LOGIC
    // If status is changing to 'delivered', update the Branch Inventory
    if (updateData.status === 'delivered' && currentStatus !== 'delivered') {
      
      const branch = await Branch.findOne({ bid: order.branch_id });
      const product = await Product.findOne({ prod_id: order.product_id });
      const company = await Company.findOne({ c_id: companyId }); // Assuming Company model exists

      if (!branch || !product) {
        return res.status(404).json({ success: false, message: "Related Branch or Product not found." });
      }

      // Check if inventory record exists
      let inventory = await Inventory.findOne({
        branch_id: order.branch_id,
        product_id: order.product_id,
        company_id: companyId
      });

      if (inventory) {
        // Update existing inventory
        inventory.quantity += parseInt(order.quantity);
        inventory.updatedAt = new Date();
        await inventory.save();
      } else {
        // Create new inventory record
        inventory = new Inventory({
          branch_id: order.branch_id,
          branch_name: order.branch_name,
          product_id: order.product_id,
          product_name: order.product_name,
          company_id: companyId,
          company_name: company ? company.cname : "Unknown", // Fallback if company fetch fails
          model_no: product.Model_no,
          quantity: parseInt(order.quantity)
        });
        await inventory.save();
      }
    }

    // 5. Save Order Changes
    const updatedOrder = await Order.findOneAndUpdate(
      { order_id, company_id: companyId },
      updateData,
      { new: true }
    );

    res.json({ success: true, order: updatedOrder, message: "Order updated successfully" });

  } catch (error) {
    console.error("Error updating order:", error);
    res.status(500).json({ success: false, message: error.message });
  }
}

module.exports = {
  getCompanyOrders,
  updateOrderStatus
};