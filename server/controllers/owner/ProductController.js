const Product = require('../../models/products');
const Company = require('../../models/company');
const nodemailer = require('nodemailer');

const EMAIL_USER = process.env.EMAIL_USER || 'electroland2005@gmail.com';
const EMAIL_PASS = process.env.EMAIL_PASS;

/**
 * Fetch all products with status 'Accepted'
 */
async function getAcceptedProducts(req, res) {
  try {
    const products = await Product.find({ Status: 'Accepted' }).lean();
    res.json(products);
  } catch (error) {
    console.error("Error fetching accepted products:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

/**
 * Fetch all products with status 'Rejected'
 */
async function getRejectedProducts(req, res) {
  try {
    const products = await Product.find({ Status: 'Rejected' }).lean();
    res.json(products);
  } catch (error) {
    console.error("Error fetching rejected products:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

/**
 * Fetch all products with status 'Hold' (New products)
 */
async function getNewProducts(req, res) {
  try {
    const products = await Product.find({ Status: 'Hold' }).lean();
    res.json(products);
  } catch (error) {
    console.error("Error fetching new products:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

/**
 * Fetch a single product by its prod_id
 */
async function getProductById(req, res) {
  try {
    const prod_id = req.params.prod_id;
    const product = await Product.findOne({ prod_id }).lean();
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }
    res.json(product);
  } catch (error)
 {
    console.error("Error fetching product data:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

/**
 * Update a product's status
 */
async function updateProductStatus(req, res) {
  try {
    const prod_id = req.params.prod_id;
    const { status, rejection_reason } = req.body;

    // Validate status
    if (!['Accepted', 'Rejected', 'Hold'].includes(status)) {
      return res.status(400).json({ success: false, error: "Invalid status value" });
    }

    // Validate rejection reason when rejecting
    if (status === 'Rejected' && (!rejection_reason || !rejection_reason.trim())) {
      return res.status(400).json({ success: false, error: "Rejection reason is required when rejecting a product" });
    }

    const product = await Product.findOne({ prod_id });
    if (!product) {
      return res.status(404).json({ success: false, error: "Product not found" });
    }

    product.Status = status;

    // Update approvedAt timestamp based on status
    if (status === 'Accepted') {
      product.approvedAt = new Date();
      product.rejection_reason = null;
    } else if (status === 'Rejected') {
      product.approvedAt = null;
      product.rejection_reason = rejection_reason.trim();
    } else {
      product.approvedAt = null;
      product.rejection_reason = null;
    }

    await product.save();

    // Send rejection email to the company (non-blocking)
    if (status === 'Rejected') {
      sendRejectionEmail(product, rejection_reason.trim());
    }

    res.json({ success: true, message: "Product status updated successfully", product });
  } catch (error) {
    console.error("Error updating product status:", error);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
}

/**
 * Send rejection email to the company
 */
async function sendRejectionEmail(product, reason) {
  try {
    // Find the company by Com_id
    const company = await Company.findOne({ c_id: product.Com_id }).lean();
    if (!company || !company.email) {
      console.log(`[Rejection Email] No company email found for company ID: ${product.Com_id}`);
      return;
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: EMAIL_USER, pass: EMAIL_PASS },
    });

    const emailHTML = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0; padding:0; background-color:#f4f4f4; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f4; padding:30px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff; border-radius:8px; overflow:hidden; box-shadow:0 2px 10px rgba(0,0,0,0.1);">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #c62828 0%, #e53935 100%); padding:25px 40px; text-align:center;">
              <h1 style="color:#ffffff; margin:0; font-size:24px;">⚡ ElectroLand</h1>
              <p style="color:#ffcdd2; margin:5px 0 0; font-size:12px; letter-spacing:2px;">PRODUCT STATUS UPDATE</p>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding:30px 40px;">
              <h2 style="color:#c62828; margin:0 0 15px; font-size:20px;">Product Rejected</h2>
              <p style="color:#555; font-size:14px; line-height:1.6; margin:0 0 20px;">Dear <strong>${company.cname}</strong>,</p>
              <p style="color:#555; font-size:14px; line-height:1.6; margin:0 0 20px;">We regret to inform you that the following product has been <strong style="color:#c62828;">rejected</strong> from our platform after review:</p>
              
              <!-- Product Details -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#fafafa; border:1px solid #eee; border-radius:6px; margin:0 0 20px;">
                <tr>
                  <td style="padding:15px 20px; border-bottom:1px solid #eee;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr><td style="font-size:13px; color:#888; padding:4px 0;">Product ID</td><td style="font-size:13px; color:#333; font-weight:bold; text-align:right;">${product.prod_id}</td></tr>
                      <tr><td style="font-size:13px; color:#888; padding:4px 0;">Product Name</td><td style="font-size:13px; color:#333; font-weight:bold; text-align:right;">${product.Prod_name}</td></tr>
                      <tr><td style="font-size:13px; color:#888; padding:4px 0;">Model No.</td><td style="font-size:13px; color:#333; text-align:right;">${product.Model_no}</td></tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Rejection Reason -->
              <div style="background-color:#ffebee; border-left:4px solid #c62828; border-radius:0 6px 6px 0; padding:15px 20px; margin:0 0 20px;">
                <p style="margin:0 0 5px; font-size:12px; color:#c62828; font-weight:bold; text-transform:uppercase;">Reason for Rejection</p>
                <p style="margin:0; font-size:14px; color:#333; line-height:1.6;">${reason}</p>
              </div>

              <p style="color:#555; font-size:14px; line-height:1.6; margin:0 0 10px;">You are welcome to address the concerns mentioned above and resubmit the product for review.</p>
              <p style="color:#555; font-size:14px; line-height:1.6; margin:0;">If you have any questions, feel free to reach out to us.</p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color:#f5f5f5; padding:20px 40px; text-align:center; border-top:1px solid #e0e0e0;">
              <p style="margin:0; font-size:12px; color:#888;">This is an automated notification from ElectroLand.</p>
              <p style="margin:5px 0 0; font-size:12px; color:#888;">Contact: <a href="mailto:${EMAIL_USER}" style="color:#1a237e;">${EMAIL_USER}</a></p>
              <p style="margin:8px 0 0; font-size:11px; color:#aaa;">© ${new Date().getFullYear()} ElectroLand. All Rights Reserved.</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

    await transporter.sendMail({
      from: `"ElectroLand" <${EMAIL_USER}>`,
      to: company.email,
      subject: `Product Rejected: ${product.Prod_name} (${product.prod_id})`,
      html: emailHTML,
    });

    console.log(`[Rejection Email] ✅ Sent to ${company.email} for product ${product.prod_id}`);
  } catch (error) {
    console.error(`[Rejection Email] ❌ Failed for product ${product.prod_id}:`, error.message);
  }
}

module.exports = {
  getAcceptedProducts,
  getRejectedProducts,
  getNewProducts,
  getProductById,
  updateProductStatus
};