
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../../api/api';
import styles from '../Employees/Details.module.css'; 

const ManagerProfileEdit = () => {
    const navigate = useNavigate();
    const [manager, setManager] = useState(null);
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phoneNumber: '',
        accountNumber: '',
        ifsc: '',
        bank: '',
        address: '',
    });
    const [notFound, setNotFound] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [validationErrors, setValidationErrors] = useState({});

    useEffect(() => {
        const fetchManager = async () => {
            try {
                const res = await api.get('/manager/employees/me');
                setManager(res.data);
                setFormData({
                    firstName: res.data.f_name,
                    lastName: res.data.last_name,
                    email: res.data.email,
                    phoneNumber: res.data.phone_no || '',
                    accountNumber: res.data.acno,
                    ifsc: res.data.ifsc,
                    bank: res.data.bankname,
                    address: res.data.address || '',
                });
            } catch (err) {
                console.error("Error fetching manager details:", err);
                setNotFound(true);
                setErrorMessage(err.response?.data?.message || "Failed to load manager details");
            }
        };
        fetchManager();
    }, []);

    const validateForm = () => {
        const errors = {};
        // Required fields with min length for names
        if (!formData.firstName.trim() || formData.firstName.trim().length < 2) {
            errors.firstName = formData.firstName.trim() ? 'First name must be at least 2 letters.' : 'First name is required.';
        }
        if (!formData.lastName.trim() || formData.lastName.trim().length < 2) {
            errors.lastName = formData.lastName.trim() ? 'Last name must be at least 2 letters.' : 'Last name is required.';
        }
        if (!formData.email.trim()) {
            errors.email = 'Email is required.';
        } else {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(formData.email)) {
                errors.email = 'Please enter a valid email address with @.';
            }
        }
        if (!formData.phoneNumber.trim()) {
            errors.phoneNumber = 'Phone number is required.';
        } else if (!/^\d{10}$/.test(formData.phoneNumber)) {
            errors.phoneNumber = 'Phone number must be exactly 10 digits.';
        }
        if (!formData.accountNumber.trim()) {
            errors.accountNumber = 'Account number is required.';
        }
        if (!formData.ifsc.trim()) {
            errors.ifsc = 'IFSC code is required.';
        } else if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(formData.ifsc.toUpperCase())) {
            errors.ifsc = 'IFSC code must be 11 characters (e.g., SBIN0001234).';
        }
        if (!formData.bank.trim()) {
            errors.bank = 'Bank is required.';
        }

        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleChange = (e) => {
        // Only allow changes to specified fields
        const allowedFields = ['firstName', 'lastName', 'email', 'phoneNumber', 'accountNumber', 'ifsc', 'bank', 'address'];
        if (allowedFields.includes(e.target.name)) {
            setFormData({ ...formData, [e.target.name]: e.target.value });
            // Clear error on change
            if (validationErrors[e.target.name]) {
                setValidationErrors({ ...validationErrors, [e.target.name]: '' });
            }
        }
        setSuccessMessage('');
        setErrorMessage('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) {
            setErrorMessage('Please fix the validation errors below.');
            return;
        }
        try {
            const updateData = {
                f_name: formData.firstName,
                last_name: formData.lastName,
                email: formData.email,
                phone_no: formData.phoneNumber,
                acno: formData.accountNumber,
                ifsc: formData.ifsc,
                bankname: formData.bank,
                address: formData.address,
                // Enforce role and bid
                role: 'manager',
                bid: manager.bid
            };
            const res = await api.put('/manager/employees/me', updateData);
            setSuccessMessage(res.data.message || 'Profile updated successfully');
            setErrorMessage('');
            // Refetch
            const updatedRes = await api.get('/manager/employees/me');
            setManager(updatedRes.data);
            setFormData({
                firstName: updatedRes.data.f_name,
                lastName: updatedRes.data.last_name,
                email: updatedRes.data.email,
                phoneNumber: updatedRes.data.phone_no || '',
                accountNumber: updatedRes.data.acno,
                ifsc: updatedRes.data.ifsc,
                bank: updatedRes.data.bankname,
                address: updatedRes.data.address || '',
            });
        } catch (err) {
            console.error("Error updating manager details:", err);
            setErrorMessage(err.response?.data?.message || "Failed to update profile");
            setSuccessMessage('');
        }
    };

    if (notFound) {
        return <div className={styles.errorMessage}>Profile not found.</div>;
    }

    if (!manager) {
        return <div>Loading...</div>;
    }

    const branchName = manager.branch_name || 'Not Assigned';

    return (
        <div className={styles.container}>
            <div className={styles.contentArea}>
                <h1>Edit Profile</h1>
                {successMessage && <p className={styles.successMessage}>{successMessage}</p>}
                {errorMessage && <p className={styles.errorMessage}>{errorMessage}</p>}
                <form onSubmit={handleSubmit} className={styles.formContainer}>
                    <div className={styles.formWrapper}>
                        <div className={styles.formSection}>
                            <h2 className={styles.sectionTitle}>Personal Details</h2>
                            <div className={styles.fieldGroup}>
                                <div>
                                    <label className={styles.fieldLabel}>Employee ID</label>
                                    <input
                                        className={`${styles.fieldInput} ${styles.disabledField}`}
                                        type="text"
                                        value={manager.e_id}
                                        disabled
                                        aria-label="Employee ID"
                                    />
                                </div>
                                <div>
                                    <label className={styles.fieldLabel}>First Name *</label>
                                    <input
                                        className={styles.fieldInput}
                                        type="text"
                                        name="firstName"
                                        value={formData.firstName}
                                        onChange={handleChange}
                                        required
                                        placeholder="First Name is required (min 2 letters)"
                                        aria-label="First Name"
                                        aria-invalid={!!validationErrors.firstName}
                                        minLength={2}
                                    />
                                    {validationErrors.firstName && <span className={styles.validationError} style={{ color: 'red' }}>{validationErrors.firstName}</span>}
                                </div>
                                <div>
                                    <label className={styles.fieldLabel}>Last Name *</label>
                                    <input
                                        className={styles.fieldInput}
                                        type="text"
                                        name="lastName"
                                        value={formData.lastName}
                                        onChange={handleChange}
                                        required
                                        placeholder="Last Name is required (min 2 letters)"
                                        aria-label="Last Name"
                                        aria-invalid={!!validationErrors.lastName}
                                        minLength={2}
                                    />
                                    {validationErrors.lastName && <span className={styles.validationError} style={{ color: 'red' }}>{validationErrors.lastName}</span>}
                                </div>
                                <div>
                                    <label className={styles.fieldLabel}>Role</label>
                                    <input
                                        className={`${styles.fieldInput} ${styles.disabledField}`}
                                        type="text"
                                        value={manager.role}
                                        disabled
                                        aria-label="Role"
                                    />
                                </div>
                                <div>
                                    <label className={styles.fieldLabel}>Status</label>
                                    <input
                                        className={`${styles.fieldInput} ${styles.disabledField}`}
                                        type="text"
                                        value={manager.status}
                                        disabled
                                        aria-label="Status"
                                    />
                                </div>
                                <div>
                                    <label className={styles.fieldLabel}>Branch ID</label>
                                    <input
                                        className={`${styles.fieldInput} ${styles.disabledField}`}
                                        type="text"
                                        value={manager.bid || 'Not Assigned'}
                                        disabled
                                        aria-label="Branch ID"
                                    />
                                </div>
                                <div>
                                    <label className={styles.fieldLabel}>Branch Name</label>
                                    <input
                                        className={`${styles.fieldInput} ${styles.disabledField}`}
                                        type="text"
                                        value={branchName}
                                        disabled
                                        aria-label="Branch Name"
                                    />
                                </div>
                                <div>
                                    <label className={styles.fieldLabel}>Email *</label>
                                    <input
                                        className={styles.fieldInput}
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                        placeholder="Email is required"
                                        aria-label="Email"
                                        aria-invalid={!!validationErrors.email}
                                    />
                                    {validationErrors.email && <span className={styles.validationError} style={{ color: 'red' }}>{validationErrors.email}</span>}
                                </div>
                                <div>
                                    <label className={styles.fieldLabel}>Phone Number *</label>
                                    <input
                                        className={styles.fieldInput}
                                        type="text"
                                        name="phoneNumber"
                                        value={formData.phoneNumber}
                                        onChange={handleChange}
                                        required
                                        placeholder="Enter 10-digit phone number"
                                        pattern="[0-9]{10}"
                                        aria-label="Phone Number"
                                        aria-invalid={!!validationErrors.phoneNumber}
                                        maxLength={10}
                                    />
                                    {validationErrors.phoneNumber && <span className={styles.validationError} style={{ color: 'red' }}>{validationErrors.phoneNumber}</span>}
                                </div>
                            </div>
                        </div>

                        <div className={styles.formSection}>
                            <h2 className={styles.sectionTitle}>Account and Salaries</h2>
                            <div className={styles.fieldGroup}>
                                <div>
                                    <label className={styles.fieldLabel}>Hire Date</label>
                                    <input
                                        className={`${styles.fieldInput} ${styles.disabledField}`}
                                        type="text"
                                        value={manager.formattedHireDate || (manager.hiredAt ? new Date(manager.hiredAt).toLocaleDateString() : 'N/A')}
                                        disabled
                                        aria-label="Hire Date"
                                    />
                                </div>
                                <div>
                                    <label className={styles.fieldLabel}>Account Number *</label>
                                    <input
                                        className={styles.fieldInput}
                                        type="text"
                                        name="accountNumber"
                                        value={formData.accountNumber}
                                        onChange={handleChange}
                                        required
                                        placeholder="Account Number is required"
                                        aria-label="Account Number"
                                        aria-invalid={!!validationErrors.accountNumber}
                                    />
                                    {validationErrors.accountNumber && <span className={styles.validationError} style={{ color: 'red' }}>{validationErrors.accountNumber}</span>}
                                </div>
                                <div>
                                    <label className={styles.fieldLabel}>IFSC Code *</label>
                                    <input
                                        className={styles.fieldInput}
                                        type="text"
                                        name="ifsc"
                                        value={formData.ifsc}
                                        onChange={handleChange}
                                        required
                                        placeholder="IFSC Code is required"
                                        aria-label="IFSC Code"
                                        aria-invalid={!!validationErrors.ifsc}
                                        maxLength={11}
                                    />
                                    {validationErrors.ifsc && <span className={styles.validationError} style={{ color: 'red' }}>{validationErrors.ifsc}</span>}
                                </div>
                                <div>
                                    <label className={styles.fieldLabel}>Bank *</label>
                                    <input
                                        className={styles.fieldInput}
                                        type="text"
                                        name="bank"
                                        value={formData.bank}
                                        onChange={handleChange}
                                        required
                                        placeholder="Bank is required"
                                        aria-label="Bank"
                                        aria-invalid={!!validationErrors.bank}
                                    />
                                    {validationErrors.bank && <span className={styles.validationError} style={{ color: 'red' }}>{validationErrors.bank}</span>}
                                </div>
                                <div>
                                    <label className={styles.fieldLabel}>Monthly Salary</label>
                                    <input
                                        className={`${styles.fieldInput} ${styles.disabledField}`}
                                        type="number"
                                        value={manager.base_salary || 0}
                                        disabled
                                        aria-label="Monthly Salary"
                                    />
                                </div>
                                <div>
                                    <label className={styles.fieldLabel}>Address</label>
                                    <input
                                        className={styles.fieldInput}
                                        type="text"
                                        name="address"
                                        value={formData.address}
                                        onChange={handleChange}
                                        placeholder="Enter address"
                                        aria-label="Address"
                                    />
                                </div>
                            </div>
                        </div>

                        <button type="submit" className={styles.submitButton}>
                            Update Profile
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ManagerProfileEdit;