//path:-server/controllers/ContactUsController.js
const Message = require('../models/message');

exports.submitContact = async (req, res) => {
  try {
    const { phone, email, message } = req.body;

    // 1. Server-side Validation
    if (!phone || !email || !message) {
      return res.status(400).json({ success: false, message: "All fields are required." });
    }

    const phonePattern = /^\+?([0-9]{1,3})?[-. ]?([0-9]{3})[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/;
    if (!phonePattern.test(phone)) {
      return res.status(400).json({ success: false, message: "Please enter a valid phone number." });
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
      return res.status(400).json({ success: false, message: "Please enter a valid email address." });
    }

    if (message.length < 10) {
      return res.status(400).json({ success: false, message: "Message must be at least 10 characters long." });
    }

    // 2. Encapsulate details into the message body (matching EJS logic)
    // Since Message Schema doesn't have phone/email fields, we wrap them in the text.
    const encapsulatedMessage = `Phone: ${phone}\nEmail: ${email}\nMessage: ${message}`;

    // 3. Create the Message Object
    const newMessage = new Message({
      from: "anonymous", // Identified as anonymous guest
      to: "admin",       // Directed to admin
      category: "contact_us",
      message: encapsulatedMessage,
      timestamp: new Date()
    });

    // 4. Save to Database
    await newMessage.save();

    // 5. Emit Real-time Socket Event
    // This allows the Admin to get a popup instantly
    const io = req.io;
    if (io) {
      io.emit("newMessage", {
        from: newMessage.from,
        to: newMessage.to,
        category: newMessage.category,
        message: newMessage.message,
        timestamp: newMessage.timestamp
      });
    }

    res.status(200).json({ success: true, message: "Message sent successfully!" });

  } catch (error) {
    console.error("Error submitting contact form:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};