const Message = require("../../models/message");
const Employee = require("../../models/employees");
const Company = require("../../models/company");
const Branch = require("../../models/branches");

// Helper: Get User ID safely from Request
// Owners might have _id, Employees have emp_id
function getCurrentUserId(req) {
  if (!req.user) return null;
  // Prioritize emp_id, then standard mongo _id, then id
  return req.user.emp_id || req.user.id || req.user._id;
}

// Helper: Resolve IDs to Names safely
async function enrichMessages(messages, currentUserEmpId) {
  const enriched = [];
  const msgs = Array.isArray(messages) ? messages : [messages];

  for (let msg of msgs) {
    let msgObj = msg.toObject ? msg.toObject() : msg;

    try {
      // Resolve SENDER
      // Check if the sender is the current user (comparing strings)
      if (String(msgObj.from) === String(currentUserEmpId)) {
        msgObj.fromDisplay = "You";
      } else if (msgObj.from === "admin") {
        msgObj.fromDisplay = "Admin"; 
      } else if (msgObj.from && msgObj.from.startsWith("C")) {
        const comp = await Company.findOne({ c_id: msgObj.from }).select('cname').lean();
        msgObj.fromDisplay = comp ? `${msgObj.from} - ${comp.cname}` : msgObj.from;
      } else {
        const emp = await Employee.findOne({ e_id: msgObj.from }).select('f_name last_name').lean();
        msgObj.fromDisplay = emp ? `${msgObj.from} - ${emp.f_name} ${emp.last_name}` : msgObj.from;
      }

      // Resolve RECIPIENT
      if (String(msgObj.to) === String(currentUserEmpId)) {
        msgObj.toDisplay = "You";
      } else {
        const categoryMap = {
          'all_salesman': 'All Salesmen',
          'all_sales_manager': 'All Sales Managers',
          'all_customers': 'All Customers',
          'all_companies': 'All Companies',
          'admin': 'Admin'
        };

        if (categoryMap[msgObj.to]) {
          msgObj.toDisplay = categoryMap[msgObj.to];
          if (msgObj.to === 'all_salesman' && msgObj.branch_id) {
            msgObj.toDisplay += ` (Branch: ${msgObj.branch_id})`;
          }
        } else if (msgObj.category === 'company') {
          const comp = await Company.findOne({ c_id: msgObj.to }).select('cname').lean();
          msgObj.toDisplay = comp ? `${msgObj.to} - ${comp.cname}` : msgObj.to;
        } else if (['sales_manager', 'salesman'].includes(msgObj.category)) {
          const emp = await Employee.findOne({ e_id: msgObj.to }).select('f_name last_name').lean();
          msgObj.toDisplay = emp ? `${msgObj.to} - ${emp.f_name} ${emp.last_name}` : msgObj.to;
        } else {
          msgObj.toDisplay = msgObj.to;
        }
      }
    } catch (err) {
      console.error(`Error enriching message ${msgObj._id}:`, err);
      msgObj.fromDisplay = msgObj.from;
      msgObj.toDisplay = msgObj.to;
    }
    enriched.push(msgObj);
  }
  return enriched;
}

// 1. Get Inbox
async function getAdminInbox(req, res) {
  try {
    const { page = 1, limit = 10, search = "" } = req.query;
    
    // FIX: Use helper to get ID
    const userId = getCurrentUserId(req);

    // If user is Owner/Admin, they also see messages sent to "admin"
    const query = { $or: [{ to: userId }, { to: "admin" }] };
    
    if (search) {
      query.$and = [{ $or: [{ message: { $regex: search, $options: "i" } }, { from: { $regex: search, $options: "i" } }] }];
    }

    const messages = await Message.find(query)
      .sort({ timestamp: -1 })
      .skip((parseInt(page) - 1) * parseInt(limit))
      .limit(parseInt(limit));

    const totalMessages = await Message.countDocuments(query);
    const enrichedMessages = await enrichMessages(messages, userId);

    res.json({ success: true, messages: enrichedMessages, totalPages: Math.ceil(totalMessages / parseInt(limit)), currentPage: parseInt(page) });
  } catch (error) {
    console.error("Inbox Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
}

// 2. Get Sent
async function getAdminSent(req, res) {
  try {
    const { page = 1, limit = 10, search = "" } = req.query;
    const userId = getCurrentUserId(req);

    const query = { from: userId };
    if (search) query.message = { $regex: search, $options: "i" };

    const messages = await Message.find(query)
      .sort({ timestamp: -1 })
      .skip((parseInt(page) - 1) * parseInt(limit))
      .limit(parseInt(limit));

    const totalMessages = await Message.countDocuments(query);
    const enrichedMessages = await enrichMessages(messages, userId);

    res.json({ success: true, messages: enrichedMessages, totalPages: Math.ceil(totalMessages / parseInt(limit)), currentPage: parseInt(page) });
  } catch (error) {
    console.error("Sent Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
}

// 3. Get Options
async function getComposeOptions(req, res) {
  try {
    const companies = await Company.find({ active: "active" }).select('c_id cname').lean();
    
    const salesManagers = await Employee.find({ 
      role: { $regex: /sales manager|manager/i }, 
      status: "active" 
    }).select('e_id f_name last_name').lean();
    
    const salesmen = await Employee.find({ 
      role: { $regex: /salesman/i }, 
      status: "active" 
    }).select('e_id f_name last_name').lean();
    
    const branches = await Branch.find({ active: "active" }).select('bid b_name').lean();

    res.json({ success: true, companies, salesManagers, salesmen, branches });
  } catch (error) {
    console.error("Error fetching options:", error);
    res.status(500).json({ success: false, message: error.message });
  }
}

// 4. Send Message
async function sendAdminMessage(req, res) {
  try {
    const { category, to, message, branch_id } = req.body;
    
    // FIX: Robust ID checking
    let from = getCurrentUserId(req);

    // Safety fallback: if ID is somehow still null but they passed auth,
    // and they are an owner, default to "admin" string.
    if (!from && (req.user.role === 'owner' || req.user.role === 'admin')) {
        from = "admin";
    }

    if (!from) {
        return res.status(401).json({ success: false, message: "User ID could not be determined." });
    }

    if (!message) return res.status(400).json({ success: false, message: "Message content required" });

    let newMessage = { from, message, timestamp: new Date() };

    if (category === "all_salesman") {
      newMessage.to = "all_salesman";
      newMessage.category = "salesman";
      if (branch_id) newMessage.branch_id = branch_id;
    } 
    else if (category === "all_sales_manager") {
      newMessage.to = "all_sales_manager";
      newMessage.category = "sales_manager";
    }
    else if (category === "all_companies") {
      newMessage.to = "all_companies";
      newMessage.category = "company";
    }
    else if (category === "all_customers") {
      newMessage.to = "all_customers";
      newMessage.category = "customer";
    }
    else if (category === "specific_company") {
      if(!to) return res.status(400).json({success: false, message: "Select a company"});
      newMessage.to = to;
      newMessage.category = "company";
      newMessage.c_id = to;
    }
    else if (category === "specific_sales_manager") {
      if(!to) return res.status(400).json({success: false, message: "Select a manager"});
      newMessage.to = to;
      newMessage.category = "sales_manager";
      newMessage.emp_id = to;
    }
    else if (category === "specific_salesman") {
      if(!to) return res.status(400).json({success: false, message: "Select a salesman"});
      newMessage.to = to;
      newMessage.category = "salesman";
      newMessage.emp_id = to;
    }
    else {
      return res.status(400).json({ success: false, message: "Invalid category" });
    }

    const saved = await Message.create(newMessage);
    
    // Enrich before socket emit
    const enrichedForSocket = await enrichMessages([saved], from);
    
    if (req.io) {
      req.io.emit("newMessage", enrichedForSocket[0]);
    }

    res.json({ success: true, message: "Sent successfully" });
  } catch (error) {
    console.error("Send Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
}

module.exports = { getAdminInbox, getAdminSent, getComposeOptions, sendAdminMessage };