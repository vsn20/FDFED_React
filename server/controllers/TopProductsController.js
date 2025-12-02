//path:-/server/controllers/TopProductsController.js
const Product = require("../models/products");
const Sale = require("../models/sale"); // Ensure you have this model

// @desc    Get top products (Rating >= 4 and Sales >= 4)
// @route   GET /api/topproducts
// @access  Public
exports.getTopProducts = async (req, res) => {
    try {
        // Step 1: Fetch all accepted products
        const acceptedProducts = await Product.find({ Status: "Accepted" }).lean();
        
        if (!acceptedProducts || acceptedProducts.length === 0) {
            return res.json({
                success: true,
                data: []
            });
        }

        const topProducts = [];

        // Step 2: Loop through products to calculate metrics
        // Note: In a larger scale app, MongoDB Aggregation is preferred, 
        // but we are strictly following your existing logic loop here.
        for (const product of acceptedProducts) {
            // Fetch sales for this product
            // Make sure your Sale model has 'product_id' matching 'prod_id'
            const sales = await Sale.find({ product_id: product.prod_id }).lean();

            // Calculate sales count
            const salesCount = sales.length;

            // Calculate average rating
            const ratings = sales
                .filter(sale => sale.rating !== null && sale.rating !== undefined)
                .map(sale => sale.rating);
            
            const averageRating = ratings.length > 0
                ? (ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length).toFixed(1)
                : null;

            // Step 3: Filter Logic (Sales >= 4 AND Rating >= 4)
            if (salesCount >= 4 && averageRating && parseFloat(averageRating) >= 4) {
                topProducts.push({
                    ...product,
                    averageRating: averageRating,
                    salesCount: salesCount
                });
            }
        }

        // Step 4: Send JSON response
        res.json({
            success: true,
            data: topProducts
        });

    } catch (error) {
        console.error("Error fetching top products:", error);
        res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
};