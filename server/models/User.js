const mongoose = require('mongoose');

// This schema is for authentication. It links a user's login credentials
// to their employee profile.
const UserSchema = new mongoose.Schema({
    // We'll use the employee ID as the main user identifier for login
    userId: {
        type: String,
        required: [true, 'User ID is required'],
        unique: true,
        ref: 'Employee' // This creates a reference to the Employee model
    },
    emp_id: {
        type: String,
        trim: true // Made optional for companies
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: 6,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model('User', UserSchema);
