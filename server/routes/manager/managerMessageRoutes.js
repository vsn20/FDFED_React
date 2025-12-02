const express = require('express');
const router = express.Router();

const {
  getInbox,
  getSent,
  getRecipients,
  sendMessage
} = require('../../controllers/manager/managerMessagesController');

const { protect, authorize } = require('../../middleware/authMiddleware');

// All routes are protected and restricted to 'manager' role
router.use(protect, authorize('manager')); 

// Route to get inbox messages
router.route('/inbox')
  .get(getInbox);

// Route to get sent messages
router.route('/sent')
  .get(getSent);

// Route to get available recipients (Companies & Branch Salesmen)
router.route('/recipients')
  .get(getRecipients);

// Route to send a new message
router.route('/send')
  .post(sendMessage);

module.exports = router;