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

// ============ DB OPTIMIZATION: INDEXES ============
// Compound index for inbox queries (sorted by time)
messageSchema.index({ to: 1, timestamp: -1 });
// Compound index for sent messages
messageSchema.index({ from: 1, timestamp: -1 });
// B-Tree index for branch-level message queries
messageSchema.index({ branch_id: 1 });
// ===================================================

module.exports = mongoose.model('Message', messageSchema);