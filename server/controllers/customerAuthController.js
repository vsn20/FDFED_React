const Sale = require('../models/sale'); 
const jwt = require('jsonwebtoken');

// @route   POST api/auth/customer/login
// @desc    Verify customer phone number exists in Sales and return Token
exports.customerLogin = async (req, res) => {
    const { mobileNumber } = req.body;

    // 1. Basic Validation
    if (!mobileNumber) {
        return res.status(400).json({ message: 'Please provide a mobile number' });
    }

    const trimmedMobileNumber = mobileNumber.trim();

    try {
        // 2. Check if this mobile number exists in any previous sale
        // We assume 'phone_number' is the field name in your Sale model based on the schema provided
        const saleExists = await Sale.findOne({ phone_number: trimmedMobileNumber });

        if (!saleExists) {
            return res.status(404).json({ 
                message: 'No purchase history found for this number. You need a purchase to log in.' 
            });
        }

        // 3. Create JWT Payload
        const payload = {
            user: {
                id: trimmedMobileNumber, 
                role: 'customer',
                name: trimmedMobileNumber, // Display mobile number as name in Topbar
                phone: trimmedMobileNumber
            }
        };

        // 4. Sign Token
        jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: '24h' }, 
            (err, token) => {
                if (err) throw err;
                res.json({ token, user: payload.user });
            }
        );

    } catch (err) {
        console.error("Customer Login Error:", err.message);
        res.status(500).send('Server Error');
    }
};