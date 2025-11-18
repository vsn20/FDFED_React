const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  prod_id: { type: String, required: true, unique: true },
  Prod_name: { type: String, required: true },
  Com_id: { type: String, required: true },
  Model_no: { type: String, required: true },
  com_name: { type: String, required: true },
  prod_year: { type: String, required: true },
  
  // --- FIXES ---
  stock: { type: Number, required: true },
  Retail_price: { type: Number, required: true },
  // Purchase_price: { type: Number }, // Added this field
  miniselling: { type: Number, default: 1 },
  installationcharge: { type: Number, default: 0 },
  // -------------

  stockavailability: { 
    type: String, 
    enum: ['instock', 'outofstock'], 
    default: 'instock', 
    required: true 
  },
  Status: { type: String, enum: ['Hold', 'Accepted', 'Rejected'], default: 'Hold' },
  prod_description: { type: String, required: true },
  warrantyperiod: { type: String, required: true },
  installation: { type: String, required: true, enum: ['Required', 'Not Required'] },
  installationType: { type: String, enum: ['Paid', 'Free'] },
  prod_photos: [String],
  createdAt: { type: Date, default: Date.now },
  approvedAt: { type: Date }
});

module.exports = mongoose.model("Product", productSchema);