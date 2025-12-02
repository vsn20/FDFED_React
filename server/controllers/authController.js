const User = require('../models/User');
const Employee = require('../models/employees');
const jwt = require('jsonwebtoken');

// 1. Implement the Signup Logic (Migrated from signup.js)
exports.signup = async (req, res) => {
    const { userId, email, password, confirmPassword } = req.body;

    // Basic Validation
    if (!userId || !email || !password || !confirmPassword) {
        return res.status(400).json({ message: "Please enter all fields." });
    }

    if (password !== confirmPassword) {
        return res.status(400).json({ message: "Passwords do not match." });
    }

    try {
        // Check if User ID is taken
        const existingUser = await User.findOne({ userId });
        if (existingUser) {
            return res.status(400).json({ message: "User ID already taken." });
        }

        // Check if Email exists in Employee table
        const employee = await Employee.findOne({ email });
        if (!employee) {
            return res.status(404).json({ message: "You are not a registered employee. Contact Admin." });
        }

        // Check if account already exists for this employee
        const existingUserByEmpId = await User.findOne({ emp_id: employee.e_id });
        if (existingUserByEmpId) {
            return res.status(400).json({ message: "Account already created for this employee." });
        }

        // Create new user
        // Note: Ensure your User model hashes the password in a 'pre-save' hook, 
        // or hash it here using bcrypt before saving.
        const newUser = new User({
            userId,
            emp_id: employee.e_id,
            password: password 
        });

        await newUser.save();

        // Create JWT Payload (Auto-login after signup)
        const payload = {
            user: {
                id: newUser.userId,
                role: employee.role,
                name: employee.f_name
            }
        };

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
        res.status(500).send('Server Error: ' + err.message);
    }
};

// 2. Login Logic (Existing, slightly refined)
exports.login = async (req, res) => {
    const { userId, password } = req.body;

    if (!userId || !password) {
        return res.status(400).json({ message: 'Please provide a userId and password' });
    }

    try {
        const user = await User.findOne({ userId }); // Match schema: userId
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Note: In production, use bcrypt.compare(password, user.password)
        const isMatch = (password === user.password);
        
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const employee = await Employee.findOne({ e_id: user.emp_id });
        if (!employee) {
            return res.status(404).json({ message: 'Employee profile not found.' });
        }

        if (employee.status === "resigned" || employee.status === "fired") {
            return res.status(403).json({ message: 'Access denied: Employee is no longer active.' });
        }

        const payload = {
            user: {
                id: user.userId,
                role: employee.role,
                name: employee.f_name
            }
        };

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