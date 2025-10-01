const Employee = require("../../models/employees");
const Branch = require("../../models/branches");
const User = require("../../models/User");

exports.getSalesmanDetails = async (req, res) => {
  try {
    console.log("req.user:", req.user);
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: No user found",
      });
    }

    console.log("Searching User with userId:", req.user.id);
    const user = await User.findOne({ userId: req.user.id }).lean();
    console.log("User found:", user);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const emp_id = user.emp_id;
    console.log("emp_id:", emp_id);
    if (!emp_id) {
      return res.status(404).json({
        success: false,
        message: "Employee ID not found for this user",
      });
    }

    console.log("Searching Employee with e_id:", emp_id);
    const salesman = await Employee.findOne({ e_id: emp_id }).lean();
    console.log("Salesman found:", salesman);
    if (!salesman) {
      return res.status(404).json({
        success: false,
        message: "Salesman not found",
      });
    }

    let branchName = "Unknown Branch";
    if (salesman.bid) {
      const branch = await Branch.findOne({ bid: salesman.bid }).lean();
      if (branch && branch.b_name) {
        branchName = branch.b_name;
      }
    }

    const hireDate = salesman.hiredAt || new Date();
    const resignationDate = salesman.resignation_date || null;
    const firedDate = salesman.fired_date || null;
    const response = {
      salesmanId: salesman.e_id || "N/A",
      firstName: salesman.f_name || "Unknown",
      lastName: salesman.last_name || "Unknown",
      role: salesman.role || "Salesman",
      status: salesman.status.charAt(0).toUpperCase() + salesman.status.slice(1) || "Active",
      branch: branchName,
      email: salesman.email || "N/A",
      phoneNumber: salesman.phone_no || "N/A",
      registrationDate: hireDate,
      formattedRegistrationDate: hireDate
        ? new Date(hireDate).toLocaleDateString("en-US", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
          })
        : "N/A",
      accountNumber: salesman.acno || "N/A",
      ifsc: salesman.ifsc || "N/A",
      bank: salesman.bankname || "N/A",
      hireDate: hireDate,
      formattedHireDate: hireDate
        ? new Date(hireDate).toLocaleDateString("en-US", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
          })
        : "N/A",
      resignationDate: resignationDate,
      formattedResignationDate: resignationDate
        ? new Date(resignationDate).toLocaleDateString("en-US", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
          })
        : "N/A",
      firedDate: firedDate,
      formattedFiredDate: firedDate
        ? new Date(firedDate).toLocaleDateString("en-US", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
          })
        : "N/A",
      reasonForExit: salesman.reason_for_exit || "N/A",
      monthlySalary: salesman.base_salary || 0,
      address: salesman.address || "N/A",
      createdBy: salesman.createdBy || "System",
    };

    res.json(response);
  } catch (err) {
    console.error("Error in getSalesmanDetails:", err.message);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

exports.updateSalesmanDetails = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: No user found",
      });
    }

    const user = await User.findOne({ userId: req.user.id }).lean();
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const emp_id = user.emp_id;
    if (!emp_id) {
      return res.status(404).json({
        success: false,
        message: "Employee ID not found for this user",
      });
    }

    const employee = await Employee.findOne({ e_id: emp_id });
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }

    const {
      firstName,
      lastName,
      status,
      email,
      phoneNumber,
      accountNumber,
      ifsc,
      bank,
      address,
      resignationDate,
      firedDate,
      reasonForExit,
      baseSalary,
    } = req.body;

    // Validate required fields
    if (accountNumber === undefined || accountNumber === "") {
      return res.status(400).json({
        success: false,
        message: "Account number is required",
      });
    }
    if (ifsc === undefined || ifsc === "") {
      return res.status(400).json({
        success: false,
        message: "IFSC code is required",
      });
    }
    if (bank === undefined || bank === "") {
      return res.status(400).json({
        success: false,
        message: "Bank name is required",
      });
    }
    if (baseSalary === undefined || baseSalary < 0) {
      return res.status(400).json({
        success: false,
        message: "Base salary is required and must be non-negative",
      });
    }

    const branch = await Branch.findOne({ manager_id: employee._id });
    const wasManager = !!branch;

    // Update fields, respecting schema requirements
    employee.f_name = firstName !== undefined && firstName !== "" ? firstName : employee.f_name;
    employee.last_name = lastName !== undefined && lastName !== "" ? lastName : employee.last_name;
    employee.status = status !== undefined && ["active", "resigned", "fired"].includes(status.toLowerCase())
      ? status.toLowerCase()
      : employee.status;
    employee.email = email !== undefined && email !== "" ? email : employee.email;
    employee.phone_no = phoneNumber !== undefined ? phoneNumber || null : employee.phone_no;
    employee.acno = accountNumber;
    employee.ifsc = ifsc;
    employee.bankname = bank;
    employee.address = address !== undefined ? address || null : employee.address;
    employee.resignation_date = resignationDate !== undefined ? (resignationDate ? new Date(resignationDate) : null) : employee.resignation_date;
    employee.fired_date = firedDate !== undefined ? (firedDate ? new Date(firedDate) : null) : employee.fired_date;
    employee.reason_for_exit = reasonForExit !== undefined ? reasonForExit || null : employee.reason_for_exit;
    employee.base_salary = baseSalary;
    employee.createdBy = "System"; // Set createdBy to "System" always

    await employee.save();

    if (wasManager && (employee.status === "resigned" || employee.status === "fired")) {
      await Branch.findOneAndUpdate(
        { manager_id: employee._id },
        {
          manager_id: null,
          manager_name: "Not Assigned",
          manager_email: "N/A",
          manager_ph_no: "N/A",
          manager_assigned: false,
        }
      );
    }

    res.json({
      success: true,
      message: "Employee details updated successfully",
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({
      success: false,
      message: "Error updating employee details: " + err.message,
    });
  }
};