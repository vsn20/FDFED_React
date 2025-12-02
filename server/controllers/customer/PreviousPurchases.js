const Sale = require("../../models/sale");
const Product = require("../../models/products");
const Branch = require("../../models/branches"); 
const Company = require("../../models/company");

// @desc    Get all purchases for the logged-in customer
// @route   GET /api/customer/previouspurchases
// @access  Private (Customer)
exports.getCustomerPurchases = async (req, res) => {
    try {
        // 1. Get Phone Number from JWT Token
        const phoneNumber = req.user.id; 

        if (!phoneNumber) {
            return res.status(400).json({ message: "User identifier missing from token" });
        }

        // 2. Find sales for this phone number
        const sales = await Sale.find({ phone_number: phoneNumber })
            .sort({ sales_date: -1 })
            .lean(); // Faster read-only access

        if (!sales || sales.length === 0) {
            return res.json([]); 
        }

        // 3. Manually fetch details using CUSTOM IDs
        const formattedSales = await Promise.all(sales.map(async (sale) => {
            
            // Link Sale.product_id -> Product.prod_id
            const product = await Product.findOne({ prod_id: sale.product_id }).lean();
            
            // Link Sale.branch_id -> Branch.bid
            const branch = await Branch.findOne({ bid: sale.branch_id }).lean(); 
            
            // Link Sale.company_id -> Company.c_id
            const company = await Company.findOne({ c_id: sale.company_id }).lean();

            return {
                // Sale Details
                _id: sale._id,
                sales_id: sale.sales_id,
                amount: sale.amount,
                sales_date: sale.sales_date,
                installation: sale.installation,
                installation_status: sale.installation_status || "N/A",
                unique_code: sale.unique_code,
                address: sale.address,
                phone_number: sale.phone_number,

                // Joined Product Details
                product_name: product ? product.Prod_name : "Unknown Product",
                Model_no: product ? product.Model_no : "N/A",
                stock: product ? product.stock : 0,
                warrantyperiod: product ? product.warrantyperiod : "N/A",
                
                // Joined Company Details (Fallback to product's com_name if company lookup fails)
                company_name: company ? company.cname : (product ? product.com_name : "Unknown Company"),
                
                // Joined Branch Details
                branch_name: branch ? branch.b_name : "Unknown Branch"
            };
        }));

        res.json(formattedSales);

    } catch (error) {
        console.error("Error fetching customer purchases:", error);
        res.status(500).json({ message: "Server Error fetching purchases" });
    }
};