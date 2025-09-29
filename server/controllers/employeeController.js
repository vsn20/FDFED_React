const Employee = require('../models/Employee');
const User = require('../models/User');

// @desc    Get all employees
exports.getEmployees = async (req, res) => {
    try {
        const employees = await Employee.find();
        res.json(employees);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// @desc    Get single employee by e_id
exports.getEmployeeById = async (req, res) => {
    try {
        const employee = await Employee.findOne({ e_id: req.params.id });
        if (!employee) {
            return res.status(404).json({ msg: 'Employee not found' });
        }
        res.json(employee);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// @desc    Add new employee
exports.addEmployee = async (req, res) => {
    const { e_id, f_name, last_name, email, role, phone_no, password } = req.body;

    try {
        // Create the Employee profile first
        let employee = new Employee({
            e_id,
            f_name,
            last_name,
            email,
            role,
            phone_no
        });
        await employee.save();

        // Then create the User login credentials
        // NOTE: We are saving a plain password for the demo as requested.
        let user = new User({
            userId: e_id,
            password: password 
        });
        await user.save();

        res.json(employee);
    } catch (err) {
        console.error(err.message);
        // Handle cases where employee or user might already exist
        if (err.code === 11000) {
            return res.status(400).json({ msg: 'Employee or User with this ID or email already exists.' });
        }
        res.status(500).send('Server Error');
    }
};


// @desc    Update employee
exports.updateEmployee = async (req, res) => {
    const { f_name, last_name, email, role, phone_no } = req.body;
    
    // Build employee object
    const employeeFields = {};
    if (f_name) employeeFields.f_name = f_name;
    if (last_name) employeeFields.last_name = last_name;
    if (email) employeeFields.email = email;
    if (role) employeeFields.role = role;
    if (phone_no) employeeFields.phone_no = phone_no;

    try {
        let employee = await Employee.findOne({ e_id: req.params.id });
        if (!employee) return res.status(404).json({ msg: 'Employee not found' });

        employee = await Employee.findOneAndUpdate(
            { e_id: req.params.id },
            { $set: employeeFields },
            { new: true }
        );

        res.json(employee);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};
