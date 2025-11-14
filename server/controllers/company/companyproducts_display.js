// controllers/company/companyproducts_display.js
const Product = require("../../models/products");
const { v4: uuidv4 } = require('uuid');
const path = require('path');

async function companyproducts_display(req, res) {
  try {
    const products = await Product.find({ Com_id: req.user.c_id }).lean();
    res.json({ products });
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

async function getProductById(req, res) {
  try {
    const product = await Product.findOne({ 
      prod_id: req.params.prod_id, 
      Com_id: req.user.c_id 
    }).lean();
    
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.json({ product });
  } catch (error) {
    console.error("Error fetching product:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

async function addProduct(req, res) {
  try {
    const {
      Prod_name,
      Model_no,
      prod_year,
      stock,
      stockavailability,
      prod_description,
      Retail_price,
      warrantyperiod,
      installation,
      installationType,
      installationcharge
    } = req.body;

    // Get Com_id and com_name from authenticated user
    const Com_id = req.user.c_id;
    const com_name = req.user.name;

    // Map uploaded files to their paths
    // Files will be in frontend/public/uploads/
    const prod_photos = req.files ? req.files.map(file => `/uploads/${file.filename}`) : [];

    const product = new Product({
      prod_id: `PROD-${uuidv4().slice(0, 8)}`,
      Prod_name,
      Com_id,
      Model_no,
      com_name,
      prod_year,
      stock,
      stockavailability,
      Status: 'Hold',
      prod_description,
      Retail_price,
      miniselling: "1",
      warrantyperiod,
      installation,
      installationType: installation === 'Required' ? installationType : null,
      installationcharge: installationType === 'Paid' ? installationcharge : null,
      prod_photos
    });

    await product.save();
    res.status(201).json({ success: true, product });
  } catch (error) {
    console.error("Error adding product:", error);
    res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
  }
}

async function updateStockAvailability(req, res) {
  try {
    const { stockavailability } = req.body;
    const { prod_id } = req.params;

    if (!['instock', 'outofstock'].includes(stockavailability)) {
      return res.status(400).json({ success: false, message: "Invalid stock availability value" });
    }

    const product = await Product.findOneAndUpdate(
      { prod_id, Com_id: req.user.c_id },
      { stockavailability },
      { new: true }
    );

    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found or not accessible" });
    }

    res.json({ success: true, product });
  } catch (error) {
    console.error("Error updating stock availability:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
}

module.exports = {
  companyproducts_display,
  getProductById,
  addProduct,
  updateStockAvailability
};