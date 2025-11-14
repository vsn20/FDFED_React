const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  prod_id: { type: String, required: true, unique: true },
  Prod_name: { type: String, required: true },
  Com_id: { type: String, required: true },
  Model_no: { type: String, required: true },
  com_name: { type: String, required: true },
  prod_year: { type: String, required: true },
  stock: { type: String, required: true },
  stockavailability: { 
    type: String, 
    enum: ['instock', 'outofstock'], 
    default: 'instock', 
    required: true 
  },
  Status: { type: String, enum: ['Hold', 'Accepted', 'Rejected'], default: 'Hold' },
  prod_description: { type: String, required: true },
  Retail_price: { type: String, required: true },
  miniselling: { type: String, default: "1" },
  warrantyperiod: { type: String, required: true },
  installation: { type: String, required: true, enum: ['Required', 'Not Required'] },
  installationType: { type: String, enum: ['Paid', 'Free'] },
  installationcharge: { type: String },
  prod_photos: [String],
  createdAt: { type: Date, default: Date.now },
  approvedAt: { type: Date }
});

module.exports = mongoose.model("Product", productSchema);