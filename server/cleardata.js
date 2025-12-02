require('dotenv').config(); // Load env vars if you use a .env file
const connectDB = require('./config/db'); // Import your existing connection logic

// Import all your models
const Complaint = require('./models/complaint');
const Customer = require('./models/customer');
const Company = require('./models/company');
const Message = require('./models/message');
const Employee = require('./models/employees');
const Sale = require('./models/sale');
const Inventory = require('./models/inventory');
const Branch = require('./models/branches');
const Product = require('./models/products');
const Order = require('./models/orders');
const inventory = require('./models/inventory');

const clearAllData = async () => {
    // 1. Connect to MongoDB
    await connectDB();

    try {
        console.log('⚠️  Starting data wipe...');

        // 2. Delete all documents from every collection
        // Using Promise.all for faster parallel execution
        await Promise.all([
             

// Step 2: Find the document with bid "B004" and set it to "B001"
// await inventory.deleteMany({ branch_id: "B004" })   
  ]);

        // Complaint.deleteMany({}),  //
        //     Customer.deleteMany({}),   //
        //     Company.deleteMany({}),    //
        //     Message.deleteMany({}),    //
        //     Employee.deleteMany({}),   //
        //     Sale.deleteMany({}),       //
        //     Inventory.deleteMany({}),  //
        //     Branch.deleteMany({}),     //
        //     Product.deleteMany({}),    //
        //     Order.deleteMany({})       //
        console.log('✅ All data successfully cleared!');
        
    } catch (err) {
        console.error('❌ Error clearing data:', err.message);
    } finally {
        // 3. Exit the process
        process.exit();
    }
};

// Run the function
clearAllData();