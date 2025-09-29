const mongoose = require("mongoose");

const companySchema = new mongoose.Schema({
    c_id: { type: String, unique: true, required: true }, // Changed from cid
    cname: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    active: { type: String, enum: ["active", "inactive"], default: "active" }
});

module.exports = mongoose.model("Company", companySchema);