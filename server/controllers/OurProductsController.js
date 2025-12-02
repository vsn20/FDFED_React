//path:-server/controllers/OurProductsController.js
const Product = require("../models/products");

// @desc    Get all accepted products
// @route   GET /api/ourproducts
// @access  Public
exports.getOurProducts = async (req, res) => {
    try {
        // Fetch all products with Status: "Accepted"
        const acceptedProducts = await Product.find({ Status: "Accepted" }).lean();

        // Send JSON response
        res.json({
            success: true,
            data: acceptedProducts
        });
    } catch (error) {
        console.error("Error fetching our products:", error);
        res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
};