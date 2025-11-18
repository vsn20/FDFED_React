const Sale = require("../../models/sale");
const Company = require("../../models/company"); // Assuming you have this model
const Product = require("../../models/products"); // Assuming you have this model
const Employee = require("../../models/employees");
const Branch = require("../../models/branches");
const Inventory = require("../../models/inventory"); // Assuming you have this model
const User = require("../../models/User");
const mongoose = require("mongoose");

// Helper function to get emp_id from req.user
const getEmployeeId = async (req) => {
  if (!req.user || !req.user.id) {
    throw new Error("Unauthorized: No user found");
  }
  const user = await User.findOne({ userId: req.user.id }).lean();
  if (!user || !user.emp_id) {
    throw new Error("Employee ID not found for this user");
  }
  return user.emp_id;
};

// @desc    Get all sales for the logged-in salesman
// @route   GET /api/salesman/sales
// @access  Private (Salesman)
exports.getSalesData = async (req, res) => {
  try {
    const emp_id = await getEmployeeId(req);
    const employee = await Employee.findOne({ e_id: emp_id }).lean();
    if (!employee) {
      return res.status(404).json({ success: false, message: "Salesman not found" });
    }

    const sales = await Sale.find({ salesman_id: employee.e_id }).sort({ sales_date: -1 }).lean();

    const realSales = await Promise.all(
      sales.map(async (sale) => {
        const company = await Company.findOne({ c_id: sale.company_id }).lean();
        const product = await Product.findOne({ prod_id: sale.product_id }).lean();

        return {
          sales_id: sale.sales_id,
          company_name: company ? company.cname : "Unknown Company",
          product_name: product ? product.Prod_name : "Unknown Product",
          model_number: product ? product.Model_no : "N/A",
          total_amount: sale.amount,
          profit_or_loss: sale.profit_or_loss,
          saledate: sale.sales_date
        };
      })
    );

    res.json(realSales);
  } catch (error) {
    console.error("Error fetching sales data:", error.message);
    res.status(500).json({ success: false, message: error.message || "Server Error" });
  }
};

// @desc    Get details for a single sale
// @route   GET /api/salesman/sales/:sales_id
// @access  Private (Salesman)
exports.getSaleDetails = async (req, res) => {
  try {
    const emp_id = await getEmployeeId(req);
    const employee = await Employee.findOne({ e_id: emp_id }).lean();
    if (!employee) {
      return res.status(404).json({ success: false, message: "Salesman not found" });
    }

    const sale = await Sale.findOne({
      sales_id: req.params.sales_id,
      salesman_id: emp_id
    }).lean();

    if (!sale) {
      return res.status(404).json({ success: false, message: "Sale not found" });
    }

    const company = await Company.findOne({ c_id: sale.company_id }).lean();
    const product = await Product.findOne({ prod_id: sale.product_id }).lean();
    const branch = await Branch.findOne({ bid: employee.bid }).lean();

    res.json({
      ...sale,
      company_name: company ? company.cname : "Unknown Company",
      product_name: product ? product.Prod_name : "Unknown Product",
      model_number: product ? product.Model_no : "N/A",
      salesman_name: `${employee.f_name} ${employee.last_name}`,
      branch_name: branch ? branch.b_name : "Unknown Branch",
      total_amount: sale.amount,
      saledate: sale.sales_date,
      price: sale.sold_price
    });
  } catch (error) {
    console.error("Error fetching sale details:", error.message);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// @desc    Add a new sale
// @route   POST /api/salesman/sales
// @access  Private (Salesman)
exports.addSale = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const emp_id = await getEmployeeId(req);
    const employee = await Employee.findOne({ e_id: emp_id });
    if (!employee) {
      await session.abortTransaction();
      return res.status(404).json({ success: false, message: "Salesman not found" });
    }

    const {
      customer_name,
      sales_date,
      unique_code,
      company_id,
      product_id,
      purchased_price,
      sold_price,
      quantity,
      phone_number,
      address
    } = req.body;

    // Validate unique_code
    const existingSale = await Sale.findOne({ unique_code }).session(session);
    if (existingSale) {
      await session.abortTransaction();
      return res.status(400).json({ success: false, message: `Unique code ${unique_code} already exists.` });
    }

    // Validate company and product
    const company = await Company.findOne({ c_id: company_id }).lean();
    const product = await Product.findOne({ prod_id: product_id }).lean();
    if (!company || !product) {
      await session.abortTransaction();
      return res.status(400).json({ success: false, message: "Company or Product not found" });
    }

    // Validate inventory
    const inventory = await Inventory.findOne({
      branch_id: employee.bid,
      product_id,
      company_id
    }).session(session);
    if (!inventory || inventory.quantity < parseInt(quantity)) {
      await session.abortTransaction();
      return res.status(400).json({ success: false, message: `Insufficient inventory for ${product.Prod_name} (Available: ${inventory ? inventory.quantity : 0})` });
    }

    // Generate sales_id
    const count = await Sale.countDocuments().session(session) + 1;
    const sales_id = `S${String(count).padStart(3, '0')}`;

    // Calculate
    const amount = parseFloat(sold_price) * parseInt(quantity);
    const profit_or_loss = (parseFloat(sold_price) - parseFloat(purchased_price)) * parseInt(quantity);

    // Get installation details from product
    const installation = product.installation || 'Not Required';
    const installationType = product.installationType || null;
    const installationcharge = product.installationcharge || null;
    const installation_status = installation === 'Required' ? 'Pending' : null;

    // Create new Sale
    const newSale = new Sale({
      sales_id,
      branch_id: employee.bid,
      salesman_id: employee.e_id,
      company_id: company.c_id,
      product_id: product.prod_id,
      customer_name,
      sales_date: new Date(sales_date),
      unique_code,
      purchased_price: parseFloat(purchased_price),
      sold_price: parseFloat(sold_price),
      quantity: parseInt(quantity),
      amount,
      profit_or_loss,
      phone_number,
      address,
      installation,
      installationType,
      installationcharge,
      installation_status
    });

    // Update inventory
    inventory.quantity -= parseInt(quantity);
    inventory.updatedAt = new Date();
    
    await newSale.save({ session });
    await inventory.save({ session });
    
    await session.commitTransaction();
    res.json({ success: true, message: "Sale added successfully" });
  } catch (error) {
    await session.abortTransaction();
    console.error("Error adding sale:", error.message);
    res.status(500).json({ success: false, message: `Failed to add sale: ${error.message}` });
  } finally {
    session.endSession();
  }
};

// --- Helper Functions for AddSale Form ---

// @desc    Get all active companies
// @route   GET /api/salesman/sales/helpers/companies
// @access  Private (Salesman)
exports.getCompanies = async (req, res) => {
  try {
    const companies = await Company.find({ active: "active" }).lean();
    res.json(companies.map(company => ({
      c_id: company.c_id,
      cname: company.cname
    })));
  } catch (error) {
    console.error("Error fetching companies:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// @desc    Get products for a specific company
// @route   GET /api/salesman/sales/helpers/products-by-company/:companyId
// @access  Private (Salesman)
exports.getProductsByCompany = async (req, res) => {
  try {
    const products = await Product.find({ 
      company_id: req.params.companyId,
      // You might want to add other filters, e.g., active: true
    }).lean();
    
    // Send only the data needed by the frontend
    res.json(products.map(p => ({
      prod_id: p.prod_id,
      Prod_name: p.Prod_name,
      Model_no: p.Model_no,
      Retail_price: p.Retail_price,
      installation: p.installation,
      installationType: p.installationType,
      installationcharge: p.installationcharge
    })));
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// @desc    Check if unique code exists
// @route   POST /api/salesman/sales/helpers/check-unique-code
// @access  Private (Salesman)
exports.checkUniqueCode = async (req, res) => {
  try {
    const { unique_code } = req.body;
    const existingSale = await Sale.findOne({ unique_code }).lean();
    res.json({ isUnique: !existingSale });
  } catch (error) {
    console.error("Error checking unique code:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// @desc    Check inventory for a product
// @route   POST /api/salesman/sales/helpers/check-inventory
// @access  Private (Salesman)
exports.checkInventory = async (req, res) => {
  try {
    const emp_id = await getEmployeeId(req);
    const employee = await Employee.findOne({ e_id: emp_id });
    if (!employee) {
      return res.status(404).json({ success: false, message: "Salesman not found" });
    }

    const { product_id, company_id, quantity } = req.body;
    const inventory = await Inventory.findOne({
      branch_id: employee.bid,
      product_id,
      company_id
    }).lean();

    if (!inventory || inventory.quantity < parseInt(quantity)) {
      return res.json({
        isAvailable: false,
        availableQuantity: inventory ? inventory.quantity : 0
      });
    }

    res.json({ isAvailable: true, availableQuantity: inventory.quantity });
  } catch (error) {
    console.error("Error checking inventory:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};