const mongoose = require("mongoose");

// This is the Employee schema you provided, slightly adjusted for our use case.
const EmployeeSchema = new mongoose.Schema({
  e_id: {
    type: String,
    unique: true,
    required: true
  },
  f_name: {
    type: String,
    required: true
  },
  last_name: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ["owner", "manager", "salesman"],
    required: true
  },
  email: {
    type: String,
    unique: true,
    required: true
  },
  phone_no: {
    type: String,
    default: null
  },
  // We don't need all fields for this demo, but are keeping them from your schema
   address: {
    type: String,
    default: null
  },
  status: {
    type: String,
    enum: ["active", "resigned", "fired"],
    default: "active"
  },
});

const Employee = mongoose.model("Employee", EmployeeSchema);
module.exports = Employee;
