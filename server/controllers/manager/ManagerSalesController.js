const mongoose = require("mongoose");
const Sale = require("../../models/sale");
const Employee = require("../../models/employees");
const Company = require("../../models/company");
const Product = require("../../models/products");
const Branch = require("../../models/branches");
const Inventory = require("../../models/inventory");
const User = require("../../models/User");
const SalesPaymentIntent = require("../../models/salesPaymentIntent");
const Razorpay = require("razorpay");
const crypto = require("crypto");
const sendInvoiceEmail = require("../../utils/invoiceMailer");

// --- HELPER: Get Manager & Branch ID Safely ---
const getManagerDetails = async (req) => {
  try {
    if (!req.user || !req.user.id) {
      throw new Error("User not authenticated or invalid token payload");
    }

    const loginId = req.user.id;
    console.log(`[getManagerDetails] Processing for Login ID: ${loginId}`);

    const userDoc = await User.findOne({ userId: loginId });

    if (!userDoc) {
      console.warn(`[Warning] No User found for userId: ${loginId}. Checking Employee directly.`);
    }

    const employeeId = userDoc ? userDoc.emp_id : loginId;

    if (!employeeId) {
      throw new Error(`No Employee ID (emp_id) linked to User: ${loginId}`);
    }

    // Always find employee by e_id (string custom ID)
    const employee = await Employee.findOne({ e_id: employeeId });

    if (!employee) {
      throw new Error(`Manager profile not found for Employee ID: ${employeeId}`);
    }

    if (employee.role.toLowerCase() !== "manager") {
      console.warn(`[Warning] User ${employee.e_id} has role '${employee.role}', expected 'manager'`);
    }

    if (!employee.bid) {
      throw new Error(`Manager ${employee.e_id} is not assigned to a branch (bid is null)`);
    }

    return employee;
  } catch (error) {
    console.error("[getManagerDetails] Error:", error.message);
    throw error;
  }
};

// --- HELPER: Find Employee by ObjectId OR e_id ---
// Website sends MongoDB _id (ObjectId); Swagger/API sends e_id string like "EMP005"
const findEmployeeByIdOrEid = async (salesman_id, session) => {
  let salesmanDoc = null;

  // Try ObjectId lookup first (used by website dropdown)
  if (mongoose.Types.ObjectId.isValid(salesman_id)) {
    salesmanDoc = await Employee.findById(salesman_id).session(session);
  }

  // Fallback: try e_id string lookup (used by direct API / Swagger)
  if (!salesmanDoc) {
    salesmanDoc = await Employee.findOne({ e_id: salesman_id }).session(session);
  }

  return salesmanDoc;
};

const getRazorpayClient = () => {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    throw new Error("Razorpay is not configured. Add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET.");
  }

  return new Razorpay({ key_id: keyId, key_secret: keySecret });
};

// --- HELPER: Resolve all context needed to create a sale ---
const resolveManagerSaleContext = async ({ payload, manager, session, validateUnique = true }) => {
  const {
    salesman_id,
    unique_code,
    company_id,
    product_id,
    quantity,
    sold_price,
    purchased_price
  } = payload;

  // FIX: Use dual-lookup helper instead of findById only
  const salesmanDoc = await findEmployeeByIdOrEid(salesman_id, session);
  if (!salesmanDoc) throw new Error("Selected salesman not found");

  // Validate salesman belongs to the same branch as manager
  if (salesmanDoc.bid !== manager.bid) {
    throw new Error("Selected salesman does not belong to your branch");
  }

  // Validate salesman is active
  if (salesmanDoc.status !== "active") {
    throw new Error("Selected salesman is not active");
  }

  const actualSalesmanId = salesmanDoc.e_id;

  if (validateUnique && unique_code) {
    const existingSale = await Sale.findOne({ unique_code }).session(session);
    if (existingSale) throw new Error(`Unique code '${unique_code}' already exists.`);
  }

  const company = await Company.findOne({ c_id: company_id }).session(session);
  if (!company) throw new Error("Company not found");

  const product = await Product.findOne({ prod_id: product_id }).session(session);
  if (!product) throw new Error("Product not found");

  const qty = parseInt(quantity, 10);
  if (!qty || qty <= 0) throw new Error("Quantity must be a positive whole number");

  const inventory = await Inventory.findOne({
    branch_id: manager.bid,
    product_id
  }).session(session);

  if (!inventory || inventory.quantity < qty) {
    throw new Error(`Insufficient stock. Available: ${inventory ? inventory.quantity : 0}`);
  }

  const amount = parseFloat(sold_price) * qty;
  const profit_or_loss = (parseFloat(sold_price) - parseFloat(purchased_price)) * qty;

  return {
    salesmanDoc,
    actualSalesmanId,
    company,
    product,
    qty,
    inventory,
    amount,
    profit_or_loss
  };
};

// --- HELPER: Create sale document from resolved context ---
const createManagerSaleFromContext = async ({ payload, manager, session, context, paymentMeta }) => {
  const count = (await Sale.countDocuments().session(session)) + 1;
  const sales_id = `S${String(count).padStart(3, "0")}`;
  const generatedUniqueCode = payload.unique_code || `UC${String(count).padStart(3, "0")}`;
  const installation_status = payload.installation === "Required" ? "Pending" : null;

  // Deduct inventory
  context.inventory.quantity -= context.qty;
  context.inventory.updatedAt = new Date();
  await context.inventory.save({ session });

  // FIX: Normalize sales_date — payload may use 'sales_date' or 'saledate'
  const sales_date = payload.sales_date || payload.saledate || new Date();

  const newSale = new Sale({
    sales_id,
    branch_id: manager.bid,
    salesman_id: context.actualSalesmanId,   // Always stored as e_id string
    company_id: payload.company_id,
    product_id: payload.product_id,
    customer_name: payload.customer_name,
    sales_date,
    unique_code: generatedUniqueCode,
    purchased_price: parseFloat(payload.purchased_price),
    sold_price: parseFloat(payload.sold_price),
    quantity: context.qty,
    amount: context.amount,
    profit_or_loss: context.profit_or_loss,
    phone_number: payload.phone_number,
    customer_email: payload.customer_email || null,
    address: payload.address,
    installation: payload.installation,
    installationType: payload.installationType,
    installationcharge: payload.installationcharge,
    installation_status,
    payment_method: paymentMeta.payment_method,
    payment_status: paymentMeta.payment_status,
    payment_provider: paymentMeta.payment_provider,
    payment_reference_id: paymentMeta.payment_reference_id || null,
    payment_id: paymentMeta.payment_id || null,
    paid_at: paymentMeta.paid_at || null,
    payment_amount: context.amount
  });

  await newSale.save({ session });

  return {
    newSale,
    sales_id,
    generatedUniqueCode
  };
};

// --- CONTROLLERS ---

exports.getManagerSales = async (req, res) => {
  try {
    const manager = await getManagerDetails(req);
    const branchId = manager.bid;

    const sales = await Sale.find({ branch_id: branchId }).lean().sort({ sales_date: -1 });

    const formattedSales = await Promise.all(
      sales.map(async (sale) => {
        let salesmanName = "Unknown";
        let companyName = "Unknown";
        let productName = "Unknown";

        if (sale.salesman_id) {
          // salesman_id is always stored as e_id string
          const sm = await Employee.findOne({ e_id: sale.salesman_id }).lean();
          if (sm) salesmanName = `${sm.f_name} ${sm.last_name}`;
        }

        if (sale.company_id) {
          const company = await Company.findOne({ c_id: sale.company_id }).lean();
          if (company) companyName = company.cname;
        }

        if (sale.product_id) {
          const product = await Product.findOne({ prod_id: sale.product_id }).lean();
          if (product) productName = product.Prod_name;
        }

        return {
          ...sale,
          salesman_name: salesmanName,
          company_name: companyName,
          product_name: productName,
          branch_name: manager.bid
        };
      })
    );

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

    const {
      salesman_id,
      customer_name,
      sales_date,        // FIX: use sales_date (matches Sale model & Swagger)
      saledate,          // also accept legacy saledate from website frontend
      unique_code,
      company_id,
      product_id,
      purchased_price,
      sold_price,
      quantity,
      phone_number,
      customer_email,
      address,
      installation,
      installationType,
      installationcharge,
      payment_method = "cash"
    } = req.body;

    // FIX: Allow cash and scanner; only block online (must use Razorpay APIs)
    if (payment_method === "online") {
      throw new Error("Online payments must use the manager online payment APIs");
    }

    const payload = {
      salesman_id,
      customer_name,
      sales_date: sales_date || saledate,   // normalize both field names
      unique_code,
      company_id,
      product_id,
      purchased_price,
      sold_price,
      quantity,
      phone_number,
      customer_email,
      address,
      installation,
      installationType,
      installationcharge
    };

    const context = await resolveManagerSaleContext({ payload, manager, session, validateUnique: true });

    const created = await createManagerSaleFromContext({
      payload,
      manager,
      session,
      context,
      paymentMeta: {
        payment_method,                  // cash or scanner
        payment_status: "paid",
        payment_provider: "manual",
        payment_reference_id: null,
        payment_id: null,
        paid_at: new Date()
      }
    });

    await session.commitTransaction();

    // Send invoice email (non-blocking)
    const branch = await Branch.findOne({ bid: manager.bid }).lean();
    if (customer_email) {
      sendInvoiceEmail({
        sales_id: created.sales_id,
        customer_name,
        customer_email,
        phone_number,
        address,
        sales_date: payload.sales_date,
        unique_code: created.generatedUniqueCode,
        product_name: context.product.Prod_name,
        model_number: context.product.Model_no,
        company_name: context.company.cname,
        branch_name: branch ? branch.b_name : "N/A",
        salesman_name: `${context.salesmanDoc.f_name} ${context.salesmanDoc.last_name}`,
        sold_price: parseFloat(sold_price),
        quantity: context.qty,
        amount: context.amount,
        installation,
        installationType,
        installationcharge,
        warrantyperiod: context.product.warrantyperiod || ""
      });
    }

    res.status(201).json({ success: true, message: "Sale added successfully", sale: created.newSale });
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
    if (!sale) return res.status(404).json({ message: "Sale not found" });

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
};

// --- Manager Online Payment: Step 1 - Initiate Razorpay order ---
exports.initiateOnlinePayment = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const manager = await getManagerDetails(req);
    const payload = req.body;
    const context = await resolveManagerSaleContext({ payload, manager, session, validateUnique: true });

    const existingIntent = await SalesPaymentIntent.findOne({
      manager_id: manager.e_id,
      "sale_payload.unique_code": payload.unique_code,
      status: { $in: ["initiated", "pending", "paid"] }
    }).session(session);

    if (payload.unique_code && existingIntent) {
      throw new Error("Payment already initiated for this unique code");
    }

    const payment_reference_id = `MOPAY_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
    const amountPaise = Math.round(context.amount * 100);
    const razorpay = getRazorpayClient();

    const order = await razorpay.orders.create({
      amount: amountPaise,
      currency: "INR",
      receipt: payment_reference_id,
      notes: {
        payment_reference_id,
        unique_code: payload.unique_code || "",
        manager_id: manager.e_id
      }
    });

    const intent = new SalesPaymentIntent({
      payment_reference_id,
      salesman_id: context.actualSalesmanId,
      manager_id: manager.e_id,
      branch_id: manager.bid,
      status: "pending",
      amount: context.amount,
      currency: "INR",
      razorpay_order_id: order.id,
      sale_payload: payload,
      last_status_payload: order
    });

    await intent.save({ session });
    await session.commitTransaction();

    res.json({
      success: true,
      key_id: process.env.RAZORPAY_KEY_ID,
      payment_reference_id,
      order_id: order.id,
      amount: context.amount,
      amount_paise: amountPaise,
      currency: "INR"
    });
  } catch (err) {
    await session.abortTransaction();
    console.error("[initiateOnlinePayment] Error:", err.message);
    res.status(400).json({ message: err.message || "Failed to initiate online payment" });
  } finally {
    session.endSession();
  }
};

// --- Manager Online Payment: Step 2 - Verify and create sale ---
exports.verifyOnlinePaymentAndCreateSale = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const manager = await getManagerDetails(req);
    const {
      payment_reference_id,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    } = req.body;

    if (!payment_reference_id || !razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      throw new Error("Missing payment verification fields");
    }

    const intent = await SalesPaymentIntent.findOne({
      payment_reference_id,
      manager_id: manager.e_id
    }).session(session);

    if (!intent) throw new Error("Payment intent not found");

    if (intent.sale_created) {
      await session.commitTransaction();
      return res.json({ success: true, sales_id: intent.sale_id, message: "Sale already created" });
    }

    if (intent.razorpay_order_id !== razorpay_order_id) {
      throw new Error("Invalid order id for this payment reference");
    }

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      intent.status = "failed";
      intent.last_status_payload = { reason: "signature_mismatch" };
      await intent.save({ session });
      await session.commitTransaction();
      return res.status(400).json({ message: "Invalid payment signature" });
    }

    const payload = intent.sale_payload;
    const existingSale = payload.unique_code
      ? await Sale.findOne({ unique_code: payload.unique_code }).session(session)
      : null;

    let created;
    let context;
    if (existingSale) {
      created = { sales_id: existingSale.sales_id };
    } else {
      context = await resolveManagerSaleContext({ payload, manager, session, validateUnique: false });
      created = await createManagerSaleFromContext({
        payload,
        manager,
        session,
        context,
        paymentMeta: {
          payment_method: "online",
          payment_status: "paid",
          payment_provider: "razorpay",
          payment_reference_id: intent.payment_reference_id,
          payment_id: razorpay_payment_id,
          paid_at: new Date()
        }
      });

      const branch = await Branch.findOne({ bid: manager.bid }).lean();
      if (payload.customer_email) {
        sendInvoiceEmail({
          sales_id: created.sales_id,
          customer_name: payload.customer_name,
          customer_email: payload.customer_email,
          phone_number: payload.phone_number,
          address: payload.address,
          sales_date: payload.sales_date || payload.saledate,
          unique_code: created.generatedUniqueCode,
          product_name: context.product.Prod_name,
          model_number: context.product.Model_no,
          company_name: context.company.cname,
          branch_name: branch ? branch.b_name : "N/A",
          salesman_name: `${context.salesmanDoc.f_name} ${context.salesmanDoc.last_name}`,
          sold_price: parseFloat(payload.sold_price),
          quantity: context.qty,
          amount: context.amount,
          installation: payload.installation,
          installationType: payload.installationType,
          installationcharge: payload.installationcharge,
          warrantyperiod: context.product.warrantyperiod || ""
        });
      }
    }

    intent.status = "paid";
    intent.razorpay_payment_id = razorpay_payment_id;
    intent.sale_created = true;
    intent.sale_id = created.sales_id;
    intent.last_status_payload = {
      payment_reference_id,
      razorpay_order_id,
      razorpay_payment_id
    };

    await intent.save({ session });
    await session.commitTransaction();

    return res.json({ success: true, sales_id: created.sales_id, message: "Payment verified and sale created" });
  } catch (err) {
    await session.abortTransaction();
    console.error("[verifyOnlinePaymentAndCreateSale] Error:", err.message);
    res.status(400).json({ message: err.message || "Failed to verify online payment" });
  } finally {
    session.endSession();
  }
};

// --- FORM DATA CONTROLLERS ---

exports.getSalesmen = async (req, res) => {
  try {
    const manager = await getManagerDetails(req);
    const salesmen = await Employee.find({
      bid: manager.bid,
      role: "salesman",
      status: "active"
    }).select("f_name last_name e_id _id");

    res.json(salesmen);
  } catch (err) {
    console.error("[getSalesmen] Error:", err.message);
    res.status(500).json({ message: err.message });
  }
};

exports.getCompanies = async (req, res) => {
  try {
    await getManagerDetails(req);
    const companies = await Company.find({ active: "active" }).select("c_id cname");
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