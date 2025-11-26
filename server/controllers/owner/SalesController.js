const Sale = require("../../models/sale");
const Company = require("../../models/company");
const Product = require("../../models/products");
const Branch = require("../../models/branches");
const Employee = require("../../models/employees");

// Get all sales with mapped details
exports.getAllSales = async (req, res) => {
  try {
    const sales = await Sale.find().lean();
    
    // Map related data manually as per original logic
    const mappedSales = await Promise.all(
      sales.map(async (sale) => {
        // 1. Fetch Company
        let companyName = "Unknown Company";
        if (sale.company_id) {
            const company = await Company.findOne({ c_id: sale.company_id }).lean();
            if (company) companyName = company.cname;
        }

        // 2. Fetch Product
        let productName = "Unknown Product";
        let modelNumber = "N/A";
        if (sale.product_id) {
            const product = await Product.findOne({ prod_id: sale.product_id }).lean();
            if (product) {
                productName = product.Prod_name;
                modelNumber = product.Model_no;
            }
        }

        // 3. Fetch Branch
        let branchName = "Unknown Branch";
        if (sale.branch_id) {
            const branch = await Branch.findOne({ bid: sale.branch_id }).lean();
            if (branch) branchName = branch.b_name;
        }

        return {
          ...sale,
          branch_name: branchName,
          company_name: companyName,
          product_name: productName,
          model_number: modelNumber,
          amount: sale.amount ?? 0,
          profit_or_loss: sale.profit_or_loss ?? 0,
          sales_date: sale.sales_date || new Date(),
        };
      })
    );

    res.status(200).json(mappedSales);
  } catch (error) {
    console.error("[getAllSales] Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get single sale details
exports.getSaleById = async (req, res) => {
  try {
    const { id } = req.params;
    const sale = await Sale.findOne({ sales_id: id }).lean();

    if (!sale) {
      return res.status(404).json({ error: "Sale not found" });
    }

    // 1. Fetch Company
    let companyName = "Unknown Company";
    if (sale.company_id) {
        const company = await Company.findOne({ c_id: sale.company_id }).lean();
        if (company) companyName = company.cname;
    }

    // 2. Fetch Product
    let productName = "Unknown Product";
    let modelNumber = "N/A";
    if (sale.product_id) {
        const product = await Product.findOne({ prod_id: sale.product_id }).lean();
        if (product) {
            productName = product.Prod_name;
            modelNumber = product.Model_no;
        }
    }

    // 3. Fetch Branch
    let branchName = "Unknown Branch";
    if (sale.branch_id) {
        const branch = await Branch.findOne({ bid: sale.branch_id }).lean();
        if (branch) branchName = branch.b_name;
    }

    // 4. Fetch Salesman (Specific to Details view)
    let salesmanName = "Unknown Salesman";
    if (sale.salesman_id) {
        const salesman = await Employee.findOne({ e_id: sale.salesman_id }).lean();
        if (salesman) {
            salesmanName = `${salesman.f_name} ${salesman.last_name}`;
        }
    }

    const mappedSale = {
      ...sale,
      branch_name: branchName,
      company_name: companyName,
      product_name: productName,
      model_number: modelNumber,
      salesman_name: salesmanName,
      amount: sale.amount ?? 0,
      profit_or_loss: sale.profit_or_loss ?? 0,
      sales_date: sale.sales_date || new Date(),
    };

    res.status(200).json(mappedSale);
  } catch (error) {
    console.error("[getSaleById] Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};