const mongoose = require("mongoose");

const ComplaintSchema = new mongoose.Schema({
  complaint_id: {
    type: String,
    unique: true,
    required: true
  },
  sale_id: {
    type: String,
    ref: "Sale",
    required: true
  },
  product_id: {
    type: String,
    ref: "Product",
    required: true
  },
  company_id: {
    type: String,
    ref: "Company",
    required: true
  },
  complaint_info: {
    type: String,
    required: true
  },
  complaint_date: {
    type: Date,
    default: Date.now
  },
  phone_number: {
    type: String,
    required: true,
    match: [/^\+?[1-9]\d{1,14}$/, "Please enter a valid phone number"]
  },
  status: {
    type: String,
    enum: ["Open", "Closed"],
    default: "Open"
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// ============ DB OPTIMIZATION: INDEXES ============
// Compound index for company complaint filtering
ComplaintSchema.index({ company_id: 1, status: 1 });
// B-Tree index for customer complaint lookup by phone
ComplaintSchema.index({ phone_number: 1 });
// ===================================================

const Complaint = mongoose.model("Complaint", ComplaintSchema);
module.exports = Complaint;