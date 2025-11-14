const Product = require('../../models/products'); // Assuming 'products.js' is in '../models/'

/**
 * Fetch all products with status 'Accepted'
 */
async function getAcceptedProducts(req, res) {
  try {
    const products = await Product.find({ Status: 'Accepted' }).lean();
    res.json(products);
  } catch (error) {
    console.error("Error fetching accepted products:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

/**
 * Fetch all products with status 'Rejected'
 */
async function getRejectedProducts(req, res) {
  try {
    const products = await Product.find({ Status: 'Rejected' }).lean();
    res.json(products);
  } catch (error) {
    console.error("Error fetching rejected products:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

/**
 * Fetch all products with status 'Hold' (New products)
 */
async function getNewProducts(req, res) {
  try {
    const products = await Product.find({ Status: 'Hold' }).lean();
    res.json(products);
  } catch (error) {
    console.error("Error fetching new products:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

/**
 * Fetch a single product by its prod_id
 */
async function getProductById(req, res) {
  try {
    const prod_id = req.params.prod_id;
    const product = await Product.findOne({ prod_id }).lean();
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }
    res.json(product);
  } catch (error)
 {
    console.error("Error fetching product data:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

/**
 * Update a product's status
 */
async function updateProductStatus(req, res) {
  try {
    const prod_id = req.params.prod_id;
    const { status } = req.body;

    // Validate status
    if (!['Accepted', 'Rejected', 'Hold'].includes(status)) {
      return res.status(400).json({ success: false, error: "Invalid status value" });
    }

    const product = await Product.findOne({ prod_id });
    if (!product) {
      return res.status(404).json({ success: false, error: "Product not found" });
    }

    product.Status = status;

    // Update approvedAt timestamp based on status
    if (status === 'Accepted') {
      product.approvedAt = new Date();
    } else {
      product.approvedAt = null; // Set to null if 'Rejected' or 'Hold'
    }

    await product.save();
    res.json({ success: true, message: "Product status updated successfully", product });
  } catch (error) {
    console.error("Error updating product status:", error);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
}

module.exports = {
  getAcceptedProducts,
  getRejectedProducts,
  getNewProducts,
  getProductById,
  updateProductStatus
};