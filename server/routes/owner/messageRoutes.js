const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../../middleware/authMiddleware");

// Import the controller
const {
  getAdminInbox,
  getAdminSent,
  getComposeOptions,
  sendAdminMessage
} = require("../../controllers/owner/messages_controller");

// MESSAGE ROUTES

// FIX: Removed "/messages" from here because it is already defined in server.js
// Final URL will be: /api/owner/messages/inbox
router.get("/inbox", protect, authorize('owner', 'admin'), getAdminInbox);

// Final URL will be: /api/owner/messages/sent
router.get("/sent", protect, authorize('owner', 'admin'), getAdminSent);

// Final URL will be: /api/owner/messages/options
router.get("/options", protect, authorize('owner', 'admin'), getComposeOptions);

// Final URL will be: /api/owner/messages/send
router.post("/send", protect, authorize('owner', 'admin'), sendAdminMessage);

module.exports = router;