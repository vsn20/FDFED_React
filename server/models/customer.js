const mongoose = require("mongoose");

const CustomerSchema = new mongoose.Schema({
  customer_id: {
    type: String,
    unique: true,
    required: true
  },
  first_name: {
    type: String,
    required: true
  },
  last_name: {
    type: String,
    required: true
  },
  phno: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  createdBy: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// ============ DB OPTIMIZATION: INDEXES ============
// B-Tree index for customer login by phone number
CustomerSchema.index({ phno: 1 });
// ===================================================

const Customer = mongoose.model("Customer", CustomerSchema);
module.exports = Customer;