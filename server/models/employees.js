const mongoose = require("mongoose");

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
    enum: ["owner", "Salesmanager", "salesman"],
    required: true
  },
  bid: {
    type: String,
    ref: "Branch",
    default: null
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
  hiredAt: {
    type: Date,
    default: Date.now
  },
  address: {
    type: String,
    default: null
  },
  status: {
    type: String,
    enum: ["active", "resigned", "fired"],
    default: "active"
  },
  resignation_date: {
    type: Date,
    default: null
  },
  fired_date: {
    type: Date,
    default: null
  },
  reason_for_exit: {
    type: String,
    default: null
  },
  acno: {
    type: String,
    required: true
  },
  ifsc: {
    type: String,
    required: true
  },
  bankname: {
    type: String,
    required: true
  },
  base_salary: {
    type: Number,
    required: true
  },
  createdBy: {
    type: String,
    required: true
  }
});

const Employee = mongoose.model("Employee", EmployeeSchema);
module.exports = Employee;