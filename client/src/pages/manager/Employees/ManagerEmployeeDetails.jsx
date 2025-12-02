import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
    fetchEmployeeDetailsSuccess,
    fetchEmployeeDetailsFailure,
    updateEmployeeSuccess,
    clearCurrentEmployee
} from '../../../redux/slices/managerEmployeeSlice';
import api from '../../../api/api';
import styles from './Details.module.css';

const ManagerEmployeeDetails = () => {
    const { e_id } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();

    // REDUX STATE
    const employee = useSelector(state => state.managerEmployees.currentEmployee);
    const loading = useSelector(state => state.managerEmployees.loading);
    const error = useSelector(state => state.managerEmployees.error);

    // LOCAL STATES
    const [formData, setFormData] = useState({
        status: '',
        baseSalary: 0,
    });
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');


    useEffect(() => {
        const fetchEmployee = async () => {
            try {
                const res = await api.get(`/manager/employees/${e_id}`);
                dispatch(fetchEmployeeDetailsSuccess(res.data));
                
                // Set local form state based on fetched data (only for editable fields)
                setFormData({
                    status: res.data.status.toLowerCase(),
                    baseSalary: res.data.base_salary || 0,
                });
            } catch (err) {
                console.error("Error fetching employee details:", err);
                const fetchError = err.response?.data?.message || "Failed to load employee details";
                dispatch(fetchEmployeeDetailsFailure(fetchError));
                setErrorMessage(fetchError);
            }
        };

        dispatch(clearCurrentEmployee());
        fetchEmployee();
    }, [e_id, dispatch]);


    // SYNC FORM DATA when employee object changes in Redux (e.g., after an update)
    useEffect(() => {
        if (employee) {
            setFormData({
                status: employee.status.toLowerCase(),
                baseSalary: employee.base_salary || 0,
            });
        }
    }, [employee]);
    
    // Check if status is Fired OR Resigned to prevent edits
    const statusLower = employee?.status.toLowerCase();
    const isLocked = statusLower === 'fired' || statusLower === 'resigned';

    const handleChange = (e) => {
        if (isLocked) return; // Prevent changes if locked
        // ONLY allow changes to status and baseSalary
        if (['status', 'baseSalary'].includes(e.target.name)) {
            setFormData({ ...formData, [e.target.name]: e.target.value });
        }
        setSuccessMessage('');
        setErrorMessage('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (isLocked) return; // Prevent submission if locked

        // START: SALARY VALIDATION
        if (String(formData.baseSalary).trim() === '') {
            setErrorMessage('Monthly salary is required.');
            setSuccessMessage('');
            return;
        }
        const salaryValue = parseFloat(formData.baseSalary);
        if (isNaN(salaryValue) || salaryValue <= 0) {
            setErrorMessage('Monthly salary must be a positive number.');
            setSuccessMessage('');
            return;
        }
        // END: SALARY VALIDATION

        try {
            // ONLY send the fields the manager is authorized to update
            const updateData = {
                status: formData.status,
                base_salary: salaryValue,
            };
            const res = await api.put(`/manager/employees/${e_id}`, updateData);
            
            // Dispatch action to update Redux state immediately
            const updatedEmployeeData = { 
                ...employee, 
                ...updateData,
                status: updateData.status.toUpperCase(), 
                base_salary: updateData.base_salary,
            };
            dispatch(updateEmployeeSuccess(updatedEmployeeData));

            // START: SUCCESS MESSAGE & DELAYED REDIRECT
            setSuccessMessage("Employee updated successfully!");
            setErrorMessage('');
            
            setTimeout(() => {
                navigate('/manager/employees');
            }, 1500); 
            // END: SUCCESS MESSAGE & DELAYED REDIRECT
            
        } catch (err) {
            console.error("Error updating employee details:", err);
            setErrorMessage(err.response?.data?.message || "Failed to update employee details");
            setSuccessMessage('');
        }
    };

    if (loading && !employee) {
        return <div>Loading...</div>;
    }
    
    if (error && !employee) {
        return <div className={styles.errorMessage}>Employee not found. {error}</div>;
    }

    if (!employee) {
        return <div>Employee data is unavailable.</div>;
    }

    const branchName = employee.branch_name || 'N/A';
    const hireDate = employee.formattedHireDate || (employee.hiredAt ? new Date(employee.hiredAt).toLocaleDateString() : 'N/A');


    return (
        <div className={styles.container}>
            <div className={styles.contentArea}>
                <h1>Employee Details {isLocked && '(View Only)'}</h1>
                
                {successMessage && <p className={styles.successMessage}>{successMessage}</p>}
                {errorMessage && <p className={styles.errorMessage}>{errorMessage}</p>}
                
                <div className={styles.formContainer}>
                    <div className={styles.formWrapper}>
                        <div className={styles.formSection}>
                            <h2 className={styles.sectionTitle}>Personal Details</h2>
                            <div className={styles.fieldGroup}>
                                <div>
                                    <label className={styles.fieldLabel}>Employee ID</label>
                                    <input
                                        className={`${styles.fieldInput} ${styles.disabledField}`}
                                        type="text"
                                        value={employee.e_id}
                                        disabled
                                    />
                                </div>
                                <div>
                                    <label className={styles.fieldLabel}>First Name</label>
                                    <input
                                        className={`${styles.fieldInput} ${styles.disabledField}`}
                                        type="text"
                                        value={employee.f_name}
                                        disabled
                                    />
                                </div>
                                <div>
                                    <label className={styles.fieldLabel}>Last Name</label>
                                    <input
                                        className={`${styles.fieldInput} ${styles.disabledField}`}
                                        type="text"
                                        value={employee.last_name}
                                        disabled
                                    />
                                </div>
                                <div>
                                    <label className={styles.fieldLabel}>Role</label>
                                    <input
                                        className={`${styles.fieldInput} ${styles.disabledField}`}
                                        type="text"
                                        value={employee.role}
                                        disabled
                                    />
                                </div>
                                <div>
                                    <label className={styles.fieldLabel}>Status</label>
                                    <select
                                        className={`${styles.fieldInput} ${isLocked ? styles.disabledField : ''}`}
                                        name="status"
                                        value={formData.status}
                                        onChange={handleChange}
                                        disabled={isLocked}
                                    >
                                        <option value="active">Active</option>
                                        <option value="resigned">Resigned</option>
                                        <option value="fired">Fired</option>
                                    </select>
                                </div>
                                <div>
                                    <label className={styles.fieldLabel}>Branch Name</label>
                                    <input
                                        className={`${styles.fieldInput} ${styles.disabledField}`}
                                        type="text"
                                        value={branchName}
                                        disabled
                                    />
                                </div>
                                <div>
                                    <label className={styles.fieldLabel}>Email</label>
                                    <input
                                        className={`${styles.fieldInput} ${styles.disabledField}`}
                                        type="email"
                                        value={employee.email}
                                        disabled
                                    />
                                </div>
                                <div>
                                    <label className={styles.fieldLabel}>Phone Number</label>
                                    <input
                                        className={`${styles.fieldInput} ${styles.disabledField}`}
                                        type="text"
                                        value={employee.phone_no || ''} 
                                        disabled
                                    />
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
                                        value={hireDate}
                                        disabled
                                    />
                                </div>
                                <div>
                                    <label className={styles.fieldLabel}>Account Number</label>
                                    <input
                                        className={`${styles.fieldInput} ${styles.disabledField}`}
                                        type="text"
                                        value={employee.acno}
                                        disabled
                                    />
                                </div>
                                <div>
                                    <label className={styles.fieldLabel}>IFSC Code</label>
                                    <input
                                        className={`${styles.fieldInput} ${styles.disabledField}`}
                                        type="text"
                                        value={employee.ifsc}
                                        disabled
                                    />
                                </div>
                                <div>
                                    <label className={styles.fieldLabel}>Bank</label>
                                    <input
                                        className={`${styles.fieldInput} ${styles.disabledField}`}
                                        type="text"
                                        value={employee.bankname}
                                        disabled
                                    />
                                </div>
                                <div>
                                    <label className={styles.fieldLabel}>Monthly Salary</label>
                                    <input
                                        className={`${styles.fieldInput} ${isLocked ? styles.disabledField : ''}`}
                                        type="number"
                                        name="baseSalary"
                                        value={formData.baseSalary}
                                        onChange={handleChange}
                                        disabled={isLocked}
                                        min="0"
                                        placeholder="Enter monthly salary"
                                    />
                                </div>
                                <div>
                                    <label className={styles.fieldLabel}>Address</label>
                                    <input
                                        className={`${styles.fieldInput} ${styles.disabledField}`}
                                        type="text"
                                        value={employee.address || ''}
                                        disabled
                                    />
                                </div>
                            </div>
                        </div>

                        {!isLocked && (
                            <button className={styles.submitButton} onClick={handleSubmit}>
                                Update Details
                            </button>
                        )}
                        <button className={styles.submitButton} onClick={() => navigate('/manager/employees')}>
                            Back to List
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ManagerEmployeeDetails;