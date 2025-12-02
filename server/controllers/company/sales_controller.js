// path: server/controllers/company/sales_controller.js
const Sale = require('../../models/sale');       
const Product = require('../../models/products'); 
const Branch = require('../../models/branches'); 
const Employee = require('../../models/employees'); 

// @desc    Get all sales for the logged-in company
const getCompanySales = async (req, res) => {
  try {
    const companyId = req.user.c_id; 
    if (!companyId) return res.status(400).json({ success: false, message: 'Session Error: Company ID missing.' });

    // 1. Fetch Sales
    const sales = await Sale.find({ company_id: companyId })
        .sort({ sales_date: -1 })
        .lean();

    // 2. Collect IDs
    const productIds = [...new Set(sales.map(s => s.product_id))];
    const branchIds = [...new Set(sales.map(s => s.branch_id))];
    
    // 3. Fetch Related Data (using Custom IDs)
    const products = await Product.find({ prod_id: { $in: productIds } }).lean();
    const branches = await Branch.find({ bid: { $in: branchIds } }).lean();

    // 4. Create Lookup Maps
    const productMap = {};
    products.forEach(p => { productMap[p.prod_id] = p; });

    const branchMap = {};
    branches.forEach(b => { branchMap[b.bid] = b; });

    // 5. Enrich Sales with CORRECT Schema Field Names
    const enrichedSales = sales.map(sale => {
        const product = productMap[sale.product_id] || {};
        const branch = branchMap[sale.branch_id] || {};

        return {
            ...sale,
            product_id: { 
                // Fix: Schema uses 'Prod_name' (Capital P)
                prod_name: product.Prod_name || 'Unknown Product',
                // Fix: Schema uses 'Model_no' (Capital M)
                model_no: product.Model_no || 'N/A' 
            },
            branch_id: { 
                // Fix: Schema uses 'b_name'
                branch_name: branch.b_name || 'Unknown Branch'
            }
        };
    });

    res.status(200).json({ success: true, count: enrichedSales.length, sales: enrichedSales });
  } catch (error) {
    console.error('Error fetching company sales:', error);
    res.status(500).json({ success: false, message: 'Server Error fetching sales' });
  }
};

// @desc    Get single sale details
const getSaleDetails = async (req, res) => {
  try {
    const companyId = req.user.c_id;

    // 1. Fetch Sale
    const sale = await Sale.findOne({ 
      sales_id: req.params.id, 
      company_id: companyId 
    }).lean();

    if (!sale) return res.status(404).json({ success: false, message: 'Sale not found' });

    // 2. Fetch Details
    const product = await Product.findOne({ prod_id: sale.product_id }).lean() || {};
    const branch = await Branch.findOne({ bid: sale.branch_id }).lean() || {};
    
    let salesman = null;
    if(sale.salesman_id) {
         salesman = await Employee.findOne({ e_id: sale.salesman_id }).lean();
    }

    // 3. Attach Details with CORRECT Schema Field Names
    sale.product_id = { 
        // Fix: Schema uses 'Prod_name' and 'Model_no'
        prod_name: product.Prod_name || 'Unknown',
        model_no: product.Model_no || 'N/A' 
    };
    
    sale.branch_id = { 
        // Fix: Schema uses 'b_name'
        branch_name: branch.b_name || 'Unknown' 
    };
    
    sale.salesman_id = salesman || { name: 'Unknown' };

    res.status(200).json({ success: true, sale });
  } catch (error) {
    console.error('Error fetching sale details:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Update installation status
const updateInstallationStatus = async (req, res) => {
  try {
    const { installation_status } = req.body;
    const sale = await Sale.findOneAndUpdate(
        { sales_id: req.params.id, company_id: req.user.c_id },
        { installation_status: installation_status },
        { new: true }
    );

    if (!sale) return res.status(404).json({ success: false, message: 'Sale not found' });

    res.status(200).json({ success: true, message: 'Installation status updated', data: sale });
  } catch (error) {
    console.error('Error updating installation:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

module.exports = {
  getCompanySales,
  getSaleDetails,
  updateInstallationStatus
};