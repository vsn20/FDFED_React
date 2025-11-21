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

const Customer = mongoose.model("Customer", CustomerSchema);
module.exports = Customer;