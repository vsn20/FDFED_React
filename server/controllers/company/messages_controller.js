const Message = require("../../models/message");
const Employee = require("../../models/employees");
const Company = require("../../models/company");

// Helper to enrich message data (resolve IDs to Names)
async function enrichMessages(messages, currentCompanyId) {
  const enriched = [];
  
  for (let msg of messages) {
    let msgObj = msg.toObject ? msg.toObject() : msg;

    // Resolve SENDER (From)
    if (msgObj.from === currentCompanyId) {
      msgObj.fromDisplay = "You";
    } else if (msgObj.emp_id) {
      const emp = await Employee.findOne({ e_id: msgObj.from }).select('f_name last_name').lean();
      msgObj.fromDisplay = emp ? `${msgObj.from} - ${emp.f_name} ${emp.last_name}` : msgObj.from;
    } else if (msgObj.c_id && msgObj.c_id !== currentCompanyId) {
      const comp = await Company.findOne({ c_id: msgObj.from }).select('cname').lean();
      msgObj.fromDisplay = comp ? `${msgObj.from} - ${comp.cname}` : msgObj.from;
    } else {
      msgObj.fromDisplay = msgObj.from;
    }

    // Resolve RECIPIENT (To)
    if (msgObj.to === currentCompanyId) {
      msgObj.toDisplay = "You";
    } else if (msgObj.to === "all_companies") {
      msgObj.toDisplay = "All Companies";
    } else if (msgObj.to === "all_sales_manager") {
      msgObj.toDisplay = "All Sales Managers";
    } else if (msgObj.to === "admin") {
      msgObj.toDisplay = "Admin";
    } else {
      const emp = await Employee.findOne({ e_id: msgObj.to }).select('f_name last_name').lean();
      msgObj.toDisplay = emp ? `${msgObj.to} - ${emp.f_name} ${emp.last_name}` : msgObj.to;
    }

    enriched.push(msgObj);
  }
  return enriched;
}

// 1. Get Inbox
async function getInbox(req, res) {
  try {
    const { page = 1, limit = 10, search = "" } = req.query;
    const c_id = req.user.c_id;

    const query = {
      $or: [
        { to: c_id },
        { to: "all_companies" }
      ]
    };

    if (search) {
      query.$and = [
        {
          $or: [
            { message: { $regex: search, $options: "i" } },
            { from: { $regex: search, $options: "i" } }
          ]
        }
      ];
    }

    const messages = await Message.find(query)
      .sort({ timestamp: -1 })
      .skip((parseInt(page) - 1) * parseInt(limit))
      .limit(parseInt(limit));

    const totalMessages = await Message.countDocuments(query);
    const enrichedMessages = await enrichMessages(messages, c_id);

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
}

// 2. Get Sent Messages
async function getSent(req, res) {
  try {
    const { page = 1, limit = 10, search = "" } = req.query;
    const c_id = req.user.c_id;

    const query = { from: c_id };

    if (search) {
      query.message = { $regex: search, $options: "i" };
    }

    const messages = await Message.find(query)
      .sort({ timestamp: -1 })
      .skip((parseInt(page) - 1) * parseInt(limit))
      .limit(parseInt(limit));

    const totalMessages = await Message.countDocuments(query);
    const enrichedMessages = await enrichMessages(messages, c_id);

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
}

// 3. Get Sales Managers (FIXED: Checks for both 'Sales Manager' and 'manager')
async function getSalesManagers(req, res) {
  try {
    // Queries for either "Sales Manager" OR "manager" (case insensitive)
    const managers = await Employee.find({ 
      role: { $in: ["Sales Manager", "manager", "Manager"] }, 
      status: "active" 
    })
      .select('e_id f_name last_name')
      .lean();

    res.json({ success: true, managers });
  } catch (error) {
    console.error("Error fetching managers:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
}

// 4. Send Message
async function sendMessage(req, res) {
  try {
    const { category, to, message } = req.body;
    const from = req.user.c_id;

    if (!message) {
      return res.status(400).json({ success: false, message: "Message content is required" });
    }

    const newMessage = {
      from,
      to: category === 'specific_sales_manager' ? to : category,
      category,
      message,
      timestamp: new Date(),
      c_id: from
    };

    if (category === "admin") {
      newMessage.to = "admin";
    } else if (category === "all_sales_manager") {
      newMessage.to = "all_sales_manager";
    } else if (category === "specific_sales_manager") {
      if (!to) return res.status(400).json({ success: false, message: "Recipient required" });
      newMessage.emp_id = to;
    } else {
      return res.status(400).json({ success: false, message: "Invalid category" });
    }

    await Message.create(newMessage);

    // Socket.io emission
    const io = req.io;
    if (io) {
      io.emit("newMessage", {
        from: newMessage.from,
        to: newMessage.to,
        message: newMessage.message,
        timestamp: newMessage.timestamp
      });
    }

    res.json({ success: true, message: "Message sent successfully" });

  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
}

module.exports = {
  getInbox,
  getSent,
  getSalesManagers,
  sendMessage
};