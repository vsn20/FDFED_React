const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  from: {
    type: String,
    required: true
  },
  to: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  branch_id: {
    type: String,
    required: false // Optional field for all_salesman messages
  },
  c_id: {
    type: String,
    required: false
  },
  emp_id: {
    type: String,
    required: false
  }
});

module.exports = mongoose.model('Message', messageSchema);