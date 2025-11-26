const mongoose = require("mongoose");

const InventorySchema = new mongoose.Schema({
  branch_id: { type: String, ref: "Branch", required: true },
  branch_name: { type: String, required: true },
  product_id: { type: String, ref: "Product", required: true },
  product_name: { type: String, required: true },
  company_id: { type: String, ref: "Company", required: true },
  company_name: { type: String, required: true },
  model_no: { type: String, required: true },
  quantity: { type: Number, required: true, default: 0 },
  updatedAt: { type: Date, default: Date.now }
});

InventorySchema.index({ branch_id: 1, product_id: 1, company_id: 1 }, { unique: true });

module.exports = mongoose.models.Inventory || mongoose.model("Inventory", InventorySchema);