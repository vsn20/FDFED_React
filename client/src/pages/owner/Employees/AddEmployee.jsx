// client/src/pages/owner/Employees/AddEmployee.jsx
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createEmployee } from '../../../redux/slices/employeeSlice';
import { fetchBranches } from '../../../redux/slices/branchSlice';
import styles from './Employee.module.css';

const AddEmployee = ({ handleBack }) => {
  const dispatch = useDispatch();
  
  const { items: branches, status: branchStatus } = useSelector((state) => state.branches);

  const [formData, setFormData] = useState({
    f_name: '',
    last_name: '',
    role: '',
    bid: 'null',
    email: '',
    phone_no: '',
    acno: '',
    ifsc: '',
    bankname: '',
    base_salary: '',
    address: ''
  });

  const [filteredBranches, setFilteredBranches] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    if (branchStatus === 'idle') {
      dispatch(fetchBranches());
    }
  }, [branchStatus, dispatch]);

  useEffect(() => {
    if (formData.role === 'manager') {
      const unassignedBranches = branches.filter(branch => !branch.manager_assigned);
      setFilteredBranches(unassignedBranches);
    } else {
      setFilteredBranches(branches);
    }
    setFormData(fd => ({ ...fd, bid: 'null' }));
  }, [formData.role, branches]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  const validateForm = () => {
    const fname = formData.f_name.trim();
    const lname = formData.last_name.trim();
    const email = formData.email.trim();
    const phone = formData.phone_no.trim();
    const salary = parseFloat(formData.base_salary);

    if (!fname) return "First Name is required.";
    if (/^\d/.test(fname)) return "First Name cannot start with a number.";
    if (fname.length < 2) return "First Name must be at least 2 characters.";

    if (!lname) return "Last Name is required.";
    if (/^\d/.test(lname)) return "Last Name cannot start with a number.";

    if (!formData.role) return "Role selection is required.";

    if (!email) return "Email is required.";
    // Basic email regex
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return "Invalid email format.";

    if (phone && !/^\d{10}$/.test(phone)) return "Phone number must be exactly 10 digits.";

    if (!formData.acno.trim()) return "Account Number is required.";
    if (!formData.ifsc.trim()) return "IFSC Code is required.";
    if (!formData.bankname.trim()) return "Bank Name is required.";

    if (!formData.base_salary) return "Monthly Salary is required.";
    if (isNaN(salary) || salary <= 0) return "Salary must be a positive number greater than 0.";

    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }
    
    try {
      await dispatch(createEmployee({
        ...formData,
        bid: formData.bid === 'null' ? null : formData.bid
      })).unwrap();
      
      handleBack();
    } catch (err) {
      console.error("Error adding employee:", err);
      setError(typeof err === 'string' ? err : "Error adding employee");
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
            <div>
              <label className={styles.fieldLabel}>First Name</label>
              <input type="text" name="f_name" value={formData.f_name} onChange={handleChange} required placeholder="Enter first name" className={styles.fieldInput} />
            </div>
            <div>
              <label className={styles.fieldLabel}>Last Name</label>
              <input type="text" name="last_name" value={formData.last_name} onChange={handleChange} required placeholder="Enter last name" className={styles.fieldInput} />
            </div>
            <div>
              <label className={styles.fieldLabel}>Role</label>
              <select name="role" value={formData.role} onChange={handleChange} required className={styles.fieldInput}>
                <option value="">Select role</option>
                <option value="manager">Sales Manager</option>
                <option value="salesman">Salesman</option>
              </select>
            </div>
            <div>
              <label className={styles.fieldLabel}>Branch</label>
              <select name="bid" value={formData.bid} onChange={handleChange} className={styles.fieldInput}>
                <option value="null">Not Assigned</option>
                {filteredBranches.map((branch) => (
                  <option key={branch._id} value={branch.bid}>
                    {branch.bid} - {branch.b_name}
                  </option>
                ))}
              </select>
            </div>
             <div>
              <label className={styles.fieldLabel}>Email</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} required placeholder="Enter email" className={styles.fieldInput} />
            </div>
            <div>
              <label className={styles.fieldLabel}>Phone Number</label>
              <input type="text" name="phone_no" value={formData.phone_no} onChange={handleChange} placeholder="Enter 10-digit number" className={styles.fieldInput} />
            </div>
          </div>
        </div>
        <div className={styles.formSection}>
          <h3 className={styles.sectionTitle}>Account and Salaries</h3>
          <div className={styles.fieldGroup}>
            <div>
              <label className={styles.fieldLabel}>Account Number</label>
              <input type="text" name="acno" value={formData.acno} onChange={handleChange} required placeholder="Enter account number" className={styles.fieldInput} />
            </div>
            <div>
              <label className={styles.fieldLabel}>IFSC Code</label>
              <input type="text" name="ifsc" value={formData.ifsc} onChange={handleChange} required placeholder="Enter IFSC code" className={styles.fieldInput} />
            </div>
            <div>
              <label className={styles.fieldLabel}>Bank Name</label>
              <input type="text" name="bankname" value={formData.bankname} onChange={handleChange} required placeholder="Enter bank name" className={styles.fieldInput} />
            </div>
            <div>
              <label className={styles.fieldLabel}>Monthly Salary</label>
              <input type="number" name="base_salary" value={formData.base_salary} onChange={handleChange} required placeholder="Enter monthly salary" step="0.01" className={styles.fieldInput} />
            </div>
            <div>
              <label className={styles.fieldLabel}>Address</label>
              <input type="text" name="address" value={formData.address} onChange={handleChange} placeholder="Enter address" className={styles.fieldInput} />
            </div>
          </div>
        </div>
        <button type="submit" className={styles.submitButton}>Add Employee</button>
      </form>
    </div>
  );
};

export default AddEmployee;