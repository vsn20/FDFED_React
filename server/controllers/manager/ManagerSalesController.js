const mongoose = require("mongoose");
const Sale = require("../../models/sale");
const Employee = require("../../models/employees");
const Company = require("../../models/company");
const Product = require("../../models/products");
const Branch = require("../../models/branches");
const Inventory = require("../../models/inventory");
const User = require("../../models/User");

// --- HELPER: Get Manager & Branch ID Safely ---
const getManagerDetails = async (req) => {
  try {
    // 1. Validate Request User
    if (!req.user || !req.user.id) {
      throw new Error("User not authenticated or invalid token payload");
    }

    const loginId = req.user.id; // This is 'userId' from User model (e.g., "MGR_LOGIN")
    console.log(`[getManagerDetails] Processing for Login ID: ${loginId}`);

    // 2. Resolve Employee ID from User Table
    // We must find the User record first to get the linked 'emp_id'
    const userDoc = await User.findOne({ userId: loginId });
    
    if (!userDoc) {
        // Fallback: If no User record (rare), maybe the token ID IS the emp_id? 
        // We check this just in case, but primary path is via User model.
        console.warn(`[Warning] No User found for userId: ${loginId}. Checking Employee directly.`);
    }

    const employeeId = userDoc ? userDoc.emp_id : loginId;

    if (!employeeId) {
        throw new Error(`No Employee ID (emp_id) linked to User: ${loginId}`);
    }

    // 3. Fetch Employee Document
    const employee = await Employee.findOne({ e_id: employeeId });

    if (!employee) {
      throw new Error(`Manager profile not found for Employee ID: ${employeeId}`);
    }

    // 4. Validate Role and Branch
    if (employee.role.toLowerCase() !== 'manager') {
       console.warn(`[Warning] User ${employee.e_id} has role '${employee.role}', expected 'manager'`);
    }

    if (!employee.bid) {
      throw new Error(`Manager ${employee.e_id} is not assigned to a branch (bid is null)`);
    }

    return employee;
  } catch (error) {
    console.error("[getManagerDetails] Error:", error.message);
    throw error; // Propagate to controller methods to send 500/400 response
  }
};

// --- CONTROLLERS ---

exports.getManagerSales = async (req, res) => {
  try {
    const manager = await getManagerDetails(req);
    const branchId = manager.bid;

    // Fetch sales (lean for performance)
    const sales = await Sale.find({ branch_id: branchId }).lean().sort({ sales_date: -1 });

    // Manually map relationships
    const formattedSales = await Promise.all(sales.map(async (sale) => {
        let salesmanName = "Unknown";
        let companyName = "Unknown";
        let productName = "Unknown";
        let branchName = "Unknown";

        // Fetch Salesman Name
        if (sale.salesman_id) {
            // Try finding by string ID (e_id)
            let sm = await Employee.findOne({ e_id: sale.salesman_id }).lean();
            // Fallback to ObjectId if legacy data exists
            if (!sm && mongoose.Types.ObjectId.isValid(sale.salesman_id)) {
                sm = await Employee.findById(sale.salesman_id).lean();
            }
            if (sm) salesmanName = `${sm.f_name} ${sm.last_name}`;
        }

        // Fetch Company Name
        if (sale.company_id) {
            const company = await Company.findOne({ c_id: sale.company_id }).lean();
            if (company) companyName = company.cname;
        }

        // Fetch Product Name
        if (sale.product_id) {
            const product = await Product.findOne({ prod_id: sale.product_id }).lean();
            if (product) productName = product.Prod_name;
        }

        return {
            ...sale,
            salesman_name: salesmanName,
            company_name: companyName,
            product_name: productName,
            branch_name: manager.bid // We know the branch name from context if needed, or fetch it
        };
    }));

    res.json(formattedSales);

  } catch (err) {
    console.error("[getManagerSales] Controller Error:", err.message);
    res.status(500).json({ message: err.message || "Server Error fetching sales" });
  }
};

exports.getSaleById = async (req, res) => {
  try {
    const manager = await getManagerDetails(req);
    
    const sale = await Sale.findOne({ sales_id: req.params.id, branch_id: manager.bid }).lean();
    if (!sale) return res.status(404).json({ message: "Sale not found" });

    // Populate details manually
    const salesman = await Employee.findOne({ e_id: sale.salesman_id }).lean();
    const company = await Company.findOne({ c_id: sale.company_id }).lean();
    const product = await Product.findOne({ prod_id: sale.product_id }).lean();
    const branch = await Branch.findOne({ bid: sale.branch_id }).lean();

    res.json({
        ...sale,
        salesman_name: salesman ? `${salesman.f_name} ${salesman.last_name}` : "Unknown",
        company_name: company ? company.cname : "Unknown",
        product_name: product ? product.Prod_name : "Unknown",
        model_number: product ? product.Model_no : "N/A",
        branch_name: branch ? branch.b_name : "Unknown"
    });
  } catch (err) {
    console.error("[getSaleById] Error:", err.message);
    res.status(500).json({ message: err.message });
  }
};

exports.addSale = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const manager = await getManagerDetails(req);
    const branchId = manager.bid;

    const {
      salesman_id, // This is the _id (ObjectId) from the dropdown in frontend
      customer_name,
      saledate,
      unique_code,
      company_id,
      product_id,
      purchased_price,
      sold_price,
      quantity,
      phone_number,
      address,
      installation,
      installationType,
      installationcharge
    } = req.body;

    // 1. Resolve Salesman ID (Dropdown gives _id, we need e_id for the Sale record)
    const salesmanDoc = await Employee.findById(salesman_id);
    if (!salesmanDoc) throw new Error("Selected salesman not found");
    const actualSalesmanId = salesmanDoc.e_id; 

    // 2. Validate Unique Code
    if (unique_code) {
      const existingSale = await Sale.findOne({ unique_code }).session(session);
      if (existingSale) {
        throw new Error(`Unique code '${unique_code}' already exists.`);
      }
    }

    // 3. Verify Company & Product
    const company = await Company.findOne({ c_id: company_id });
    if (!company) throw new Error("Company not found");

    const product = await Product.findOne({ prod_id: product_id });
    if (!product) throw new Error("Product not found");

    // 4. Check Inventory
    const inventory = await Inventory.findOne({
      branch_id: branchId,
      product_id: product_id
    }).session(session);

    const qty = parseInt(quantity);
    if (!inventory || inventory.quantity < qty) {
      throw new Error(`Insufficient stock. Available: ${inventory ? inventory.quantity : 0}`);
    }

    // 5. Update Inventory
    inventory.quantity -= qty;
    inventory.updatedAt = new Date();
    await inventory.save({ session });

    // 6. Create Sale
    const count = await Sale.countDocuments().session(session) + 1;
    const sales_id = `S${String(count).padStart(3, '0')}`;
    const amount = parseFloat(sold_price) * qty;
    const profit_or_loss = (parseFloat(sold_price) - parseFloat(purchased_price)) * qty;
    const installation_status = installation === 'Required' ? 'Pending' : null;

    const newSale = new Sale({
      sales_id,
      branch_id: branchId,
      salesman_id: actualSalesmanId, // Storing e_id
      company_id,
      product_id,
      customer_name,
      sales_date: saledate,
      unique_code: unique_code || `UC${String(count).padStart(3, '0')}`,
      purchased_price: parseFloat(purchased_price),
      sold_price: parseFloat(sold_price),
      quantity: qty,
      amount,
      profit_or_loss,
      phone_number,
      address,
      installation,
      installationType,
      installationcharge,
      installation_status
    });

    await newSale.save({ session });
    await session.commitTransaction();
    res.json({ success: true, message: "Sale added successfully", sale: newSale });

  } catch (error) {
    await session.abortTransaction();
    console.error("[addSale] Transaction Failed:", error.message);
    res.status(400).json({ message: error.message || "Error adding sale" });
  } finally {
    session.endSession();
  }
};

exports.updateSale = async (req, res) => {
    try {
        const manager = await getManagerDetails(req);
        const { customer_name, phone_number, address, installation_status } = req.body;
        
        const sale = await Sale.findOne({ sales_id: req.params.id, branch_id: manager.bid });
        if(!sale) return res.status(404).json({ message: "Sale not found" });

        if (customer_name) sale.customer_name = customer_name;
        if (phone_number) sale.phone_number = phone_number;
        if (address) sale.address = address;
        if (installation_status) sale.installation_status = installation_status;

        await sale.save();
        res.json({ success: true, message: "Sale updated", sale });
    } catch (err) {
        console.error("[updateSale] Error:", err.message);
        res.status(500).json({ message: err.message });
    }
}

// --- FORM DATA CONTROLLERS ---

exports.getSalesmen = async (req, res) => {
    try {
        const manager = await getManagerDetails(req);
        // Find salesmen in the same branch
        const salesmen = await Employee.find({ 
            bid: manager.bid, 
            role: "salesman", 
            status: "active" 
        }).select('f_name last_name e_id _id');
        
        res.json(salesmen);
    } catch (err) {
        console.error("[getSalesmen] Error:", err.message);
        res.status(500).json({ message: err.message });
    }
};

exports.getCompanies = async (req, res) => {
    try {
        // Just checking auth validity via manager check
        await getManagerDetails(req); 
        const companies = await Company.find({ active: "active" }).select('c_id cname');
        res.json(companies);
    } catch (err) {
        console.error("[getCompanies] Error:", err.message);
        res.status(500).json({ message: err.message });
    }
};

exports.getProductsByCompany = async (req, res) => {
    try {
        await getManagerDetails(req);
        const { companyId } = req.params;
        const products = await Product.find({ Com_id: companyId });
        res.json(products);
    } catch (err) {
        console.error("[getProductsByCompany] Error:", err.message);
        res.status(500).json({ message: err.message });
    }
};