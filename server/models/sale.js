const mongoose = require("mongoose");

const SaleSchema = new mongoose.Schema({
  sales_id: { 
    type: String, 
    unique: true, 
    required: true 
  }, // Unique identifier for the sale
  branch_id: { 
    type: String, 
    ref: "Branch", 
    required: true 
  }, // Reference to Branch.bid
  salesman_id: { 
    type: String, 
    ref: "Employee", 
    required: true 
  }, // Reference to Employee.e_id (salesman)
  company_id: { 
    type: String, 
    ref: "Company", 
    required: true 
  }, // Reference to Company.c_id
  product_id: { 
    type: String, 
    ref: "Product", 
    required: true 
  }, // Reference to Product.prod_id
  customer_name: { 
    type: String, 
    required: true 
  }, // Customer name
  sales_date: { 
    type: Date, 
    required: true 
  }, // Sale date
  unique_code: { 
    type: String, 
    unique: true, 
    required: true 
  }, // Unique code for the sale
  purchased_price: { 
    type: Number, 
    required: true 
  }, // Purchased price per unit
  sold_price: { 
    type: Number, 
    required: true 
  }, // Sold price per unit
  quantity: { 
    type: Number, 
    required: true 
  }, // Quantity sold
  amount: { 
    type: Number, 
    required: true 
  }, // Total amount (sold_price * quantity)
  profit_or_loss: { 
    type: Number, 
    required: true 
  }, // Profit or loss for the sale
  phone_number: { 
    type: String, 
    required: true,
    match: [/^\+?[1-9]\d{1,14}$/, "Please enter a valid phone number"]
  }, // Customer phone number
  address: { 
    type: String 
  }, // Customer address
  review: { 
    type: String 
  }, // Customer review
  rating: { 
    type: Number, 
    min: 1, 
    max: 5, 
    default: null 
  }, // Rating from 1 to 5
  installation: { 
    type: String, 
    required: true, 
    enum: ['Required', 'Not Required'] 
  }, // Installation requirement
  installationType: { 
    type: String, 
    enum: ['Paid', 'Free'] 
  }, // Installation type
  installationcharge: { 
    type: String 
  }, // Installation charge
  installation_status: { 
    type: String, 
    enum: ['Pending', 'Completed', null], 
    default: null 
  }, // Installation status
  createdAt: { 
    type: Date, 
    default: Date.now 
  } // Creation timestamp
});

const Sale = mongoose.model("Sale", SaleSchema);
module.exports = Sale;