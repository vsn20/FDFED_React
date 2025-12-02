import React, { useState } from 'react';
import { useDispatch } from 'react-redux'; // NEW: Redux Hook
import { addEmployeeSuccess } from '../../../redux/slices/managerEmployeeSlice'; // NEW: Redux Action
import api from '../../../api/api';
import styles from './Details.module.css';

const ManagerAddEmployee = ({ handleBack, manager }) => {
    const dispatch = useDispatch(); // NEW: Initialize dispatch
    const [formData, setFormData] = useState({
        f_name: '',
        last_name: '',
        email: '',
        phone_no: '',
        acno: '',
        ifsc: '',
        bankname: '',
        base_salary: '',
        address: '',
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [validationErrors, setValidationErrors] = useState({});

    const validateForm = () => {
        const errors = {};
        // Required fields with min length for names
        if (!formData.f_name.trim() || formData.f_name.trim().length < 2) {
            errors.f_name = formData.f_name.trim() ? 'First name must be at least 2 letters.' : 'First name is required.';
        }
        if (!formData.last_name.trim() || formData.last_name.trim().length < 2) {
            errors.last_name = formData.last_name.trim() ? 'Last name must be at least 2 letters.' : 'Last name is required.';
        }
        if (!formData.email.trim()) {
            errors.email = 'Email is required.';
        } else {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(formData.email)) {
                errors.email = 'Please enter a valid email address with @.';
            }
        }
        if (!formData.phone_no.trim()) {
            errors.phone_no = 'Phone number is required.';
        } else if (!/^\d{10}$/.test(formData.phone_no)) {
            errors.phone_no = 'Phone number must be exactly 10 digits.';
        }
        if (!formData.acno.trim()) {
            errors.acno = 'Account number is required.';
        }
        if (!formData.ifsc.trim()) {
            errors.ifsc = 'IFSC code is required.';
        } else if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(formData.ifsc.toUpperCase())) {
            errors.ifsc = 'IFSC code must be 11 characters (e.g., SBIN0001234).';
        }
        if (!formData.bankname.trim()) {
            errors.bankname = 'Bank name is required.';
        }
        // Salary Validation (Already present)
        if (!formData.base_salary.trim()) {
            errors.base_salary = 'Monthly salary is required.';
        } else {
            const salaryValue = parseFloat(formData.base_salary);
            if (isNaN(salaryValue) || salaryValue <= 0) {
                errors.base_salary = 'Monthly salary must be a positive number.';
            }
        }

        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        // Clear error on change
        if (validationErrors[e.target.name]) {
            setValidationErrors({ ...validationErrors, [e.target.name]: '' });
        }
        setError('');
        setSuccess('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) {
            setError('Please fix the validation errors below.');
            return;
        }
        setIsSubmitting(true);
        setError('');
        setSuccess('');

        try {
            const newEmployeeData = {
                ...formData,
                role: 'salesman',
                bid: manager.bid,
                status: 'active' // Default
            };
            const res = await api.post('/manager/employees', newEmployeeData);
            setSuccess('Salesman added successfully!');
            
            // NEW: Dispatch action to add employee to Redux state
            dispatch(addEmployeeSuccess(res.data)); // Assuming res.data contains the full new employee object

            setTimeout(() => handleBack(), 1500); // Auto back after success
        } catch (err) {
            console.error("Error adding salesman:", err);
            setError(err.response?.data?.message || "Error adding salesman");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className={styles.formContainer}>
            <h2>Add Salesman</h2>
            {error && <div className={styles.errorMessage}>{error}</div>}
            {success && <div className={styles.successMessage}>{success}</div>}
            <form onSubmit={handleSubmit} className={styles.formWrapper}>
                <div className={styles.formSection}>
                    <h3 className={styles.sectionTitle}>Personal Details</h3>
                    <div className={styles.fieldGroup}>
                        <div>
                            <label className={styles.fieldLabel}>First Name *</label>
                            <input
                                type="text"
                                name="f_name"
                                value={formData.f_name}
                                onChange={handleChange}
                                required
                                placeholder="Enter first name (min 2 letters)"
                                className={styles.fieldInput}
                                aria-label="First Name"
                                aria-invalid={!!validationErrors.f_name}
                                minLength={2}
                            />
                            {validationErrors.f_name && <span className={styles.validationError}>{validationErrors.f_name}</span>}
                        </div>
                        <div>
                            <label className={styles.fieldLabel}>Last Name *</label>
                            <input
                                type="text"
                                name="last_name"
                                value={formData.last_name}
                                onChange={handleChange}
                                required
                                placeholder="Enter last name (min 2 letters)"
                                className={styles.fieldInput}
                                aria-label="Last Name"
                                aria-invalid={!!validationErrors.last_name}
                                minLength={2}
                            />
                            {validationErrors.last_name && <span className={styles.validationError}>{validationErrors.last_name}</span>}
                        </div>
                        <div>
                            <label className={styles.fieldLabel}>Role</label>
                            <input
                                type="text"
                                value="Salesman"
                                disabled
                                className={`${styles.fieldInput} ${styles.disabledField}`}
                                aria-label="Role"
                            />
                        </div>
                        <div>
                            <label className={styles.fieldLabel}>Branch ID</label>
                            <input
                                type="text"
                                value={manager?.bid || 'Not Assigned'}
                                disabled
                                className={`${styles.fieldInput} ${styles.disabledField}`}
                                aria-label="Branch ID"
                            />
                        </div>
                        <div>
                            <label className={styles.fieldLabel}>Email *</label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                placeholder="Enter email"
                                className={styles.fieldInput}
                                aria-label="Email"
                                aria-invalid={!!validationErrors.email}
                            />
                            {validationErrors.email && <span className={styles.validationError}>{validationErrors.email}</span>}
                        </div>
                        <div>
                            <label className={styles.fieldLabel}>Phone Number *</label>
                            <input
                                type="tel"
                                name="phone_no"
                                value={formData.phone_no}
                                onChange={handleChange}
                                required
                                placeholder="Enter 10-digit phone number"
                                pattern="[0-9]{10}"
                                className={styles.fieldInput}
                                aria-label="Phone Number"
                                aria-invalid={!!validationErrors.phone_no}
                                maxLength={10}
                            />
                            {validationErrors.phone_no && <span className={styles.validationError}>{validationErrors.phone_no}</span>}
                        </div>
                    </div>
                </div>

                <div className={styles.formSection}>
                    <h3 className={styles.sectionTitle}>Account and Salaries</h3>
                    <div className={styles.fieldGroup}>
                        <div>
                            <label className={styles.fieldLabel}>Account Number *</label>
                            <input
                                type="text"
                                name="acno"
                                value={formData.acno}
                                onChange={handleChange}
                                required
                                placeholder="Enter account number"
                                className={styles.fieldInput}
                                aria-label="Account Number"
                                aria-invalid={!!validationErrors.acno}
                            />
                            {validationErrors.acno && <span className={styles.validationError}>{validationErrors.acno}</span>}
                        </div>
                        <div>
                            <label className={styles.fieldLabel}>IFSC Code *</label>
                            <input
                                type="text"
                                name="ifsc"
                                value={formData.ifsc}
                                onChange={handleChange}
                                required
                                placeholder="Enter IFSC code"
                                className={styles.fieldInput}
                                aria-label="IFSC Code"
                                maxLength={11}
                                aria-invalid={!!validationErrors.ifsc}
                            />
                            {validationErrors.ifsc && <span className={styles.validationError}>{validationErrors.ifsc}</span>}
                        </div>
                        <div>
                            <label className={styles.fieldLabel}>Bank Name *</label>
                            <input
                                type="text"
                                name="bankname"
                                value={formData.bankname}
                                onChange={handleChange}
                                required
                                placeholder="Enter bank name"
                                className={styles.fieldInput}
                                aria-label="Bank Name"
                                aria-invalid={!!validationErrors.bankname}
                            />
                            {validationErrors.bankname && <span className={styles.validationError}>{validationErrors.bankname}</span>}
                        </div>
                        <div>
                            <label className={styles.fieldLabel}>Monthly Salary *</label>
                            <input
                                type="number"
                                name="base_salary"
                                value={formData.base_salary}
                                onChange={handleChange}
                                required
                                min="0.01"
                                placeholder="Enter monthly salary"
                                step="0.01"
                                className={styles.fieldInput}
                                aria-label="Monthly Salary"
                                aria-invalid={!!validationErrors.base_salary}
                            />
                            {validationErrors.base_salary && <span className={styles.validationError}>{validationErrors.base_salary}</span>}
                        </div>
                        <div>
                            <label className={styles.fieldLabel}>Address</label>
                            <input
                                type="text"
                                name="address"
                                value={formData.address}
                                onChange={handleChange}
                                placeholder="Enter address"
                                className={styles.fieldInput}
                                aria-label="Address"
                            />
                        </div>
                    </div>
                </div>

                <button type="submit" className={styles.submitButton} disabled={isSubmitting}>
                    {isSubmitting ? 'Adding...' : 'Add Salesman'}
                </button>
                <button type="button" className={styles.submitButton} onClick={handleBack} disabled={isSubmitting}>
                    Back to List
                </button>
            </form>
        </div>
    );
};

export default ManagerAddEmployee;