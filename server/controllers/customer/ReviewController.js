//path:-/server/controllers/customer/ReviewController.js
const Sale = require("../../models/sale");
const Product = require("../../models/products");
const Company = require("../../models/company");

// @desc    Get all sales for review
// @route   GET /api/customer/reviews
exports.getReviews = async (req, res) => {
    try {
        const phone_number = req.user.id;

        const sales = await Sale.find({ phone_number }).sort({ sales_date: -1 }).lean();

        const formattedSales = await Promise.all(sales.map(async (sale) => {
            const product = await Product.findOne({ prod_id: sale.product_id }).lean();
            const company = await Company.findOne({ c_id: sale.company_id }).lean();
            
            return {
                _id: sale._id,
                sale_id: sale.sales_id,
                product_id: sale.product_id,
                product_name: product ? product.Prod_name : "Unknown Product",
                company_name: company ? company.cname : "Unknown Company",
                sales_date: sale.sales_date,
                rating: sale.rating, // Will be null if not reviewed
                review: sale.review
            };
        }));

        res.json(formattedSales);
    } catch (error) {
        console.error("Error fetching reviews:", error);
        res.status(500).json({ message: "Server Error" });
    }
};

// @desc    Submit or update a review
// @route   POST /api/customer/reviews
exports.submitReview = async (req, res) => {
    try {
        const phone_number = req.user.id;
        const { sale_id, rating, review } = req.body;

        if (!sale_id || !rating || !review) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const updatedSale = await Sale.findOneAndUpdate(
            { sales_id: sale_id, phone_number },
            { 
                rating: parseInt(rating), 
                review: review 
            },
            { new: true }
        );

        if (!updatedSale) {
            return res.status(404).json({ message: "Sale not found" });
        }

        res.json({ success: true, message: "Review submitted successfully" });

    } catch (error) {
        console.error("Error submitting review:", error);
        res.status(500).json({ message: "Server Error" });
    }
};