const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: [true, 'User ID is required'],
        unique: true,
        ref: 'Employee' 
    },
    emp_id: {
        type: String,
        trim: true,
        default: null // Explicitly set default
    },
    // --- ADD THIS FIELD ---
    c_id: {
        type: String,
        trim: true,
        default: null // This user is either an employee OR a company user
    },
    // -----------------------
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

// ============ DB OPTIMIZATION: INDEXES ============
// B-Tree index for signup duplicate check
UserSchema.index({ emp_id: 1 });
// B-Tree index for company user lookups
UserSchema.index({ c_id: 1 });
// ===================================================

module.exports = mongoose.model('User', UserSchema);