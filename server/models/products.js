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
  rejection_reason: { type: String, default: null },
  prod_description: { type: String, required: true },
  warrantyperiod: { type: String, required: true },
  installation: { type: String, required: true, enum: ['Required', 'Not Required'] },
  installationType: { type: String, enum: ['Paid', 'Free'] },
  prod_photos: [String],
  createdAt: { type: Date, default: Date.now },
  approvedAt: { type: Date }
});

// ============ DB OPTIMIZATION: INDEXES ============
// B-Tree index for filtering products by Status (used in getOurProducts, getTopProducts)
productSchema.index({ Status: 1 });
// Compound index for company product listings
productSchema.index({ Com_id: 1, Status: 1 });
// Text index for full-text search (Solr-like search experience)
productSchema.index({ Prod_name: 'text', prod_description: 'text', com_name: 'text' });
// ===================================================

module.exports = mongoose.model("Product", productSchema);