const Sale = require("../../models/sale");
const Company = require("../../models/company"); // Assuming you have this model
const Product = require("../../models/products"); // Assuming you have this model
const Employee = require("../../models/employees");
const Branch = require("../../models/branches");
const Inventory = require("../../models/inventory"); // Assuming you have this model
const User = require("../../models/User");
const SalesPaymentIntent = require("../../models/salesPaymentIntent");
const mongoose = require("mongoose");
const crypto = require("crypto");
const sendInvoiceEmail = require("../../utils/invoiceMailer");
const Razorpay = require("razorpay");

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

const getRazorpayClient = () => {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    throw new Error("Razorpay is not configured. Add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET.");
  }

  return new Razorpay({ key_id: keyId, key_secret: keySecret });
};

const mapRazorpayLinkStatus = (status) => {
  switch (status) {
    case "paid":
      return "paid";
    case "cancelled":
      return "failed";
    case "expired":
      return "expired";
    case "created":
    case "partially_paid":
    default:
      return "pending";
  }
};

const isBusinessValidationError = (message = "") => {
  return (
    message.includes("already exists") ||
    message.includes("not found") ||
    message.includes("Insufficient inventory") ||
    message.includes("Invalid")
  );
};

const buildNormalizedSalePayload = async (rawPayload, employee, session) => {
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
    customer_email,
    address
  } = rawPayload;

  const existingSale = await Sale.findOne({ unique_code }).session(session);
  if (existingSale) {
    throw new Error(`Unique code ${unique_code} already exists.`);
  }

  const company = await Company.findOne({ c_id: company_id }).lean();
  const product = await Product.findOne({ prod_id: product_id }).lean();
  if (!company || !product) {
    throw new Error("Company or Product not found");
  }

  const inventory = await Inventory.findOne({
    branch_id: employee.bid,
    product_id,
    company_id
  }).session(session);

  if (!inventory || inventory.quantity < parseInt(quantity, 10)) {
    throw new Error(`Insufficient inventory for ${product.Prod_name} (Available: ${inventory ? inventory.quantity : 0})`);
  }

  const amount = parseFloat(sold_price) * parseInt(quantity, 10);
  const profit_or_loss = (parseFloat(sold_price) - parseFloat(purchased_price)) * parseInt(quantity, 10);

  return {
    company,
    product,
    inventory,
    amount,
    profit_or_loss,
    payload: {
      customer_name,
      sales_date,
      unique_code,
      company_id,
      product_id,
      purchased_price: parseFloat(purchased_price),
      sold_price: parseFloat(sold_price),
      quantity: parseInt(quantity, 10),
      phone_number,
      customer_email: customer_email || null,
      address
    }
  };
};

const createSaleFromValidatedData = async ({
  validatedData,
  employee,
  session,
  paymentMeta
}) => {
  const { company, product, inventory, amount, profit_or_loss, payload } = validatedData;
  const count = await Sale.countDocuments().session(session) + 1;
  const sales_id = `S${String(count).padStart(3, "0")}`;

  const installation = product.installation || "Not Required";
  const installationType = product.installationType || null;
  const installationcharge = product.installationcharge || null;
  const installation_status = installation === "Required" ? "Pending" : null;

  const newSale = new Sale({
    sales_id,
    branch_id: employee.bid,
    salesman_id: employee.e_id,
    company_id: company.c_id,
    product_id: product.prod_id,
    customer_name: payload.customer_name,
    sales_date: new Date(payload.sales_date),
    unique_code: payload.unique_code,
    purchased_price: payload.purchased_price,
    sold_price: payload.sold_price,
    quantity: payload.quantity,
    amount,
    profit_or_loss,
    phone_number: payload.phone_number,
    customer_email: payload.customer_email,
    address: payload.address,
    installation,
    installationType,
    installationcharge,
    installation_status,
    payment_method: paymentMeta.payment_method,
    payment_status: paymentMeta.payment_status,
    payment_provider: paymentMeta.payment_provider,
    payment_reference_id: paymentMeta.payment_reference_id || null,
    payment_id: paymentMeta.payment_id || null,
    paid_at: paymentMeta.paid_at || null,
    payment_amount: amount
  });

  inventory.quantity -= payload.quantity;
  inventory.updatedAt = new Date();

  await newSale.save({ session });
  await inventory.save({ session });

  return { sales_id, amount, company, product, installation, installationType, installationcharge };
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
          saledate: sale.sales_date,
          payment_method: sale.payment_method || "cash",
          payment_status: sale.payment_status || "paid"
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
      price: sale.sold_price,
      payment_method: sale.payment_method || "cash",
      payment_status: sale.payment_status || "paid",
      payment_provider: sale.payment_provider || "manual",
      payment_reference_id: sale.payment_reference_id || null,
      payment_id: sale.payment_id || null,
      paid_at: sale.paid_at || null,
      payment_amount: sale.payment_amount || sale.amount
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
      customer_email,
      address,
      payment_method = "cash"
    } = req.body;

    if (payment_method !== "cash") {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: "Online payments must use online payment APIs"
      });
    }
    const validatedData = await buildNormalizedSalePayload({
      customer_name,
      sales_date,
      unique_code,
      company_id,
      product_id,
      purchased_price,
      sold_price,
      quantity,
      phone_number,
      customer_email,
      address
    }, employee, session);

    // Get branch name for invoice
    const branch = await Branch.findOne({ bid: employee.bid }).lean();

    const createdSale = await createSaleFromValidatedData({
      validatedData,
      employee,
      session,
      paymentMeta: {
        payment_method: "cash",
        payment_status: "paid",
        payment_provider: "manual",
        payment_reference_id: null,
        payment_id: null,
        paid_at: new Date()
      }
    });
    
    await session.commitTransaction();

    // Send invoice email to customer (non-blocking)
    if (customer_email) {
      sendInvoiceEmail({
        sales_id: createdSale.sales_id,
        customer_name,
        customer_email,
        phone_number,
        address,
        sales_date,
        unique_code,
        product_name: createdSale.product.Prod_name,
        model_number: createdSale.product.Model_no,
        company_name: createdSale.company.cname,
        branch_name: branch ? branch.b_name : "N/A",
        salesman_name: `${employee.f_name} ${employee.last_name}`,
        sold_price: parseFloat(sold_price),
        quantity: parseInt(quantity, 10),
        amount: createdSale.amount,
        installation: createdSale.installation,
        installationType: createdSale.installationType,
        installationcharge: createdSale.installationcharge,
        warrantyperiod: createdSale.product.warrantyperiod || ""
      });
    }

    res.json({ success: true, message: "Sale added successfully" });
  } catch (error) {
    await session.abortTransaction();
    console.error("Error adding sale:", error.message);
    res.status(500).json({ success: false, message: `Failed to add sale: ${error.message}` });
  } finally {
    session.endSession();
  }
};

// @desc    Initiate scanner payment for sale
// @route   POST /api/salesman/sales/payments/initiate-scanner
// @access  Private (Salesman)
exports.initiateScannerPayment = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const emp_id = await getEmployeeId(req);
    const employee = await Employee.findOne({ e_id: emp_id });
    if (!employee) {
      await session.abortTransaction();
      return res.status(404).json({ success: false, message: "Salesman not found" });
    }

    const payload = req.body;
    const validatedData = await buildNormalizedSalePayload(payload, employee, session);

    const existingIntent = await SalesPaymentIntent.findOne({
      "sale_payload.unique_code": payload.unique_code,
      status: { $in: ["initiated", "pending", "paid"] }
    }).session(session);

    if (existingIntent) {
      await session.abortTransaction();
      return res.status(400).json({ success: false, message: "Payment already initiated for this unique code" });
    }

    const payment_reference_id = `SPAY_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
    const amountPaise = Math.round(validatedData.amount * 100);
    const razorpay = getRazorpayClient();

    const paymentLinkPayload = {
      amount: amountPaise,
      currency: "INR",
      accept_partial: false,
      description: `Sales payment ${payload.unique_code}`,
      reference_id: payment_reference_id,
      notify: {
        sms: false,
        email: false
      },
      reminder_enable: false,
      upi_link: true,
      notes: {
        payment_reference_id,
        unique_code: payload.unique_code,
        salesman_id: employee.e_id
      }
    };

    // Add customer object only when it has at least one contact channel.
    if (payload.phone_number || payload.customer_email) {
      paymentLinkPayload.customer = {
        name: payload.customer_name,
        contact: payload.phone_number || undefined,
        email: payload.customer_email || undefined
      };
    }

    const paymentLink = await razorpay.paymentLink.create(paymentLinkPayload);

    const intent = new SalesPaymentIntent({
      payment_reference_id,
      salesman_id: employee.e_id,
      branch_id: employee.bid,
      status: "pending",
      amount: validatedData.amount,
      currency: "INR",
      razorpay_link_id: paymentLink.id,
      short_url: paymentLink.short_url || null,
      expires_at: paymentLink.expire_by ? new Date(paymentLink.expire_by * 1000) : null,
      sale_payload: payload,
      last_status_payload: paymentLink
    });

    await intent.save({ session });
    await session.commitTransaction();

    res.json({
      success: true,
      payment_reference_id,
      payment_status: "pending",
      amount: validatedData.amount,
      short_url: paymentLink.short_url || null,
      qr_code_data: paymentLink.short_url || null,
      expires_at: intent.expires_at
    });
  } catch (error) {
    await session.abortTransaction();
    const razorpayDescription = error?.error?.description || error?.response?.data?.error?.description;
    const finalMessage = razorpayDescription || error.message || "Failed to initiate scanner payment";
    const statusCode = isBusinessValidationError(finalMessage) ? 400 : (razorpayDescription ? 400 : 500);
    console.error("Error initiating scanner payment:", finalMessage);
    res.status(statusCode).json({ success: false, message: finalMessage });
  } finally {
    session.endSession();
  }
};

// @desc    Check scanner payment status and finalize sale if paid
// @route   GET /api/salesman/sales/payments/status/:payment_reference_id
// @access  Private (Salesman)
exports.getScannerPaymentStatus = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const emp_id = await getEmployeeId(req);
    const employee = await Employee.findOne({ e_id: emp_id });
    if (!employee) {
      await session.abortTransaction();
      return res.status(404).json({ success: false, message: "Salesman not found" });
    }

    const { payment_reference_id } = req.params;
    const intent = await SalesPaymentIntent.findOne({
      payment_reference_id,
      salesman_id: employee.e_id
    }).session(session);

    if (!intent) {
      await session.abortTransaction();
      return res.status(404).json({ success: false, message: "Payment reference not found" });
    }

    if (intent.sale_created) {
      await session.commitTransaction();
      return res.json({
        success: true,
        payment_status: intent.status,
        sale_created: true,
        sales_id: intent.sale_id
      });
    }

    const razorpay = getRazorpayClient();
    const paymentLink = await razorpay.paymentLink.fetch(intent.razorpay_link_id);
    const mappedStatus = mapRazorpayLinkStatus(paymentLink.status);
    let finalizedSaleId = null;

    intent.status = mappedStatus;
    intent.last_status_payload = paymentLink;
    intent.razorpay_payment_id = paymentLink.payments && paymentLink.payments.length > 0
      ? paymentLink.payments[0].payment_id
      : intent.razorpay_payment_id;

    if (mappedStatus === "paid") {
      const existingSale = await Sale.findOne({ unique_code: intent.sale_payload.unique_code }).session(session);
      if (existingSale) {
        intent.sale_created = true;
        intent.sale_id = existingSale.sales_id;
        finalizedSaleId = existingSale.sales_id;
      } else {
        const validatedData = await buildNormalizedSalePayload(intent.sale_payload, employee, session);
        const createdSale = await createSaleFromValidatedData({
          validatedData,
          employee,
          session,
          paymentMeta: {
            payment_method: "scanner",
            payment_status: "paid",
            payment_provider: "razorpay",
            payment_reference_id: intent.payment_reference_id,
            payment_id: intent.razorpay_payment_id,
            paid_at: new Date()
          }
        });

        intent.sale_created = true;
        intent.sale_id = createdSale.sales_id;
        finalizedSaleId = createdSale.sales_id;

        const branch = await Branch.findOne({ bid: employee.bid }).lean();
        if (intent.sale_payload.customer_email) {
          sendInvoiceEmail({
            sales_id: createdSale.sales_id,
            customer_name: intent.sale_payload.customer_name,
            customer_email: intent.sale_payload.customer_email,
            phone_number: intent.sale_payload.phone_number,
            address: intent.sale_payload.address,
            sales_date: intent.sale_payload.sales_date,
            unique_code: intent.sale_payload.unique_code,
            product_name: createdSale.product.Prod_name,
            model_number: createdSale.product.Model_no,
            company_name: createdSale.company.cname,
            branch_name: branch ? branch.b_name : "N/A",
            salesman_name: `${employee.f_name} ${employee.last_name}`,
            sold_price: parseFloat(intent.sale_payload.sold_price),
            quantity: parseInt(intent.sale_payload.quantity, 10),
            amount: createdSale.amount,
            installation: createdSale.installation,
            installationType: createdSale.installationType,
            installationcharge: createdSale.installationcharge,
            warrantyperiod: createdSale.product.warrantyperiod || ""
          });
        }
      }
    }

    await intent.save({ session });
    await session.commitTransaction();

    return res.json({
      success: true,
      payment_status: mappedStatus,
      sale_created: Boolean(finalizedSaleId),
      sales_id: finalizedSaleId
    });
  } catch (error) {
    await session.abortTransaction();
    console.error("Error checking scanner payment status:", error.message);
    res.status(500).json({ success: false, message: error.message || "Failed to fetch payment status" });
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
       Com_id: req.params.companyId,
      // add filetr weather product is approved and in stock in the inventoryy
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

// @desc    Initiate online Razorpay checkout order
// @route   POST /api/salesman/sales/payments/initiate-online
// @access  Private (Salesman)
exports.initiateOnlinePayment = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const emp_id = await getEmployeeId(req);
    const employee = await Employee.findOne({ e_id: emp_id });
    if (!employee) {
      await session.abortTransaction();
      return res.status(404).json({ success: false, message: "Salesman not found" });
    }

    const payload = req.body;
    const validatedData = await buildNormalizedSalePayload(payload, employee, session);

    const existingIntent = await SalesPaymentIntent.findOne({
      "sale_payload.unique_code": payload.unique_code,
      status: { $in: ["initiated", "pending", "paid"] }
    }).session(session);

    if (existingIntent) {
      await session.abortTransaction();
      return res.status(400).json({ success: false, message: "Payment already initiated for this unique code" });
    }

    const payment_reference_id = `OPAY_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
    const amountPaise = Math.round(validatedData.amount * 100);
    const razorpay = getRazorpayClient();

    const order = await razorpay.orders.create({
      amount: amountPaise,
      currency: "INR",
      receipt: payment_reference_id,
      notes: {
        payment_reference_id,
        unique_code: payload.unique_code,
        salesman_id: employee.e_id
      }
    });

    const intent = new SalesPaymentIntent({
      payment_reference_id,
      salesman_id: employee.e_id,
      branch_id: employee.bid,
      status: "pending",
      amount: validatedData.amount,
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
      amount: validatedData.amount,
      amount_paise: amountPaise,
      currency: "INR"
    });
  } catch (error) {
    await session.abortTransaction();
    const razorpayDescription = error?.error?.description || error?.response?.data?.error?.description;
    const finalMessage = razorpayDescription || error.message || "Failed to initiate online payment";
    const statusCode = isBusinessValidationError(finalMessage) ? 400 : (razorpayDescription ? 400 : 500);
    console.error("Error initiating online payment:", finalMessage);
    res.status(statusCode).json({ success: false, message: finalMessage });
  } finally {
    session.endSession();
  }
};

// @desc    Verify Razorpay payment and create sale
// @route   POST /api/salesman/sales/payments/verify-online
// @access  Private (Salesman)
exports.verifyOnlinePaymentAndCreateSale = async (req, res) => {
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
      payment_reference_id,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    } = req.body;

    if (!payment_reference_id || !razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      await session.abortTransaction();
      return res.status(400).json({ success: false, message: "Missing payment verification fields" });
    }

    const intent = await SalesPaymentIntent.findOne({
      payment_reference_id,
      salesman_id: employee.e_id
    }).session(session);

    if (!intent) {
      await session.abortTransaction();
      return res.status(404).json({ success: false, message: "Payment intent not found" });
    }

    if (intent.sale_created) {
      await session.commitTransaction();
      return res.json({ success: true, sales_id: intent.sale_id, message: "Sale already created" });
    }

    if (intent.razorpay_order_id !== razorpay_order_id) {
      await session.abortTransaction();
      return res.status(400).json({ success: false, message: "Invalid order id for this payment reference" });
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
      return res.status(400).json({ success: false, message: "Invalid payment signature" });
    }

    const existingSale = await Sale.findOne({ unique_code: intent.sale_payload.unique_code }).session(session);
    let createdSale;
    if (existingSale) {
      createdSale = { sales_id: existingSale.sales_id };
    } else {
      const validatedData = await buildNormalizedSalePayload(intent.sale_payload, employee, session);
      createdSale = await createSaleFromValidatedData({
        validatedData,
        employee,
        session,
        paymentMeta: {
          payment_method: "online",
          payment_status: "paid",
          payment_provider: "razorpay",
          payment_reference_id: intent.payment_reference_id,
          payment_id: razorpay_payment_id,
          paid_at: new Date()
        }
      });

      const branch = await Branch.findOne({ bid: employee.bid }).lean();
      if (intent.sale_payload.customer_email) {
        sendInvoiceEmail({
          sales_id: createdSale.sales_id,
          customer_name: intent.sale_payload.customer_name,
          customer_email: intent.sale_payload.customer_email,
          phone_number: intent.sale_payload.phone_number,
          address: intent.sale_payload.address,
          sales_date: intent.sale_payload.sales_date,
          unique_code: intent.sale_payload.unique_code,
          product_name: createdSale.product.Prod_name,
          model_number: createdSale.product.Model_no,
          company_name: createdSale.company.cname,
          branch_name: branch ? branch.b_name : "N/A",
          salesman_name: `${employee.f_name} ${employee.last_name}`,
          sold_price: parseFloat(intent.sale_payload.sold_price),
          quantity: parseInt(intent.sale_payload.quantity, 10),
          amount: createdSale.amount,
          installation: createdSale.installation,
          installationType: createdSale.installationType,
          installationcharge: createdSale.installationcharge,
          warrantyperiod: createdSale.product.warrantyperiod || ""
        });
      }
    }

    intent.status = "paid";
    intent.razorpay_payment_id = razorpay_payment_id;
    intent.sale_created = true;
    intent.sale_id = createdSale.sales_id;
    intent.last_status_payload = {
      razorpay_order_id,
      razorpay_payment_id,
      payment_reference_id
    };
    await intent.save({ session });
    await session.commitTransaction();

    return res.json({ success: true, sales_id: createdSale.sales_id, message: "Payment verified and sale created" });
  } catch (error) {
    await session.abortTransaction();
    console.error("Error verifying online payment:", error.message);
    res.status(500).json({ success: false, message: error.message || "Failed to verify online payment" });
  } finally {
    session.endSession();
  }
};