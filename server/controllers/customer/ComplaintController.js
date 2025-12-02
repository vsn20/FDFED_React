const Complaint = require("../../models/complaint");
const Sale = require("../../models/sale");
const Product = require("../../models/products");
const Company = require("../../models/company");

// @desc    Get all complaints for logged-in user
// @route   GET /api/customer/complaints
exports.getComplaints = async (req, res) => {
  try {
    const phone_number = req.user.id;

    const complaints = await Complaint.find({ phone_number }).sort({ createdAt: -1 }).lean();

    const formattedComplaints = await Promise.all(
      complaints.map(async (complaint) => {
        const product = await Product.findOne({ prod_id: complaint.product_id }).lean();
        const company = await Company.findOne({ c_id: complaint.company_id }).lean();
        
        return {
            _id: complaint._id,
            complaint_id: complaint.complaint_id,
            sale_id: complaint.sale_id,
            product_name: product ? product.Prod_name : "Unknown Product",
            company_name: company ? company.cname : "Unknown Company",
            complaint_date: complaint.complaint_date,
            status: complaint.status,
            complaint_info: complaint.complaint_info
        };
      })
    );

    res.json(formattedComplaints);
  } catch (error) {
    console.error("Error fetching complaints:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// @desc    Get ALL sales for filing a complaint (Constraints removed)
// @route   GET /api/customer/complaints/eligible
exports.getEligibleSales = async (req, res) => {
  try {
    const phone_number = req.user.id;

    // 1. Fetch ALL sales for this user (Removed installation_status constraint)
    const sales = await Sale.find({ phone_number }).sort({ sales_date: -1 }).lean();

    // 2. Map details (Removed existingComplaint check)
    const eligibleSales = await Promise.all(sales.map(async (sale) => {
        const product = await Product.findOne({ prod_id: sale.product_id }).lean();
        const company = await Company.findOne({ c_id: sale.company_id }).lean();

        return {
            sale_id: sale.sales_id,
            product_id: sale.product_id,
            company_id: sale.company_id,
            product_name: product ? product.Prod_name : "Unknown Product",
            model_no: product ? product.Model_no : "N/A",
            company_name: company ? company.cname : "Unknown Company",
            sales_date: sale.sales_date
        };
    }));

    res.json(eligibleSales);
  } catch (error) {
    console.error("Error fetching eligible sales:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// @desc    Create a new complaint
// @route   POST /api/customer/complaints/add
exports.addComplaint = async (req, res) => {
  try {
    const phone_number = req.user.id;
    const { sale_id, complaint_info } = req.body;

    if (!sale_id || !complaint_info) {
      return res.status(400).json({ message: "Sale ID and description are required" });
    }

    // 1. Verify Sale Ownership
    const sale = await Sale.findOne({ sales_id: sale_id, phone_number }).lean();
    if (!sale) {
      return res.status(404).json({ message: "Sale not found" });
    }

    // REMOVED: Check for duplicate complaint
    // We now allow multiple complaints per sale if needed.

    // 2. Generate Sequential ID (C001, C002...)
    const count = await Complaint.countDocuments() + 1;
    const complaint_id = `C${String(count).padStart(3, "0")}`;

    // 3. Create Complaint
    const newComplaint = new Complaint({
      complaint_id,
      sale_id,
      product_id: sale.product_id,
      company_id: sale.company_id,
      complaint_info,
      phone_number,
      status: "Open",
    });

    await newComplaint.save();

    res.status(201).json({ success: true, message: "Complaint submitted successfully", complaint: newComplaint });

  } catch (error) {
    console.error("Error adding complaint:", error);
    res.status(500).json({ message: "Server Error" });
  }
};