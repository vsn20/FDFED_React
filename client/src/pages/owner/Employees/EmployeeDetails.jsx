import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updateEmployee } from '../../../redux/slices/employeeSlice';
import { fetchBranches } from '../../../redux/slices/branchSlice';
import styles from './Employee.module.css';

const EmployeeDetails = ({ e_id, handleBack }) => {
    const dispatch = useDispatch();

    // 1. Select Employee from Store
    const employee = useSelector(state => 
        state.employees.items.find(emp => emp.e_id === e_id)
    );
    
    // 2. Select Branches from Store
    const { items: branches, status: branchStatus } = useSelector((state) => state.branches);

    const [filteredBranches, setFilteredBranches] = useState([]);
    const [formData, setFormData] = useState({
        f_name: '', last_name: '', role: '', bid: '', email: '',
        phone_no: '', acno: '', ifsc: '', bankname: '', base_salary: '',
        address: '', status: ''
    });
    const [error, setError] = useState('');

    // Fetch branches if not loaded
    useEffect(() => {
        if (branchStatus === 'idle') {
            dispatch(fetchBranches());
        }
    }, [branchStatus, dispatch]);

    // Populate Form Data from Redux Store Employee
    useEffect(() => {
        if (employee) {
            setFormData({
                f_name: employee.f_name,
                last_name: employee.last_name,
                role: employee.role,
                bid: employee.bid || 'null',
                email: employee.email,
                phone_no: employee.phone_no || '',
                acno: employee.acno,
                ifsc: employee.ifsc,
                bankname: employee.bankname,
                base_salary: employee.base_salary,
                address: employee.address || '',
                status: employee.status
            });
        }
    }, [employee]);

    // Filter Branches Logic
    useEffect(() => {
        if (!branches.length || !employee) return;

        const originalBid = employee.bid; 

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
        setError(''); 

        const salaryValue = parseFloat(formData.base_salary);
        if (isNaN(salaryValue) || salaryValue <= 0) {
            setError('Monthly salary must be a number greater than 0.');
            return;
        }

        try {
            await dispatch(updateEmployee({
                e_id,
                employeeData: {
                    ...formData,
                    bid: formData.bid === 'null' ? null : formData.bid
                }
            })).unwrap();
            
            handleBack();
        } catch (err) {
            console.error("Error updating employee:", err);
            setError(typeof err === 'string' ? err : "Error updating employee");
        }
    };

    if (!employee) return <div>Employee not found or loading...</div>;

    return (
        <div className={styles.formContainer}>
            <h2>Edit Employee Details</h2>
            {error && <div className={styles.errorMessage}>{error}</div>}
            <form onSubmit={handleSubmit} className={styles.formWrapper}>
                <div className={styles.formSection}>
                    <h3 className={styles.sectionTitle}>Personal Details</h3>
                    <div className={styles.fieldGroup}>
                        <div>
                            <label className={styles.fieldLabel}>First Name</label>
                            <input type="text" name="f_name" value={formData.f_name} onChange={handleChange} required className={styles.fieldInput} />
                        </div>
                        <div>
                            <label className={styles.fieldLabel}>Last Name</label>
                            <input type="text" name="last_name" value={formData.last_name} onChange={handleChange} required className={styles.fieldInput} />
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
                                {filteredBranches.map((branch) => (
                                    <option key={branch._id} value={branch.bid}>
                                        {branch.bid} - {branch.b_name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className={styles.fieldLabel}>Email</label>
                            <input type="email" name="email" value={formData.email} onChange={handleChange} required className={styles.fieldInput} />
                        </div>
                        <div>
                            <label className={styles.fieldLabel}>Phone Number</label>
                            <input type="text" name="phone_no" value={formData.phone_no} onChange={handleChange} className={styles.fieldInput} />
                        </div>
                    </div>
                </div>

                <div className={styles.formSection}>
                    <h3 className={styles.sectionTitle}>Account and Salaries</h3>
                    <div className={styles.fieldGroup}>
                         <div>
                            <label className={styles.fieldLabel}>Account Number</label>
                            <input type="text" name="acno" value={formData.acno} onChange={handleChange} required className={styles.fieldInput} />
                        </div>
                        <div>
                            <label className={styles.fieldLabel}>IFSC Code</label>
                            <input type="text" name="ifsc" value={formData.ifsc} onChange={handleChange} required className={styles.fieldInput} />
                        </div>
                        <div>
                            <label className={styles.fieldLabel}>Bank Name</label>
                            <input type="text" name="bankname" value={formData.bankname} onChange={handleChange} required className={styles.fieldInput} />
                        </div>
                        <div>
                            <label className={styles.fieldLabel}>Monthly Salary</label>
                            <input type="number" name="base_salary" value={formData.base_salary} onChange={handleChange} required step="0.01" className={styles.fieldInput} />
                        </div>
                        <div>
                            <label className={styles.fieldLabel}>Address</label>
                            <input type="text" name="address" value={formData.address} onChange={handleChange} className={styles.fieldInput} />
                        </div>
                    </div>
                </div>
                
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