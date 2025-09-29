const User = require('../models/User');
const Employee = require('../models/Employee');
const jwt = require('jsonwebtoken');

// A simplified signup function for the demo.
// In a real app, you'd want more validation.
exports.signup = async (req, res) => {
    // This is just a placeholder route for now as requested.
    res.status(200).json({ success: true, message: "Signup route is available but not implemented for demo." });
};

exports.login = async (req, res) => {
    const { userId, password } = req.body;

    if (!userId || !password) {
        return res.status(400).json({ message: 'Please provide a userId and password' });
    }

    try {
        // Find user by their employee ID
        const user = await User.findOne({ userId });
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // IMPORTANT: In a real app, you MUST hash passwords.
        // We are comparing plain text passwords only for this demo.
        const isMatch = (password === user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // If credentials are correct, find the employee details to get their role
        const employee = await Employee.findOne({ e_id: user.userId });
        if (!employee) {
            return res.status(404).json({ message: 'Employee profile not found for this user.' });
        }

        // Create JWT Payload
        const payload = {
            user: {
                id: user.userId,
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
