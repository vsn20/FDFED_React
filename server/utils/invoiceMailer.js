const nodemailer = require("nodemailer");

const EMAIL_USER = process.env.EMAIL_USER || "electroland2005@gmail.com";
const EMAIL_PASS = process.env.EMAIL_PASS;

/**
 * Generate a professional HTML invoice and send it to the customer's email.
 * Called after a sale is successfully created by salesman or manager.
 *
 * @param {Object} saleData - The sale details
 * @param {string} saleData.sales_id - Sale ID (e.g. S001)
 * @param {string} saleData.customer_name - Customer name
 * @param {string} saleData.customer_email - Customer email
 * @param {string} saleData.phone_number - Customer phone
 * @param {string} saleData.address - Customer address
 * @param {string} saleData.sales_date - Sale date
 * @param {string} saleData.unique_code - Unique sale code
 * @param {string} saleData.product_name - Product name
 * @param {string} saleData.model_number - Product model number
 * @param {string} saleData.company_name - Company/brand name
 * @param {string} saleData.branch_name - Branch name
 * @param {string} saleData.salesman_name - Salesman name
 * @param {number} saleData.sold_price - Price per unit
 * @param {number} saleData.quantity - Quantity sold
 * @param {number} saleData.amount - Total amount
 * @param {string} saleData.installation - 'Required' or 'Not Required'
 * @param {string} saleData.installationType - 'Paid' or 'Free'
 * @param {number|string} saleData.installationcharge - Installation charge
 * @param {string} saleData.warrantyperiod - Warranty period
 */
const sendInvoiceEmail = async (saleData) => {
  try {
    if (!saleData.customer_email) {
      console.log(`[Invoice] No customer email provided for sale ${saleData.sales_id}. Skipping invoice.`);
      return;
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user: EMAIL_USER, pass: EMAIL_PASS },
    });

    // Format date
    const saleDate = new Date(saleData.sales_date).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    // Calculate installation charge for display
    const installationCharge =
      saleData.installation === "Required" && saleData.installationType === "Paid"
        ? parseFloat(saleData.installationcharge) || 0
        : 0;
    const grandTotal = saleData.amount + installationCharge;

    // Build the HTML invoice
    const invoiceHTML = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0; padding:0; background-color:#f4f4f4; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f4; padding:30px 0;">
    <tr>
      <td align="center">
        <table width="650" cellpadding="0" cellspacing="0" style="background-color:#ffffff; border-radius:8px; overflow:hidden; box-shadow:0 2px 10px rgba(0,0,0,0.1);">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #1a237e 0%, #283593 100%); padding:30px 40px; text-align:center;">
              <h1 style="color:#ffffff; margin:0; font-size:28px; letter-spacing:1px;">⚡ ElectroLand</h1>
              <p style="color:#bbdefb; margin:5px 0 0; font-size:13px; letter-spacing:2px;">YOUR TRUSTED ELECTRONICS PARTNER</p>
            </td>
          </tr>

          <!-- Invoice Title -->
          <tr>
            <td style="padding:25px 40px 10px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    <h2 style="color:#1a237e; margin:0; font-size:22px;">SALES INVOICE</h2>
                    <p style="color:#666; margin:4px 0 0; font-size:13px;">Thank you for your purchase!</p>
                  </td>
                  <td align="right" style="vertical-align:top;">
                    <table cellpadding="2" cellspacing="0" style="font-size:13px; color:#555;">
                      <tr><td style="font-weight:bold; padding-right:10px;">Invoice #:</td><td style="color:#1a237e; font-weight:bold;">${saleData.sales_id}</td></tr>
                      <tr><td style="font-weight:bold; padding-right:10px;">Date:</td><td>${saleDate}</td></tr>
                      <tr><td style="font-weight:bold; padding-right:10px;">Code:</td><td>${saleData.unique_code}</td></tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Divider -->
          <tr><td style="padding:0 40px;"><hr style="border:none; border-top:2px solid #e8eaf6; margin:15px 0;"></td></tr>
          
          <!-- Customer & Branch Info -->
          <tr>
            <td style="padding:5px 40px 15px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td width="50%" style="vertical-align:top;">
                    <h3 style="color:#1a237e; margin:0 0 8px; font-size:14px; text-transform:uppercase;">Bill To</h3>
                    <p style="margin:0; font-size:14px; color:#333; font-weight:bold;">${saleData.customer_name}</p>
                    <p style="margin:3px 0; font-size:13px; color:#555;">📧 ${saleData.customer_email}</p>
                    <p style="margin:3px 0; font-size:13px; color:#555;">📞 ${saleData.phone_number}</p>
                    ${saleData.address ? `<p style="margin:3px 0; font-size:13px; color:#555;">📍 ${saleData.address}</p>` : ""}
                  </td>
                  <td width="50%" style="vertical-align:top; text-align:right;">
                    <h3 style="color:#1a237e; margin:0 0 8px; font-size:14px; text-transform:uppercase;">Sold By</h3>
                    <p style="margin:0; font-size:14px; color:#333; font-weight:bold;">ElectroLand - ${saleData.branch_name}</p>
                    <p style="margin:3px 0; font-size:13px; color:#555;">Sales Rep: ${saleData.salesman_name}</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Product Table -->
          <tr>
            <td style="padding:10px 40px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
                <thead>
                  <tr style="background-color:#1a237e;">
                    <th style="padding:12px 15px; text-align:left; color:#fff; font-size:13px; border-radius:5px 0 0 0;">Product</th>
                    <th style="padding:12px 15px; text-align:center; color:#fff; font-size:13px;">Model</th>
                    <th style="padding:12px 15px; text-align:center; color:#fff; font-size:13px;">Brand</th>
                    <th style="padding:12px 15px; text-align:center; color:#fff; font-size:13px;">Qty</th>
                    <th style="padding:12px 15px; text-align:right; color:#fff; font-size:13px;">Unit Price</th>
                    <th style="padding:12px 15px; text-align:right; color:#fff; font-size:13px; border-radius:0 5px 0 0;">Total</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style="background-color:#f8f9ff;">
                    <td style="padding:12px 15px; font-size:13px; color:#333; border-bottom:1px solid #e8eaf6;">${saleData.product_name}</td>
                    <td style="padding:12px 15px; font-size:13px; color:#555; text-align:center; border-bottom:1px solid #e8eaf6;">${saleData.model_number}</td>
                    <td style="padding:12px 15px; font-size:13px; color:#555; text-align:center; border-bottom:1px solid #e8eaf6;">${saleData.company_name}</td>
                    <td style="padding:12px 15px; font-size:13px; color:#555; text-align:center; border-bottom:1px solid #e8eaf6;">${saleData.quantity}</td>
                    <td style="padding:12px 15px; font-size:13px; color:#555; text-align:right; border-bottom:1px solid #e8eaf6;">₹${Number(saleData.sold_price).toLocaleString("en-IN")}</td>
                    <td style="padding:12px 15px; font-size:13px; color:#333; text-align:right; font-weight:bold; border-bottom:1px solid #e8eaf6;">₹${Number(saleData.amount).toLocaleString("en-IN")}</td>
                  </tr>
                </tbody>
              </table>
            </td>
          </tr>

          <!-- Totals -->
          <tr>
            <td style="padding:10px 40px 5px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td width="55%"></td>
                  <td width="45%">
                    <table width="100%" cellpadding="0" cellspacing="0" style="font-size:13px;">
                      <tr>
                        <td style="padding:6px 0; color:#555;">Subtotal:</td>
                        <td style="padding:6px 0; text-align:right; color:#333;">₹${Number(saleData.amount).toLocaleString("en-IN")}</td>
                      </tr>
                      ${
                        installationCharge > 0
                          ? `<tr>
                              <td style="padding:6px 0; color:#555;">Installation Charge (${saleData.installationType}) *to be paid after installation:</td>
                              <td style="padding:6px 0; text-align:right; color:#333;">₹${Number(installationCharge).toLocaleString("en-IN")}</td>
                            </tr>`
                          : saleData.installation === "Required"
                          ? `<tr>
                              <td style="padding:6px 0; color:#555;">Installation:</td>
                              <td style="padding:6px 0; text-align:right; color:#2e7d32; font-weight:bold;">FREE</td>
                            </tr>`
                          : ""
                      }
                      <tr>
                        <td colspan="2"><hr style="border:none; border-top:1px solid #ddd; margin:5px 0;"></td>
                      </tr>
                      <tr>
                        <td style="padding:8px 0; color:#1a237e; font-weight:bold; font-size:16px;">Grand Total:</td>
                        <td style="padding:8px 0; text-align:right; color:#1a237e; font-weight:bold; font-size:16px;">₹${Number(grandTotal).toLocaleString("en-IN")}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Installation & Warranty Info -->
          <tr>
            <td style="padding:15px 40px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  ${
                    saleData.installation === "Required"
                      ? `<td width="50%" style="vertical-align:top; padding:12px 15px; background-color:#fff3e0; border-radius:6px; margin-right:10px;">
                          <p style="margin:0 0 4px; font-size:12px; color:#e65100; font-weight:bold; text-transform:uppercase;">🔧 Installation</p>
                          <p style="margin:0; font-size:13px; color:#555;">Type: <strong>${saleData.installationType || "N/A"}</strong></p>
                          <p style="margin:2px 0 0; font-size:13px; color:#555;">Status: <strong>Pending</strong></p>
                        </td>`
                      : `<td width="50%" style="vertical-align:top; padding:12px 15px; background-color:#e8f5e9; border-radius:6px;">
                          <p style="margin:0 0 4px; font-size:12px; color:#2e7d32; font-weight:bold; text-transform:uppercase;">✅ Installation</p>
                          <p style="margin:0; font-size:13px; color:#555;">Not Required</p>
                        </td>`
                  }
                  <td width="5%"></td>
                  ${
                    saleData.warrantyperiod
                      ? `<td width="45%" style="vertical-align:top; padding:12px 15px; background-color:#e3f2fd; border-radius:6px;">
                          <p style="margin:0 0 4px; font-size:12px; color:#1565c0; font-weight:bold; text-transform:uppercase;">🛡️ Warranty</p>
                          <p style="margin:0; font-size:13px; color:#555;">Period: <strong>${saleData.warrantyperiod}</strong></p>
                        </td>`
                      : `<td width="45%"></td>`
                  }
                </tr>
              </table>
            </td>
          </tr>

          <!-- Unique Code Box -->
          <tr>
            <td style="padding:5px 40px 15px;">
              <div style="background-color:#fce4ec; border:1px dashed #e91e63; border-radius:6px; padding:12px 20px; text-align:center;">
                <p style="margin:0; font-size:12px; color:#c62828; font-weight:bold; text-transform:uppercase;">Important: Your Unique Sale Code</p>
                <p style="margin:5px 0 0; font-size:20px; color:#b71c1c; font-weight:bold; letter-spacing:3px;">${saleData.unique_code}</p>
                <p style="margin:5px 0 0; font-size:11px; color:#888;">Keep this code safe. You will need it for complaints, reviews, and warranty claims.</p>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color:#f5f5f5; padding:20px 40px; text-align:center; border-top:1px solid #e0e0e0;">
              <p style="margin:0; font-size:12px; color:#888;">This is a computer-generated invoice. No signature is required.</p>
              <p style="margin:5px 0 0; font-size:12px; color:#888;">For queries, contact us at <a href="mailto:${EMAIL_USER}" style="color:#1a237e;">${EMAIL_USER}</a></p>
              <p style="margin:8px 0 0; font-size:11px; color:#aaa;">© ${new Date().getFullYear()} ElectroLand. All Rights Reserved.</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

    // Send the email
    await transporter.sendMail({
      from: `"ElectroLand Invoice" <${EMAIL_USER}>`,
      to: saleData.customer_email,
      subject: `ElectroLand - Invoice #${saleData.sales_id} | ${saleData.product_name}`,
      html: invoiceHTML,
    });

    console.log(`[Invoice] ✅ Invoice email sent to ${saleData.customer_email} for sale ${saleData.sales_id}`);
  } catch (error) {
    // Log the error but don't throw — invoice failure should not block the sale
    console.error(`[Invoice] ❌ Failed to send invoice email for sale ${saleData.sales_id}:`, error.message);
  }
};

module.exports = sendInvoiceEmail;
