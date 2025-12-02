const express = require('express');
const router = express.Router();
const { 
  getInbox, 
  getSent, 
  getBranchManager, 
  sendMessage 
} = require('../../controllers/salesman/salesmanMessagesController');
const { protect, authorize } = require('../../middleware/authMiddleware');

// All routes protected and only for 'salesman'
router.use(protect, authorize('salesman'));

router.get('/inbox', getInbox);
router.get('/sent', getSent);
router.get('/manager', getBranchManager); // To get the recipient for compose
router.post('/send', sendMessage);

module.exports = router;