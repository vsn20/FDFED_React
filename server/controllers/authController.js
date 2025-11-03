const User = require('../models/User'); // Your new User model
const Employee = require('../models/employees');
const jwt = require('jsonwebtoken');

// ... (signup function remains the same) ...
exports.signup = async (req, res) => {
    res.status(200).json({ success: true, message: "Signup route is available but not implemented for demo." });
};


exports.login = async (req, res) => {
    // This 'userId' comes from the React form.
    // Based on your new schema, the user will type "EMP002" here.
    const { userId, password } = req.body;

    if (!userId || !password) {
        return res.status(400).json({ message: 'Please provide a userId and password' });
    }

    try {
        // Find user by their login ID (which is 'userId' in your new schema)
        const user = await User.findOne({ userId: userId });
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Compare plain text passwords
        const isMatch = (password === user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // *** THIS IS THE FIX ***
        // Find the employee details using 'user.emp_id' from the User model
        const employee = await Employee.findOne({ e_id: user.emp_id });
        if (!employee) {
            return res.status(404).json({ message: 'Employee profile not found for this user.' });
        }

        // Check the employee's status
        if (employee.status === "resigned" || employee.status === "fired") {
            return res.status(403).json({ message: 'Access denied: Employee is resigned or fired' });
        }

        // Create JWT Payload
        const payload = {
            user: {
                id: user.userId, // This is the login ID (e.g., "EMP002")
                role: employee.role,
                name: employee.f_name
            }
        };

        // Sign the token
        jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: '5h' },
            (err, token) => {
                if (err) throw err;
                res.json({ token, user: payload.user });
            }
        );

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};