const Employee = require("../../models/employees");
const User = require("../../models/User");
const Branch = require("../../models/branches");

exports.getEmployees = async (req, res) => {
  try {
    console.log('Manager getEmployees hit - req.user:', req.user);

    const userDoc = await User.findOne({ userId: req.user.id });
    if (!userDoc) {
      console.log('User not found by userId:', req.user.id);
      return res.status(404).json({ success: false, message: "User profile not found" });
    }

    const managerEId = userDoc.emp_id;
    if (!managerEId) {
      console.log('No emp_id for user:', userDoc.userId);
      return res.status(404).json({ success: false, message: "Employee ID not found" });
    }

    console.log('Manager EID:', managerEId);

    const managerEmployee = await Employee.findOne({ e_id: managerEId });
    if (!managerEmployee) {
      console.log('Manager employee not found:', managerEId);
      return res.status(404).json({ success: false, message: "Manager profile not found" });
    }

    if (managerEmployee.role !== "manager") {
      console.log('Role mismatch:', managerEmployee.role);
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    const bid = managerEmployee.bid;
    console.log('Manager BID:', bid);

    if (!bid) {
      console.log('No bid for manager, returning empty array');
      return res.json([]);
    }

    const branches = await Branch.find({}).select('bid b_name');
    const branchMap = new Map(branches.map(b => [b.bid, b.b_name]));

    // FIXED: Ensure query fetches ALL statuses explicitly (no filter) - this includes fired/resigned
    const employees = await Employee.find({ 
      bid: bid, 
      role: "salesman"
    }).lean(); // Use .lean() for faster query if needed

    // ENHANCED DEBUG: Log count per status
    const statusCounts = employees.reduce((acc, emp) => {
      acc[emp.status] = (acc[emp.status] || 0) + 1;
      return acc;
    }, {});
    console.log('Status counts in branch:', statusCounts);
    console.log('All fetched employees:', employees.map(emp => ({ e_id: emp.e_id, status: emp.status, bid: emp.bid })));

    const mappedEmployees = employees.map(emp => ({
      ...emp,
      branch_name: branchMap.get(emp.bid) || 'Not Assigned',
      formattedHireDate: emp.hiredAt ? new Date(emp.hiredAt).toLocaleDateString() : 'N/A'
    }));

    console.log('Returning', mappedEmployees.length, 'employees');

    res.json(mappedEmployees);
  } catch (err) {
    console.error('Error in getEmployees:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getManagerProfile = async (req, res) => {
  try {
    console.log('getManagerProfile hit - req.user:', req.user); // DEBUG

    // FIXED: Find User by userId (String)
    const userDoc = await User.findOne({ userId: req.user.id });
    if (!userDoc) {
      console.log('User not found by userId:', req.user.id);
      return res.status(404).json({ success: false, message: "User profile not found" });
    }

    const managerEId = userDoc.emp_id;
    if (!managerEId) {
      console.log('No emp_id for user:', userDoc.userId);
      return res.status(404).json({ success: false, message: "Employee ID not found" });
    }

    console.log('Manager EID:', managerEId); // DEBUG

    const managerEmployee = await Employee.findOne({ e_id: managerEId });
    if (!managerEmployee) {
      console.log('Manager employee not found:', managerEId);
      return res.status(404).json({ success: false, message: "Manager profile not found" });
    }

    if (managerEmployee.role !== "manager") {
      console.log('Role mismatch:', managerEmployee.role);
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    // Return the manager employee data
    res.json({
      ...managerEmployee.toObject(),
      branch_name: managerEmployee.bid ? (await Branch.findOne({ bid: managerEmployee.bid }))?.b_name || 'Not Assigned' : 'Not Assigned'
    });
  } catch (err) {
    console.error('Error in getManagerProfile:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getSingleEmployee = async (req, res) => {
  try {
    const { e_id } = req.params;
    console.log('getSingleEmployee hit for', e_id, 'req.user.id:', req.user.id);

    // find by userId
    const userDoc = await User.findOne({ userId: req.user.id });
    if (!userDoc) {
      return res.status(404).json({ success: false, message: "User profile not found" });
    }

    const managerEId = userDoc.emp_id;
    if (!managerEId) {
      return res.status(404).json({ success: false, message: "Employee ID not found" });
    }

    const managerEmployee = await Employee.findOne({ e_id: managerEId });
    if (!managerEmployee) {
      return res.status(404).json({ success: false, message: "Manager profile not found" });
    }

    if (managerEmployee.role !== "manager") {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    const bid = managerEmployee.bid;
    if (!bid) {
      return res.status(404).json({ success: false, message: "No branch assigned" });
    }

    const employee = await Employee.findOne({ e_id, bid });
    if (!employee) {
      return res.status(404).json({ success: false, message: "Employee not found" });
    }

    const branches = await Branch.find({}).select('bid b_name');
    const branchMap = new Map(branches.map(b => [b.bid, b.b_name]));
    const branchName = branchMap.get(employee.bid) || 'Not Assigned';

    // Return raw like owner, with extras
    const mappedEmployee = {
      ...employee.toObject(),
      branch_name: branchName,
      formattedHireDate: employee.hiredAt ? new Date(employee.hiredAt).toLocaleDateString() : 'N/A'
    };

    res.json(mappedEmployee);
  } catch (err) {
    console.error('Error in getSingleEmployee:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateEmployee = async (req, res) => {
  try {
    const { e_id } = req.params;
    console.log('updateEmployee hit for', e_id, 'req.user.id:', req.user.id);

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
      address,
      status
    } = req.body;

    // FIXED: Same lookup
    const userDoc = await User.findOne({ userId: req.user.id });
    if (!userDoc) {
      return res.status(404).json({ success: false, message: "User profile not found" });
    }

    const managerEId = userDoc.emp_id;
    if (!managerEId) {
      return res.status(404).json({ success: false, message: "Employee ID not found" });
    }

    const managerEmployee = await Employee.findOne({ e_id: managerEId });
    if (!managerEmployee) {
      return res.status(404).json({ success: false, message: "Manager profile not found" });
    }

    if (managerEmployee.role !== "manager") {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    const managerBid = managerEmployee.bid;
    if (!managerBid) {
      return res.status(400).json({ success: false, message: "Manager not assigned to a branch" });
    }

    const employee = await Employee.findOne({ e_id });
    if (!employee || employee.bid !== managerBid) {
      return res.status(403).json({ success: false, message: "Not authorized to update this employee" });
    }

    // Enforce for manager updates
    const newRole = "salesman";
    const newBidValue = managerBid;

    // Use the same update logic as owner updateEmployee
    const originalRole = employee.role;
    const originalBid = employee.bid;

    // Validate new role/bid if changed (but since locked, minimal)
    if (newRole === "manager" && newBidValue) {
      // Skip for salesman
    }

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
      return res.status(404).json({ success: false, message: "Employee not found during update" });
    }

    // Handle branch de-assignment if needed (unlikely for salesman)
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

    // Assign new if manager (not for salesman)
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

    res.json({
      success: true,
      message: "Employee updated successfully",
      employee: updatedEmployee
    });
  } catch (err) {
    console.error('Error in updateEmployee:', err);
    if (err.name === "ValidationError") {
      return res.status(400).json({ success: false, message: `Validation error: ${err.message}` });
    }
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateManagerProfile = async (req, res) => {
  try {
    console.log('updateManagerProfile hit - req.user.id:', req.user.id);

    let {
      f_name,
      last_name,
      email,
      phone_no,
      acno,
      ifsc,
      bankname,
      address,
      role,
      bid
    } = req.body;

    // FIXED: Find User by userId
    const userDoc = await User.findOne({ userId: req.user.id });
    if (!userDoc) {
      return res.status(404).json({ success: false, message: "User profile not found" });
    }

    const managerEId = userDoc.emp_id;
    if (!managerEId) {
      return res.status(404).json({ success: false, message: "Employee ID not found" });
    }

    const managerEmployee = await Employee.findOne({ e_id: managerEId });
    if (!managerEmployee) {
      return res.status(404).json({ success: false, message: "Manager profile not found" });
    }

    if (managerEmployee.role !== "manager") {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    // Enforce role and bid
    const newRole = "manager";
    const newBidValue = managerEmployee.bid;

    // Update only allowed fields (no status or salary change for self-edit)
    const updateFields = {
      f_name: f_name || managerEmployee.f_name,
      last_name: last_name || managerEmployee.last_name,
      email: email || managerEmployee.email,
      phone_no: phone_no || managerEmployee.phone_no,
      acno: acno || managerEmployee.acno,
      ifsc: ifsc || managerEmployee.ifsc,
      bankname: bankname || managerEmployee.bankname,
      address: address || managerEmployee.address,
      role: newRole,
      bid: newBidValue,
    };

    const updatedEmployee = await Employee.findOneAndUpdate(
      { e_id: managerEId },
      updateFields,
      { new: true, runValidators: true }
    );

    if (!updatedEmployee) {
      return res.status(404).json({ success: false, message: "Profile not found during update" });
    }

    res.json({
      success: true,
      message: "Profile updated successfully",
      employee: updatedEmployee
    });
  } catch (err) {
    console.error('Error in updateManagerProfile:', err);
    if (err.name === "ValidationError") {
      return res.status(400).json({ success: false, message: `Validation error: ${err.message}` });
    }
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.addSalesman = async (req, res) => {
  try {
    let {
      f_name,
      last_name,
      email,
      phone_no,
      acno,
      ifsc,
      bankname,
      base_salary,
      address,
      role,
      bid
    } = req.body;

    // Enforce role and bid
    if (role !== "salesman") {
      return res.status(400).json({
        success: false,
        message: "Role must be 'salesman'"
      });
    }

    // Validate required fields
    if (!f_name || !last_name || !email || !acno || !ifsc || !bankname || !base_salary) {
      return res.status(400).json({
        success: false,
        message: "All required fields must be provided"
      });
    }

    // Get manager's bid
    const userDoc = await User.findOne({ userId: req.user.id });
    if (!userDoc || !userDoc.emp_id) {
      return res.status(404).json({ success: false, message: "Manager profile not found" });
    }

    const managerEmployee = await Employee.findOne({ e_id: userDoc.emp_id });
    if (!managerEmployee || managerEmployee.role !== "manager") {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    const managerBid = managerEmployee.bid;
    if (!managerBid) {
      return res.status(400).json({ success: false, message: "Manager not assigned to a branch" });
    }

    // Enforce bid to manager's branch
    const bidValue = managerBid;

    const employeeCount = await Employee.countDocuments();
    const e_id = `EMP${String(employeeCount + 1).padStart(3, "0")}`;

    const newEmployee = new Employee({
      e_id,
      f_name,
      last_name,
      role: "salesman",
      status: "active",
      bid: bidValue,
      email,
      phone_no: phone_no || null,
      address: address || null,
      acno,
      ifsc,
      bankname,
      base_salary,
      createdBy: managerEmployee.e_id,
      hiredAt: new Date(),
      resignation_date: null,
      fired_date: null,
      reason_for_exit: null
    });

    await newEmployee.save();

    res.status(201).json({
      success: true,
      message: "Salesman added successfully",
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
      message: "Error adding salesman: " + err.message
    });
  }
};