const Company = require("../../models/Company");

exports.getCompanies = async (req, res) => {
  try {
    const companies = await Company.find();
    res.json(companies);
  }
  catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
}

exports.addCompany = async (req, res) => {
   try {
        const { cname, address, email, phone } = req.body;

        if (!cname || !address || !email || !phone) {
            return res.status(400).send("All fields are required");
        }
        const companyCount = await Company.countDocuments();
        const newCId = `C${String(companyCount + 1).padStart(3, "0")}`;

        const newCompany = new Company({
            c_id: newCId, // Changed from cid
            cname,
            email,
            phone,
            address,
            active: "active",
        });

        await newCompany.save();

        res.json(newCompany);
    } catch (err) {
        console.error(err.message);
        return res.status(500).send("Server Error");
    }
}

exports.getsingleCompany = async (req, res) => {
    try {
        const company = await Company.findOne({ c_id: req.params.id }); // Changed from cid
        if (!company) {
            return res.status(404).send("Company not found");
        } 
        res.json(company);     
    } catch (err) {
        console.error(err.message);
        return res.status(500).send("Server Error");
    } 
}

exports.updateCompany = async (req, res) => {
    try {
        const companyId = req.params.id; // Kept as cid for route compatibility
        const { cname, address, email, phone } = req.body;

        const company = await Company.findOneAndUpdate(
            { c_id: companyId },
            { cname, email, phone, address },
            { new: true, runValidators: true }
        );

        res.json(company);
     
    } catch (err) {
        console.error(err.message);
        return res.status(500).send("Server Error");
    }
}