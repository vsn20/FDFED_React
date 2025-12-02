const Employee = require("../../models/employees");
const Branch = require("../../models/branches");

exports.getEmployees = async (req, res) => {
  try {
    const employees = await Employee.find({
  status: { $in: ["active", "resigned", "fired"] }
});

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

    if (role === "manager" && bidValue) 
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

    if(role==='salesman'){
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

    if (role === "manager" && bidValue) {
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
    let {
      f_name,
      last_name,
      role, // This is the NEW role
      bid, // This is the NEW bid
      email,
      phone_no,
      acno,
      ifsc,
      bankname,
      base_salary,
      address,
      status
    } = req.body;

    // Prevent assigning 'owner' role
    if (role === "owner") {
      return res.status(403).json({
        success: false,
        message: "Owner role cannot be assigned via this endpoint"
      });
    }

    // --- START: LOGIC FIX ---

    // 1. Find the employee FIRST to get their original state
    const employee = await Employee.findOne({ e_id });
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found"
      });
    }

    // 2. Store the original role and branch ID
    const originalBid = employee.bid;
    const originalRole = employee.role;

    // 3. Determine the new values
    const newBidValue = bid === "null" ? null : bid;
    const newRole = role || originalRole; // Use new role, or keep original if not provided

    // 4. Validate the NEW branch assignment (if they are a manager)
    if (newRole === "manager" && newBidValue) {
      const branch = await Branch.findOne({ bid: newBidValue });
      if (!branch) {
        return res.status(404).json({
          success: false,
          message: `Branch ${newBidValue} not found`
        });
      }
      // Check if branch is already assigned to SOMEONE ELSE
      if (
        branch.manager_assigned &&
        branch.manager_id.toString() !== employee._id.toString()
      ) {
        return res.status(400).json({
          success: false,
          message: `Branch ${newBidValue} already has a Sales Manager assigned`
        });
      }
    }
    
    // 5. Update the employee document with all new data
    const updatedEmployee = await Employee.findOneAndUpdate(
      { e_id },
      {
        f_name,
        last_name,
        role: newRole,
        bid: newBidValue,
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

    if (!updatedEmployee) {
      // This check is technically redundant now but good practice
      return res.status(404).json({
        success: false,
        message: "Employee not found during update"
      });
    }

    // 6. Handle Branch (de-)assignment based on original and new state

    // 6a. Clear the OLD branch if:
    // - Employee WAS a manager
    // - Employee WAS assigned to a branch
    // - AND (Employee's branch changed OR Employee is no longer a manager)
    if (originalRole === "manager" && originalBid && (originalBid !== newBidValue || newRole !== "manager")) {
      await Branch.findOneAndUpdate(
        { bid: originalBid },
        {
          manager_id: null,
          manager_name: "Not Assigned",
          manager_email: "N/A",
          manager_ph_no: "N/A",
          manager_assigned: false
        }
      );
    }

    // 6b. Assign the NEW branch if:
    // - Employee IS a manager
    // - Employee IS assigned to a new branch
    if (newRole === "manager" && newBidValue) {
      await Branch.findOneAndUpdate(
        { bid: newBidValue },
        {
          manager_id: updatedEmployee._id,
          manager_name: `${f_name} ${last_name}`,
          manager_email: email,
          manager_ph_no: phone_no || "N/A",
          manager_assigned: true
        }
      );
    }

    // --- END: LOGIC FIX ---

    res.json({
      success: true,
      message: "Employee updated successfully",
      employee: updatedEmployee
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
