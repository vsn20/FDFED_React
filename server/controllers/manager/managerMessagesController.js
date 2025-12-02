const Message = require("../../models/message");
const Employee = require("../../models/employees");
const Company = require("../../models/company");
// IMP: Import User model to bridge userId ("naman") -> emp_id ("EMP101")
const User = require("../../models/User"); 

// --- Helper: Enrich IDs to Names ---
async function enrichMessages(messages, currentUserId) {
  const enriched = [];
  const msgs = Array.isArray(messages) ? messages : [messages];

  for (let msg of msgs) {
    let msgObj = msg.toObject ? msg.toObject() : msg;

    // 1. Resolve SENDER
    if (msgObj.from === currentUserId) {
      msgObj.fromDisplay = "You";
    } else {
      // Try finding employee first
      const emp = await Employee.findOne({ e_id: msgObj.from }).select('f_name last_name').lean();
      if (emp) {
        msgObj.fromDisplay = `${msgObj.from} - ${emp.f_name} ${emp.last_name}`;
      } else {
        // Try finding company
        const comp = await Company.findOne({ c_id: msgObj.from }).select('cname').lean();
        msgObj.fromDisplay = comp ? `${msgObj.from} - ${comp.cname}` : msgObj.from;
      }
    }

    // 2. Resolve RECIPIENT
    if (msgObj.to === currentUserId) {
      msgObj.toDisplay = "You";
    } else if (msgObj.to === "all_sales_manager") {
      msgObj.toDisplay = "All Sales Managers";
    } else if (msgObj.to === "all_companies") {
      msgObj.toDisplay = "All Companies";
    } else if (msgObj.to === "admin") {
      msgObj.toDisplay = "Admin";
    } else {
      const emp = await Employee.findOne({ e_id: msgObj.to }).select('f_name last_name').lean();
      if (emp) {
        msgObj.toDisplay = `${msgObj.to} - ${emp.f_name} ${emp.last_name}`;
      } else {
        const comp = await Company.findOne({ c_id: msgObj.to }).select('cname').lean();
        msgObj.toDisplay = comp ? `${msgObj.to} - ${comp.cname}` : msgObj.to;
      }
    }
    enriched.push(msgObj);
  }
  return enriched;
}

// --- UPDATED Helper to get Canonical E_ID ---
async function getSafeEmpId(req) {
  // 1. Get ID from token (This is 'naman' based on your logs)
  let rawId = req.user.id || req.user.emp_id || req.user.e_id || req.user._id;
  
  console.log("DEBUG: Raw ID from Token:", rawId);

  try {
    // STRATEGY A: Check if rawId is a 'userId' in the USER collection
    // This bridges 'naman' -> 'EMP101'
    const userRecord = await User.findOne({ userId: rawId }).select('emp_id');
    
    if (userRecord && userRecord.emp_id) {
      console.log(`DEBUG: Found User '${rawId}'. Resolved to emp_id: '${userRecord.emp_id}'`);
      return userRecord.emp_id;
    }

    // STRATEGY B: Check if rawId is already an 'e_id' in EMPLOYEE collection
    // (Useful if the token structure changes later)
    const employee = await Employee.findOne({ e_id: rawId }).select('e_id');
    if (employee) {
      console.log(`DEBUG: Token ID '${rawId}' is already a valid e_id.`);
      return employee.e_id;
    }

  } catch (err) {
    console.log("DEBUG: Error resolving employee ID:", err.message);
  }

  // Fallback
  console.log("DEBUG: Could not resolve. Using Raw ID:", rawId);
  return rawId;
}

// --- Controller Methods ---

// @desc    Get Manager's Inbox
const getInbox = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "" } = req.query;
    
    // Resolve ID properly (naman -> EMP101)
    const empId = await getSafeEmpId(req);

    const query = {
      $or: [
        { to: empId },
        { to: "all_sales_manager" }
      ]
    };

    console.log(`DEBUG: Executing Inbox Query for ${empId}:`, JSON.stringify(query));

    if (search) {
      query.$and = [{
        $or: [
          { message: { $regex: search, $options: "i" } },
          { from: { $regex: search, $options: "i" } }
        ]
      }];
    }

    const messages = await Message.find(query)
      .sort({ timestamp: -1 })
      .skip((parseInt(page) - 1) * parseInt(limit))
      .limit(parseInt(limit));

    const totalMessages = await Message.countDocuments(query);

    const enrichedMessages = await enrichMessages(messages, empId);

    res.json({
      success: true,
      messages: enrichedMessages,
      totalPages: Math.ceil(totalMessages / parseInt(limit)),
      currentPage: parseInt(page),
      totalMessages
    });
  } catch (error) {
    console.error("Error fetching inbox:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// @desc    Get Sent Messages
const getSent = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "" } = req.query;
    const empId = await getSafeEmpId(req);

    const query = { from: empId };

    if (search) {
      query.message = { $regex: search, $options: "i" };
    }

    const messages = await Message.find(query)
      .sort({ timestamp: -1 })
      .skip((parseInt(page) - 1) * parseInt(limit))
      .limit(parseInt(limit));

    const totalMessages = await Message.countDocuments(query);
    const enrichedMessages = await enrichMessages(messages, empId);

    res.json({
      success: true,
      messages: enrichedMessages,
      totalPages: Math.ceil(totalMessages / parseInt(limit)),
      currentPage: parseInt(page),
      totalMessages
    });
  } catch (error) {
    console.error("Error fetching sent messages:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// @desc    Get Recipients (Companies + Branch Salesmen)
const getRecipients = async (req, res) => {
  try {
    const empId = await getSafeEmpId(req);

    const companies = await Company.find({ active: "active" }).select('c_id cname').lean();

    const manager = await Employee.findOne({ e_id: empId }).select('bid').lean();
    
    let branchSalesmen = [];
    if (manager && manager.bid) {
      branchSalesmen = await Employee.find({ 
        role: "Salesman", 
        bid: manager.bid, 
        status: "active" 
      }).select('e_id f_name last_name bid').lean();
    }

    res.json({ 
      success: true, 
      data: { companies, branchSalesmen } 
    });

  } catch (error) {
    console.error("Error fetching recipients:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// @desc    Send a Message
const sendMessage = async (req, res) => {
  try {
    const { category, to, message } = req.body;
    const from = await getSafeEmpId(req);

    if (!message) return res.status(400).json({ success: false, message: "Message is required" });

    const newMessage = {
      from,
      category,
      message,
      timestamp: new Date(),
      emp_id: from 
    };

    if (category === "admin") {
      newMessage.to = "admin";
    } else if (category === "all_companies") {
      newMessage.to = "all_companies";
    } else if (category === "specific_company") {
      if (!to) return res.status(400).json({ success: false, message: "Company is required" });
      newMessage.to = to;
      newMessage.c_id = to; 
    } else if (category === "specific_salesman") {
      if (!to) return res.status(400).json({ success: false, message: "Salesman is required" });
      newMessage.to = to;
      newMessage.emp_id = to;
    } else {
      return res.status(400).json({ success: false, message: "Invalid category" });
    }

    const saved = await Message.create(newMessage);

    const enrichedForSocket = await enrichMessages([saved], from);
    const io = req.io;
    if (io) {
      io.emit("newMessage", enrichedForSocket[0]);
    }

    res.json({ success: true, message: "Message sent successfully" });

  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

module.exports = {
  getInbox,
  getSent,
  getRecipients,
  sendMessage
};