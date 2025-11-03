const User = require('../models/User'); 
const Company = require('../models/company'); //
const jwt = require('jsonwebtoken');

// @route   POST api/auth/company/login
// @desc    Authenticate company user & get token
exports.login = async (req, res) => {
    const { userId, password } = req.body;

    if (!userId || !password) {
        return res.status(400).json({ message: 'Please provide a userId and password' });
    }

    try {
        // Find user by their login ID
        const user = await User.findOne({ userId: userId });
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Compare plain text password
        const isMatch = (password === user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Check if this user is a company user
        if (!user.c_id) {
            return res.status(403).json({ message: 'Access denied. Not a company account.' });
        }

        // Find the associated company
        const company = await Company.findOne({ c_id: user.c_id });
        if (!company) {
            return res.status(404).json({ message: 'Company profile not found for this user.' });
        }
        
        // Added check from your company.js schema
        if (company.active === "inactive") {
             return res.status(403).json({ message: 'This company account is inactive.' });
        }

        // Create JWT Payload
        const payload = {
            user: {
                id: user.userId,
                role: 'company', // Set role explicitly
                name: company.cname,
                c_id: company.c_id
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

// @route   POST api/auth/company/signup
// @desc    Register a company user
exports.signup = async (req, res) => {
    const { userId, email, password, confirm_password } = req.body;

    // Validate password match
    if (password !== confirm_password) {
        return res.status(400).json({ message: 'Passwords do not match' });
    }

    try {
        // Check if user_id is already taken
        let user = await User.findOne({ userId: userId });
        if (user) {
            return res.status(400).json({ message: 'User ID already taken' });
        }

        // Check if email exists in Company model
        const company = await Company.findOne({ email });
        if (!company) {
            return res.status(404).json({ message: 'Company email not found. Please register your company first.' });
        }
        
        if (company.active === "inactive") {
             return res.status(403).json({ message: 'This company account is inactive.' });
        }

        // Create new user with c_id from Company
        user = new User({
            userId: userId,
            c_id: company.c_id,
            emp_id: null, // Ensure emp_id is null
            password // Still plain text
        });
        
        await user.save();

        // Create JWT Payload
        const payload = {
            user: {
                id: user.userId,
                role: 'company',
                name: company.cname,
                c_id: company.c_id
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