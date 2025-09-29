const mongoose = require("mongoose");

const BranchSchema = new mongoose.Schema({
    bid: { 
        type: String, 
        unique: true, 
        required: true 
    }, // Branch ID, unique identifier
    b_name: { 
        type: String, 
        required: true 
    }, // Branch name
    location: { 
        type: String, 
        required: true 
    }, // Branch location (mapped from 'address')
    manager_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Employee",
        default: null
    }, // Reference to Employee as manager
    manager_name: { 
        type: String, 
        default: "Not Assigned" 
    }, // Manager name
    manager_email: { 
        type: String, 
        default: "N/A" 
    }, // Manager email
    manager_ph_no: { 
        type: String, 
        default: "N/A" 
    }, // Manager phone number
    manager_assigned: { 
        type: Boolean, 
        default: false 
    }, // Boolean to indicate if a manager is assigned
    createdAt: { 
        type: Date, 
        default: Date.now 
    }, // Creation timestamp
    active: { 
        type: String, 
        enum: ["active", "inactive"], 
        default: "active" 
    } // Status: active or inactive
});

const Branch = mongoose.model("Branch", BranchSchema);
module.exports = Branch;