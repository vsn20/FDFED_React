import React, { useState, useEffect } from 'react';
import api from '../../../api/api';
import styles from './Employee.module.css'; // Import CSS module

const AddEmployee = ({ handleBack }) => {
  const [formData, setFormData] = useState({
    f_name: '',
    last_name: '',
    role: '',
    bid: 'null', // FIX 1: Set initial state to 'null' string
    email: '',
    phone_no: '',
    acno: '',
    ifsc: '',
    bankname: '',
    base_salary: '',
    address: ''
  });

  const [branches, setBranches] = useState([]);
  const [filteredBranches, setFilteredBranches] = useState([]); // NEW: For the dynamic dropdown
  const [error, setError] = useState('');

  // 1. Fetch all branches on component mount
  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const res = await api.get('/branches');
        setBranches(res.data);
      } catch (err) {
        console.error("Error fetching branches:", err);
        setError("Failed to load branches");
      }
    };
    fetchBranches();
  }, []);

  // 2. NEW: This useEffect re-implements the logic from your addemployee.ejs
  // It filters the branch list whenever the 'role' or main 'branches' list changes.
  useEffect(() => {
    // This logic is from your updateBranchDropdown function
    if (formData.role === 'Sales Manager') {
      // If role is Sales Manager, only show branches that are not assigned
      const unassignedBranches = branches.filter(branch => !branch.manager_assigned);
      setFilteredBranches(unassignedBranches);
    } else {
      // For any other role, show all branches
      setFilteredBranches(branches);
    }

    // Reset branch selection if the role changes
    setFormData(fd => ({ ...fd, bid: 'null' }));

  }, [formData.role, branches]); // This effect depends on role and branches

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError(''); // Clear error on input change
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
      await api.post('/employees', {
        ...formData,
        bid: formData.bid === 'null' ? null : formData.bid
      });
      handleBack();
    } catch (err) {
      console.error("Error adding employee:", err);
      setError(err.response?.data?.message || "Error adding employee");
    }
  };

  return (
    <div className={styles.formContainer}>
      <h2>Add Employee</h2>
      {error && <div className={styles.errorMessage}>{error}</div>}
      <form onSubmit={handleSubmit} className={styles.formWrapper}>
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
                <option value="">Select role</option>
                {/* FIX 2: Removed "owner" role to match controller logic */}
                <option value="Sales Manager">Sales Manager</option>
                <option value="Salesman">Salesman</option>
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
        <button type="submit" className={styles.submitButton}>Add Employee</button>
      </form>
    </div>
  );
};

export default AddEmployee;