const Branch = require("../../models/branches");

exports.getBranches = async (req, res) => {
  try {
    const branches = await Branch.find({ active: "active" });
    res.json(branches);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};

exports.addBranch = async (req, res) => {
  try {
    const { b_name, address } = req.body;

    if (!b_name || !address) {
      return res.status(400).send("All fields are required");
    }

    const branchCount = await Branch.countDocuments();
    const newBid = `B${String(branchCount + 1).padStart(3, "0")}`;

    const newBranch = new Branch({
      bid: newBid,
      b_name,
      location: address,
      manager_id: null,
      manager_name: "Not Assigned",
      manager_email: "N/A",
      manager_ph_no: "N/A",
      manager_assigned: false,
      active: "active",
    });

    await newBranch.save();
    res.json(newBranch);
  } catch (err) {
    console.error(err.message);
    return res.status(500).send("Server Error");
  }
};

exports.getSingleBranch = async (req, res) => {
  try {
    const branch = await Branch.findOne({ bid: req.params.bid });
    if (!branch) {
      return res.status(404).send("Branch not found");
    }
    res.json(branch);
  } catch (err) {
    console.error(err.message);
    return res.status(500).send("Server Error");
  }
};

exports.updateBranch = async (req, res) => {
  try {
    const branchId = req.params.bid;
    const { b_name, address } = req.body;

    const branch = await Branch.findOneAndUpdate(
      { bid: branchId },
      { b_name, location: address },
      { new: true, runValidators: true }
    );

    if (!branch) {
      return res.status(404).send("Branch not found");
    }

    res.json(branch);
  } catch (err) {
    console.error(err.message);
    return res.status(500).send("Server Error");
  }
};