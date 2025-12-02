const Message = require("../../models/message");
const Employee = require("../../models/employees");
const User = require("../../models/User");

// --- Helper: Enrich IDs to Names ---
async function enrichMessages(messages, currentEmpId) {
  const enriched = [];
  const msgs = Array.isArray(messages) ? messages : [messages];

  for (let msg of msgs) {
    let msgObj = msg.toObject ? msg.toObject() : msg;

    // 1. Resolve SENDER
    if (msgObj.from === currentEmpId) {
      msgObj.fromDisplay = "You";
    } else {
      const emp = await Employee.findOne({ e_id: msgObj.from }).select('f_name last_name').lean();
      msgObj.fromDisplay = emp ? `${msgObj.from} - ${emp.f_name} ${emp.last_name}` : msgObj.from;
    }

    // 2. Resolve RECIPIENT
    if (msgObj.to === currentEmpId) {
      msgObj.toDisplay = "You";
    } else if (msgObj.to === "all_salesman") {
      msgObj.toDisplay = `All Salesmen (${msgObj.branch_id || 'Branch'})`;
    } else {
      const emp = await Employee.findOne({ e_id: msgObj.to }).select('f_name last_name').lean();
      msgObj.toDisplay = emp ? `${msgObj.to} - ${emp.f_name} ${emp.last_name}` : msgObj.to;
    }
    enriched.push(msgObj);
  }
  return enriched;
}

// --- Helper: Get Salesman Employee Details ---
async function getSalesmanDetails(req) {
  // 1. Identify User from Token
  // req.user.id is likely 'naman' or similar string based on your logs
  const userId = req.user.id || req.user.userId;
  
  if (!userId) throw new Error("Unauthorized: No User ID in token");
  
  // 2. Find User Record (Link 'naman' -> 'EMP_ID')
  const user = await User.findOne({ userId: userId }).lean();
  if (!user || !user.emp_id) {
    console.log(`DEBUG: User '${userId}' not found in Users table or has no emp_id`);
    throw new Error("User or Employee ID not found");
  }

  // 3. Find Employee details
  const employee = await Employee.findOne({ e_id: user.emp_id }).lean();
  if (!employee) {
    console.log(`DEBUG: Employee '${user.emp_id}' not found in Employees table`);
    throw new Error("Salesman employee record not found");
  }
  
  return employee;
}

// @desc    Get Salesman's Inbox
exports.getInbox = async (req, res) => {
  try {
    const employee = await getSalesmanDetails(req);
    const emp_id = employee.e_id;
    const branch_id = employee.bid;

    const query = {
      $or: [
        { to: emp_id }, 
        { to: "all_salesman", branch_id: branch_id } 
      ]
    };

    const messages = await Message.find(query).sort({ timestamp: -1 }).lean();
    const enrichedMessages = await enrichMessages(messages, emp_id);

    res.json({
      success: true,
      messages: enrichedMessages,
      meta: { emp_id, branch_id } 
    });
  } catch (error) {
    console.error("Error fetching inbox:", error);
    res.status(500).json({ success: false, message: error.message || "Server Error" });
  }
};

// @desc    Get Sent Messages
exports.getSent = async (req, res) => {
  try {
    const employee = await getSalesmanDetails(req);
    const emp_id = employee.e_id;

    const messages = await Message.find({ from: emp_id }).sort({ timestamp: -1 }).lean();
    const enrichedMessages = await enrichMessages(messages, emp_id);

    res.json({
      success: true,
      messages: enrichedMessages
    });
  } catch (error) {
    console.error("Error fetching sent messages:", error);
    res.status(500).json({ success: false, message: error.message || "Server Error" });
  }
};

// @desc    Get Branch Manager (Recipient for Compose)
exports.getBranchManager = async (req, res) => {
  try {
    const employee = await getSalesmanDetails(req);
    
    console.log(`DEBUG: Salesman ${employee.e_id} belongs to Branch: ${employee.bid}`);

    if (!employee.bid) {
      return res.status(400).json({ success: false, message: "You are not assigned to a branch" });
    }

    // FIX: Search for multiple role variations to be safe
    const manager = await Employee.findOne({ 
      role: { $in: ["manager", "Manager", "Sales Manager"] }, 
      bid: employee.bid, 
      status: "active" 
    }).select('e_id f_name last_name').lean();

    if (!manager) {
      console.log(`DEBUG: No active manager found for branch ${employee.bid}`);
      return res.json({ success: true, manager: null });
    }

    console.log(`DEBUG: Found Manager: ${manager.e_id}`);

    res.json({
      success: true,
      manager: {
        e_id: manager.e_id,
        name: `${manager.f_name} ${manager.last_name}`,
        branch_id: employee.bid
      }
    });

  } catch (error) {
    console.error("Error fetching manager:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// @desc    Send Message to Manager
exports.sendMessage = async (req, res) => {
  try {
    const { to, message } = req.body;
    const employee = await getSalesmanDetails(req);
    const from = employee.e_id;
    const branch_id = employee.bid;

    if (!message) return res.status(400).json({ success: false, message: "Message content is required" });

    // Validate Recipient (Must be branch manager)
    // FIX: Allow multiple role variations here too
    const salesManager = await Employee.findOne({
      e_id: to,
      role: { $in: ["manager", "Manager", "Sales Manager"] },
      bid: branch_id,
      status: "active"
    });

    if (!salesManager) {
      return res.status(403).json({ success: false, message: "Invalid recipient: Not your branch manager" });
    }

    const newMessage = await Message.create({
      from,
      to,
      category: "specific_salesman",
      message,
      emp_id: to,
      branch_id: branch_id,
      timestamp: new Date()
    });

    const enrichedForSocket = await enrichMessages([newMessage], from);
    const io = req.io;
    if (io) {
      io.emit("newMessage", enrichedForSocket[0]);
    }

    res.json({ success: true, message: "Message sent successfully" });

  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};