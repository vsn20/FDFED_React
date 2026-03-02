import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updateEmployee } from '../../../redux/slices/employeeSlice';
import { fetchBranches } from '../../../redux/slices/branchSlice';
import styles from './Employee.module.css';

const BackIcon = () => (
  <svg viewBox="0 0 24 24" width="12" height="12" stroke="currentColor" fill="none" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 18 9 12 15 6"/>
  </svg>
);

/* ── Initials helper ── */
const getInitials = (first = '', last = '') =>
  `${first[0] || ''}${last[0] || ''}`.toUpperCase();

const EmployeeDetails = ({ e_id, handleBack }) => {
  const dispatch = useDispatch();

  const employee = useSelector(s => s.employees.items.find(e => e.e_id === e_id));
  const { items: branches, status: branchStatus } = useSelector(s => s.branches);

  const [filteredBranches, setFilteredBranches] = useState([]);
  const [formData, setFormData] = useState({
    f_name: '', last_name: '', role: '', bid: '',
    email: '', phone_no: '', acno: '', ifsc: '',
    bankname: '', base_salary: '', address: '', status: ''
  });
  const [error, setError] = useState('');

  useEffect(() => {
    if (branchStatus === 'idle') dispatch(fetchBranches());
  }, [branchStatus, dispatch]);

  useEffect(() => {
    if (employee) {
      setFormData({
        f_name:       employee.f_name,
        last_name:    employee.last_name,
        role:         employee.role,
        bid:          employee.bid || 'null',
        email:        employee.email,
        phone_no:     employee.phone_no || '',
        acno:         employee.acno,
        ifsc:         employee.ifsc,
        bankname:     employee.bankname,
        base_salary:  employee.base_salary,
        address:      employee.address || '',
        status:       employee.status
      });
    }
  }, [employee]);

  useEffect(() => {
    if (!branches.length || !employee) return;
    if (formData.role === 'manager') {
      setFilteredBranches(branches.filter(b => !b.manager_assigned || b.bid === employee.bid));
    } else {
      setFilteredBranches(branches);
    }
  }, [formData.role, branches, employee]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  const validateForm = () => {
    const fname  = formData.f_name.trim();
    const lname  = formData.last_name.trim();
    const email  = formData.email.trim();
    const phone  = formData.phone_no ? formData.phone_no.trim() : '';
    const salary = parseFloat(formData.base_salary);

    if (!fname)                                    return 'First name is required.';
    if (/^\d/.test(fname))                         return 'First name cannot start with a number.';
    if (!lname)                                    return 'Last name is required.';
    if (/^\d/.test(lname))                         return 'Last name cannot start with a number.';
    if (!email)                                    return 'Email is required.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Invalid email format.';
    if (phone && !/^\d{10}$/.test(phone))          return 'Phone must be exactly 10 digits.';
    if (!formData.acno)                            return 'Account number is required.';
    if (!formData.ifsc)                            return 'IFSC code is required.';
    if (!formData.bankname)                        return 'Bank name is required.';
    if (isNaN(salary) || salary <= 0)              return 'Salary must be a positive number.';
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const err = validateForm();
    if (err) { setError(err); return; }
    try {
      await dispatch(updateEmployee({
        e_id,
        employeeData: { ...formData, bid: formData.bid === 'null' ? null : formData.bid }
      })).unwrap();
      handleBack();
    } catch (err) {
      setError(typeof err === 'string' ? err : 'Error updating employee');
    }
  };

  if (!employee) return (
    <div className={styles.loadingState}><span className={styles.spinner}/> Loading employee…</div>
  );

  const statusClass = formData.status === 'active' ? styles.active
    : formData.status === 'resigned' ? styles.resigned : styles.fired;

  return (
    <div className={styles.container}>

      {/* Form page header */}
      <div className={styles.formPageHeader}>
        <button className={styles.backBtn} onClick={handleBack}>
          <BackIcon /> Back
        </button>
        <div style={{ display:'flex', alignItems:'center', gap:'14px' }}>
          <div className={styles.cardAvatar} style={{ width:46, height:46, borderRadius:12, background:'linear-gradient(135deg,#f5a814,#d97706)', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:"'Cormorant Garamond',serif", fontSize:'1.15rem', fontWeight:600, color:'#fff', boxShadow:'0 4px 14px rgba(245,168,20,.22)', flexShrink:0 }}>
            {getInitials(employee.f_name, employee.last_name)}
          </div>
          <div>
            <h1 className={styles.formTitle} style={{ marginBottom:3 }}>
              {employee.f_name} <em>{employee.last_name}</em>
            </h1>
            <span className={`${styles.statusBadge} ${statusClass}`}>
              {formData.status}
            </span>
          </div>
        </div>
      </div>

      {error && <div className={styles.errorMessage}>⚠ {error}</div>}

      <form onSubmit={handleSubmit} className={styles.formWrapper}>

        {/* Personal */}
        <div className={styles.formSection}>
          <div className={styles.sectionTitle}>Personal Details</div>
          <div className={styles.fieldGroup}>
            <div>
              <label className={styles.fieldLabel}>First Name</label>
              <input name="f_name" type="text" value={formData.f_name} onChange={handleChange} required className={styles.fieldInput} />
            </div>
            <div>
              <label className={styles.fieldLabel}>Last Name</label>
              <input name="last_name" type="text" value={formData.last_name} onChange={handleChange} required className={styles.fieldInput} />
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
              <select name="bid" value={formData.bid} onChange={handleChange} className={styles.fieldInput}>
                <option value="null">Not Assigned</option>
                {filteredBranches.map(b => (
                  <option key={b._id} value={b.bid}>{b.bid} – {b.b_name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={styles.fieldLabel}>Email</label>
              <input name="email" type="email" value={formData.email} onChange={handleChange} required className={styles.fieldInput} />
            </div>
            <div>
              <label className={styles.fieldLabel}>Phone Number</label>
              <input name="phone_no" type="text" value={formData.phone_no} onChange={handleChange} className={styles.fieldInput} />
            </div>
          </div>
        </div>

        {/* Bank & Salary */}
        <div className={styles.formSection}>
          <div className={styles.sectionTitle}>Bank &amp; Salary</div>
          <div className={styles.fieldGroup}>
            <div>
              <label className={styles.fieldLabel}>Account Number</label>
              <input name="acno" type="text" value={formData.acno} onChange={handleChange} required className={styles.fieldInput} />
            </div>
            <div>
              <label className={styles.fieldLabel}>IFSC Code</label>
              <input name="ifsc" type="text" value={formData.ifsc} onChange={handleChange} required className={styles.fieldInput} />
            </div>
            <div>
              <label className={styles.fieldLabel}>Bank Name</label>
              <input name="bankname" type="text" value={formData.bankname} onChange={handleChange} required className={styles.fieldInput} />
            </div>
            <div>
              <label className={styles.fieldLabel}>Monthly Salary (₹)</label>
              <input name="base_salary" type="number" value={formData.base_salary} onChange={handleChange} required step="0.01" className={styles.fieldInput} />
            </div>
            <div>
              <label className={styles.fieldLabel}>Address</label>
              <input name="address" type="text" value={formData.address} onChange={handleChange} className={styles.fieldInput} />
            </div>
          </div>
        </div>

        {/* Status */}
        <div className={styles.formSection}>
          <div className={styles.sectionTitle}>Employment Status</div>
          <div className={styles.fieldGroup}>
            <div>
              <label className={styles.fieldLabel}>Status</label>
              <select name="status" value={formData.status} onChange={handleChange} className={styles.fieldInput}>
                <option value="active">Active</option>
                <option value="resigned">Resigned</option>
                <option value="fired">Fired</option>
              </select>
            </div>
            <div>
              <label className={styles.fieldLabel}>Employee ID</label>
              <input type="text" value={employee.e_id} readOnly className={`${styles.fieldInput} ${styles.disabledField}`} />
            </div>
          </div>
        </div>

        <button type="submit" className={styles.submitButton}>
          Save Changes
        </button>
      </form>
    </div>
  );
};

export default EmployeeDetails;