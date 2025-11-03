const Employee = require("../../models/employees");
const Branch = require("../../models/branches");

exports.getEmployees = async (req, res) => {
  try {
    const employees = await Employee.find({ status: "active" });
    res.json(employees);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

exports.addEmployee = async (req, res) => {
  try {
    let {
      f_name,
      last_name,
      role,
      bid,
      email,
      phone_no,
      acno,
      ifsc,
      bankname,
      base_salary,
      address
    } = req.body;

    // Prevent assigning 'owner' role if not allowed
    if (role === "owner") {
      return res.status(403).json({
        success: false,
        message: "Owner role cannot be assigned via this endpoint"
      });
    }

    // Validate required fields
    if (!f_name || !last_name || !role || !email || !acno || !ifsc || !bankname || !base_salary) {
      return res.status(400).json({
        success: false,
        message: "All required fields must be provided"
      });
    }

    const employeeCount = await Employee.countDocuments();
    const e_id = `EMP${String(employeeCount + 1).padStart(3, "0")}`;

    const createdBy = req.user ? req.user.role : "owner";

    const bidValue = bid === "null" ? null : bid;

    if (role === "Sales Manager" && bidValue) 
    {
      role='manager';
      const branch = await Branch.findOne({ bid: bidValue });
      if (!branch) {
        return res.status(404).json({
          success: false,
          message: `Branch ${bidValue} not found`
        });
      }
      if (branch.manager_assigned) {
        return res.status(400).json({
          success: false,
          message: `Branch ${bidValue} already has a Sales Manager assigned`
        });
      }
    }

    if(role==='Salesman'){
      role='salesman';
    }

    const newEmployee = new Employee({
      e_id,
      f_name,
      last_name,
      role,
      status: "active",
      bid: bidValue,
      email,
      phone_no: phone_no || null,
      address: address || null,
      acno,
      ifsc,
      bankname,
      base_salary,
      createdBy,
      hiredAt: new Date(),
      resignation_date: null,
      fired_date: null,
      reason_for_exit: null
    });

    await newEmployee.save();

    if (role === "Sales Manager" && bidValue) {
      await Branch.findOneAndUpdate(
        { bid: bidValue },
        {
          manager_id: newEmployee._id,
          manager_name: `${f_name} ${last_name}`,
          manager_email: email,
          manager_ph_no: phone_no || "N/A",
          manager_assigned: true
        }
      );
    }

    res.status(201).json({
      success: true,
      message: "Employee added successfully",
      employee: newEmployee
    });
  } catch (err) {
    console.error(err.message);
    if (err.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: `Validation error: ${err.message}`
      });
    }
    res.status(500).json({
      success: false,
      message: "Error adding employee: " + err.message
    });
  }
};

exports.getSingleEmployee = async (req, res) => {
  try {
    const employee = await Employee.findOne({ e_id: req.params.e_id });
    if (!employee) {
      return res.status(404).json({ success: false, message: "Employee not found" });
    }
    res.json(employee);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

exports.updateEmployee = async (req, res) => {
  try {
    const { e_id } = req.params;
    const {
      f_name,
      last_name,
      role,
      bid,
      email,
      phone_no,
      acno,
      ifsc,
      bankname,
      base_salary,
      address,
      status
    } = req.body;

    // Prevent assigning 'owner' role if not allowed
    if (role === "owner") {
      return res.status(403).json({
        success: false,
        message: "Owner role cannot be assigned via this endpoint"
      });
    }

    const bidValue = bid === "null" ? null : bid;

    if (role === "Sales Manager" && bidValue) {
      const branch = await Branch.findOne({ bid: bidValue });
      if (!branch) {
        return res.status(404).json({
          success: false,
          message: `Branch ${bidValue} not found`
        });
      }
      if (
        branch.manager_assigned &&
        branch.manager_id.toString() !== (await Employee.findOne({ e_id }))._id.toString()
      ) {
        return res.status(400).json({
          success: false,
          message: `Branch ${bidValue} already has a Sales Manager assigned`
        });
      }
    }

    const employee = await Employee.findOneAndUpdate(
      { e_id },
      {
        f_name,
        last_name,
        role,
        bid: bidValue,
        email,
        phone_no: phone_no || null,
        acno,
        ifsc,
        bankname,
        base_salary,
        address: address || null,
        status,
        ...(status === "resigned" && { resignation_date: new Date(), fired_date: null, reason_for_exit: null }),
        ...(status === "fired" && { fired_date: new Date(), resignation_date: null, reason_for_exit: null })
      },
      { new: true, runValidators: true }
    );

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found"
      });
    }

    if (role === "Sales Manager" && bidValue) {
      await Branch.findOneAndUpdate(
        { bid: bidValue },
        {
          manager_id: employee._id,
          manager_name: `${f_name} ${last_name}`,
          manager_email: email,
          manager_ph_no: phone_no || "N/A",
          manager_assigned: true
        }
      );
    } else if (employee.bid && (role !== "Sales Manager" || !bidValue)) {
      await Branch.findOneAndUpdate(
        { bid: employee.bid },
        {
          manager_id: null,
          manager_name: "Not Assigned",
          manager_email: "N/A",
          manager_ph_no: "N/A",
          manager_assigned: false
        }
      );
    }

    res.json({
      success: true,
      message: "Employee updated successfully",
      employee
    });
  } catch (err) {
    console.error(err.message);
    if (err.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: `Validation error: ${err.message}`
      });
    }
    res.status(500).json({
      success: false,
      message: "Error updating employee: " + err.message
    });
  }
};