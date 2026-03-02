import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createEmployee } from '../../../redux/slices/employeeSlice';
import { fetchBranches } from '../../../redux/slices/branchSlice';
import styles from './Employee.module.css';

const BackIcon = () => (
  <svg viewBox="0 0 24 24" width="12" height="12" stroke="currentColor" fill="none" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 18 9 12 15 6"/>
  </svg>
);

const AddEmployee = ({ handleBack }) => {
  const dispatch = useDispatch();
  const { items: branches, status: branchStatus } = useSelector(s => s.branches);

  const [formData, setFormData] = useState({
    f_name: '', last_name: '', role: '', bid: 'null',
    email: '', phone_no: '', acno: '', ifsc: '',
    bankname: '', base_salary: '', address: ''
  });
  const [filteredBranches, setFilteredBranches] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    if (branchStatus === 'idle') dispatch(fetchBranches());
  }, [branchStatus, dispatch]);

  useEffect(() => {
    if (formData.role === 'manager') {
      setFilteredBranches(branches.filter(b => !b.manager_assigned));
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
    const fname  = formData.f_name.trim();
    const lname  = formData.last_name.trim();
    const email  = formData.email.trim();
    const phone  = formData.phone_no.trim();
    const salary = parseFloat(formData.base_salary);

    if (!fname)                                   return 'First name is required.';
    if (/^\d/.test(fname))                        return 'First name cannot start with a number.';
    if (fname.length < 2)                         return 'First name must be at least 2 characters.';
    if (!lname)                                   return 'Last name is required.';
    if (/^\d/.test(lname))                        return 'Last name cannot start with a number.';
    if (!formData.role)                           return 'Role is required.';
    if (!email)                                   return 'Email is required.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Invalid email format.';
    if (phone && !/^\d{10}$/.test(phone))         return 'Phone must be exactly 10 digits.';
    if (!formData.acno.trim())                    return 'Account number is required.';
    if (!formData.ifsc.trim())                    return 'IFSC code is required.';
    if (!formData.bankname.trim())                return 'Bank name is required.';
    if (!formData.base_salary)                    return 'Monthly salary is required.';
    if (isNaN(salary) || salary <= 0)             return 'Salary must be a positive number.';
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const err = validateForm();
    if (err) { setError(err); return; }
    try {
      await dispatch(createEmployee({
        ...formData,
        bid: formData.bid === 'null' ? null : formData.bid
      })).unwrap();
      handleBack();
    } catch (err) {
      setError(typeof err === 'string' ? err : 'Error adding employee');
    }
  };

  return (
    <div className={styles.container}>

      {/* Form page header */}
      <div className={styles.formPageHeader}>
        <button className={styles.backBtn} onClick={handleBack}>
          <BackIcon /> Back
        </button>
        <h1 className={styles.formTitle}>Add <em>Employee</em></h1>
      </div>

      {error && <div className={styles.errorMessage}>⚠ {error}</div>}

      <form onSubmit={handleSubmit} className={styles.formWrapper}>

        {/* Personal Details */}
        <div className={styles.formSection}>
          <div className={styles.sectionTitle}>Personal Details</div>
          <div className={styles.fieldGroup}>
            <div>
              <label className={styles.fieldLabel}>First Name</label>
              <input name="f_name" type="text" value={formData.f_name} onChange={handleChange} required placeholder="Enter first name" className={styles.fieldInput} />
            </div>
            <div>
              <label className={styles.fieldLabel}>Last Name</label>
              <input name="last_name" type="text" value={formData.last_name} onChange={handleChange} required placeholder="Enter last name" className={styles.fieldInput} />
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
                {filteredBranches.map(b => (
                  <option key={b._id} value={b.bid}>{b.bid} – {b.b_name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={styles.fieldLabel}>Email</label>
              <input name="email" type="email" value={formData.email} onChange={handleChange} required placeholder="Enter email address" className={styles.fieldInput} />
            </div>
            <div>
              <label className={styles.fieldLabel}>Phone Number</label>
              <input name="phone_no" type="text" value={formData.phone_no} onChange={handleChange} placeholder="10-digit number" className={styles.fieldInput} />
            </div>
          </div>
        </div>

        {/* Bank & Salary */}
        <div className={styles.formSection}>
          <div className={styles.sectionTitle}>Bank &amp; Salary</div>
          <div className={styles.fieldGroup}>
            <div>
              <label className={styles.fieldLabel}>Account Number</label>
              <input name="acno" type="text" value={formData.acno} onChange={handleChange} required placeholder="Enter account number" className={styles.fieldInput} />
            </div>
            <div>
              <label className={styles.fieldLabel}>IFSC Code</label>
              <input name="ifsc" type="text" value={formData.ifsc} onChange={handleChange} required placeholder="Enter IFSC code" className={styles.fieldInput} />
            </div>
            <div>
              <label className={styles.fieldLabel}>Bank Name</label>
              <input name="bankname" type="text" value={formData.bankname} onChange={handleChange} required placeholder="Enter bank name" className={styles.fieldInput} />
            </div>
            <div>
              <label className={styles.fieldLabel}>Monthly Salary (₹)</label>
              <input name="base_salary" type="number" value={formData.base_salary} onChange={handleChange} required placeholder="e.g. 35000" step="0.01" className={styles.fieldInput} />
            </div>
            <div>
              <label className={styles.fieldLabel}>Address</label>
              <input name="address" type="text" value={formData.address} onChange={handleChange} placeholder="Enter address (optional)" className={styles.fieldInput} />
            </div>
          </div>
        </div>

        <button type="submit" className={styles.submitButton}>
          Add Employee
        </button>
      </form>
    </div>
  );
};

export default AddEmployee;