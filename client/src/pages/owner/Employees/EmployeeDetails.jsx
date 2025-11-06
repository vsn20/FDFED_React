import React, { useState, useEffect } from 'react';
import api from '../../../api/api';
import styles from './Employee.module.css'; // Import CSS module

const EmployeeDetails = ({ e_id, handleBack }) => {
    const [employee, setEmployee] = useState(null); // Stores the original employee data
    const [branches, setBranches] = useState([]); // Stores the master list of all branches
    const [filteredBranches, setFilteredBranches] = useState([]); // NEW: For the dynamic dropdown
    const [formData, setFormData] = useState({
        f_name: '',
        last_name: '',
        role: '',
        bid: '',
        email: '',
        phone_no: '',
        acno: '',
        ifsc: '',
        bankname: '',
        base_salary: '',
        address: '',
        status: ''
    });
    const [error, setError] = useState(''); // NEW: For validation errors
    const [notFound, setNotFound] = useState(false);

    // 1. Fetch employee and branch data on mount
    useEffect(() => {
        const fetchEmployee = async () => {
            try {
                const res = await api.get(`/employees/${e_id}`);
                setEmployee(res.data); // Store original data
                setFormData({
                    f_name: res.data.f_name,
                    last_name: res.data.last_name,
                    role: res.data.role,
                    bid: res.data.bid || 'null', // Set initial form state
                    email: res.data.email,
                    phone_no: res.data.phone_no || '',
                    acno: res.data.acno,
                    ifsc: res.data.ifsc,
                    bankname: res.data.bankname,
                    base_salary: res.data.base_salary,
                    address: res.data.address || '',
                    status: res.data.status
                });
            } catch (err) {
                console.error("Error fetching employee:", err);
                setNotFound(true);
            }
        };
        const fetchBranches = async () => {
            try {
                const res = await api.get('/branches');
                setBranches(res.data); // Set master branch list
            } catch (err) {
                console.error("Error fetching branches:", err);
                setError("Failed to load branches");
            }
        };
        fetchEmployee();
        fetchBranches();
    }, [e_id]);

    // 2. NEW: This useEffect filters the branch list based on role
    // This logic is now adapted for the "edit" component
    useEffect(() => {
        // Wait until branches and employee data are loaded
        if (!branches.length || !employee) {
            return;
        }

        const originalBid = employee.bid; // Get the employee's original branch

        if (formData.role === 'manager') {
            const filtered = branches.filter(branch => 
                !branch.manager_assigned || branch.bid === originalBid
            );
            setFilteredBranches(filtered);
        } else {
            setFilteredBranches(branches);
        }
    }, [formData.role, branches, employee]); 

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError(''); 
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(''); // Clear previous errors

        // 3. NEW: Added salary validation from your addemployee.ejs
        const salaryValue = parseFloat(formData.base_salary);
        if (isNaN(salaryValue) || salaryValue <= 0) {
            setError('Monthly salary must be a number greater than 0.');
            return;
        }

        try {
            await api.put(`/employees/${e_id}`, {
                ...formData,
                bid: formData.bid === 'null' ? null : formData.bid
            });
            handleBack();
        } catch (err) {
            console.error("Error updating employee:", err);
            setError(err.response?.data?.message || "Error updating employee");
        }
    };

    if (notFound) {
        return <div className={styles.errorMessage}>Employee not found.</div>;
    }

    if (!employee) {
        return <div>Loading...</div>;
    }

    return (
        <div className={styles.formContainer}>
            <h2>Edit Employee Details</h2>
            {/* NEW: Display the error message */}
            {error && <div className={styles.errorMessage}>{error}</div>}
            <form onSubmit={handleSubmit} className={styles.formWrapper}>
                {/* ... (Personal Details section) ... */}
                <div className={styles.formSection}>
                    <h3 className={styles.sectionTitle}>Personal Details</h3>
                    <div className={styles.fieldGroup}>
                        {/* ... (First Name, Last Name fields) ... */}
                        <div>
                            <label className={styles.fieldLabel}>First Name</label>
                            <input
                                type="text"
                                name="f_name"
                                value={formData.f_name}
                                onChange={handleChange}
                                required
                                placeholder="Enter first name"
                                className={styles.fieldInput}
                            />
                        </div>
                        <div>
                            <label className={styles.fieldLabel}>Last Name</label>
                            <input
                                type="text"
                                name="last_name"
                                value={formData.last_name}
                                onChange={handleChange}
                                required
                                placeholder="Enter last name"
                                className={styles.fieldInput}
                            />
                        </div>
                        <div>
                            <label className={styles.fieldLabel}>Role</label>
                            <select name="role" value={formData.role} onChange={handleChange} required className={styles.fieldInput}>
                                <option value="manager">Sales Manager</option>
                                <option value="salesman">Salesman</option>
                            </select>
                        </div>
                        <div>
                            <label className={styles.fieldLabel}>Branch</label>
                            {/* 4. MODIFIED: This dropdown now maps over 'filteredBranches' state */}
                            <select name="bid" value={formData.bid} onChange={handleChange} className={styles.fieldInput}>
                                <option value="null">Not Assigned</option>
                                {filteredBranches.map((branch) => (
                                    <option key={branch._id} value={branch.bid}>
                                        {branch.bid} - {branch.b_name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        {/* ... (Email, Phone Number fields) ... */}
                        <div>
                            <label className={styles.fieldLabel}>Email</label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                placeholder="Enter email"
                                className={styles.fieldInput}
                            />
                        </div>
                        <div>
                            <label className={styles.fieldLabel}>Phone Number</label>
                            <input
                                type="text"
                                name="phone_no"
                                value={formData.phone_no}
                                onChange={handleChange}
                                placeholder="Enter phone number"
                                pattern="[0-9]{10}"
                                className={styles.fieldInput}
                            />
                        </div>
                    </div>
                </div>

                {/* ... (Account and Salaries section) ... */}
                <div className={styles.formSection}>
                    <h3 className={styles.sectionTitle}>Account and Salaries</h3>
                    <div className={styles.fieldGroup}>
                         {/* ... (Account, IFSC, Bank, Salary, Address fields) ... */}
                         <div>
                            <label className={styles.fieldLabel}>Account Number</label>
                            <input
                                type="text"
                                name="acno"
                                value={formData.acno}
                                onChange={handleChange}
                                required
                                placeholder="Enter account number"
                                className={styles.fieldInput}
                            />
                        </div>
                        <div>
                            <label className={styles.fieldLabel}>IFSC Code</label>
                            <input
                                type="text"
                                name="ifsc"
                                value={formData.ifsc}
                                onChange={handleChange}
                                required
                                placeholder="Enter IFSC code"
                                className={styles.fieldInput}
                            />
                        </div>
                        <div>
                            <label className={styles.fieldLabel}>Bank Name</label>
                            <input
                                type="text"
                                name="bankname"
                                value={formData.bankname}
                                onChange={handleChange}
                                required
                                placeholder="Enter bank name"
                                className={styles.fieldInput}
                            />
                        </div>
                        <div>
                            <label className={styles.fieldLabel}>Monthly Salary</label>
                            <input
                                type="number"
                                name="base_salary"
                                value={formData.base_salary}
                                onChange={handleChange}
                                required
                                placeholder="Enter monthly salary"
                                step="0.01"
                                className={styles.fieldInput}
                            />
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
                            />
                        </div>
                    </div>
                </div>
                
                {/* ... (Status section) ... */}
                <div className={styles.formSection}>
                    <h3 className={styles.sectionTitle}>Status</h3>
                    <div className={styles.fieldGroup}>
                        <div>
                            <label className={styles.fieldLabel}>Status</label>
                            <select name="status" value={formData.status} onChange={handleChange} className={styles.fieldInput}>
                                <option value="active">Active</option>
                                <option value="resigned">Resigned</option>
                                <option value="fired">Fired</option>
                            </select>
                        </div>
                    </div>
                </div>
                <button type="submit" className={styles.submitButton}>Update Employee</button>
            </form>
        </div>
    );
};

export default EmployeeDetails;