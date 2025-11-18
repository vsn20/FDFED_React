const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema({
  order_id: { type: String, unique: true, required: true },
  branch_id: { type: String, required: true, ref: "Branch" },
  branch_name: { type: String, required: true },
  company_id: { type: String, required: true, ref: "Company" },
  company_name: { type: String, required: true },
  product_id: { type: String, required: true, ref: "Product" },
  product_name: { type: String, required: true },
  quantity: { type: Number, required: true },
  ordered_date: { type: Date, required: true },
  delivery_date: { type: Date, default: null },
  status: {
    type: String,
    enum: ["pending", "cancelled", "shipped", "delivered", "accepted"],
    default: "pending",
  },
  installation_type: { type: String, default: "None" },
}, { timestamps: true });

// Helper to format status consistently
OrderSchema.pre('save', function(next) {
  if (this.status) {
    this.status = this.status.toLowerCase();
  }
  next();
});

// This was missing from your files
module.exports = mongoose.models.Order || mongoose.model("Order", OrderSchema);