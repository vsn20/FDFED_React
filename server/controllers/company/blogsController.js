const Message = require("../../models/message");
const Employee = require("../../models/employees");
const Company = require("../../models/company");

// @desc    Get messages/blogs for all customers
// @route   GET /api/customer/blogs
// @access  Private (Customer)
exports.getCustomerBlogs = async (req, res) => {
  try {
    // 1. Fetch messages addressed to "all_customers"
    const messages = await Message.find({ to: "all_customers" })
      .sort({ timestamp: -1 })
      .lean();

    // 2. Enrich messages with sender details (Resolve IDs to Names)
    const enrichedMessages = await Promise.all(messages.map(async (message) => {
      let fromDisplay = message.from;

      if (message.emp_id) {
        const employee = await Employee.findOne({ e_id: message.emp_id }).select('f_name last_name').lean();
        fromDisplay = employee 
          ? `${message.emp_id} - ${employee.f_name} ${employee.last_name}` 
          : message.emp_id;
      } else if (message.c_id) {
        const company = await Company.findOne({ c_id: message.c_id }).select('cname').lean();
        fromDisplay = company 
          ? `${message.c_id} - ${company.cname}` 
          : message.c_id;
      }

      return {
        _id: message._id,
        from: fromDisplay, // Enriched Name
        to: "All Customers",
        message: message.message,
        timestamp: message.timestamp,
        // Helper for frontend preview
        preview: message.message.length > 50 
          ? message.message.substring(0, 50) + "..." 
          : message.message
      };
    }));

    res.json({ success: true, messages: enrichedMessages });

  } catch (error) {
    console.error("Error fetching customer blogs:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};