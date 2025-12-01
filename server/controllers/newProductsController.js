const Product = require("../models/products");

// @desc    Get new products (approved in last 15 days)
// @route   GET /api/newproducts
// @access  Public
exports.getNewProducts = async (req, res) => {
    try {
        // Get the current date dynamically
        const currentDate = new Date();
        
        // Calculate the date 15 days ago
        const fifteenDaysAgo = new Date(currentDate);
        fifteenDaysAgo.setDate(currentDate.getDate() - 15);

        // Fetch products that are accepted and approved within the last 15 days
        const acceptedProducts = await Product.find({
            Status: "Accepted",
            approvedAt: { $gte: fifteenDaysAgo, $lte: currentDate }
        }).lean();

        // Send JSON response
        res.json({
            success: true,
            data: acceptedProducts
        });
    } catch (error) {
        console.error("Error fetching new products:", error);
        res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
};