import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../../api/api';
import styles from './Details.module.css';

const ManagerEmployeeDetails = () => {
    const { e_id } = useParams();
    const navigate = useNavigate();
    const [employee, setEmployee] = useState(null);
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        status: '',
        email: '',
        phoneNumber: '',
        accountNumber: '',
        ifsc: '',
        bank: '',
        address: '',
        baseSalary: 0,
    });
    const [notFound, setNotFound] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        const fetchEmployee = async () => {
            try {
                const res = await api.get(`/manager/employees/${e_id}`);
                setEmployee(res.data);
                setFormData({
                    firstName: res.data.f_name,
                    lastName: res.data.last_name,
                    status: res.data.status.toLowerCase(),
                    email: res.data.email,
                    phoneNumber: res.data.phone_no || '',
                    accountNumber: res.data.acno,
                    ifsc: res.data.ifsc,
                    bank: res.data.bankname,
                    address: res.data.address || '',
                    baseSalary: res.data.base_salary || 0,
                });
            } catch (err) {
                console.error("Error fetching employee details:", err);
                setNotFound(true);
                setErrorMessage(err.response?.data?.message || "Failed to load employee details");
            }
        };
        fetchEmployee();
    }, [e_id]);

    const isFired = employee?.status === 'fired'; // NEW: Check if fired

    const handleChange = (e) => {
        if (isFired) return; // FIXED: No changes if fired
        // Only allow changes to status and baseSalary
        if (e.target.name === 'status' || e.target.name === 'baseSalary') {
            setFormData({ ...formData, [e.target.name]: e.target.value });
        }
        setSuccessMessage('');
        setErrorMessage('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (isFired) return; // FIXED: No submit if fired

        try {
            // Only send editable fields
            const updateData = {
                status: formData.status,
                base_salary: parseFloat(formData.baseSalary) || 0,
                // Include role and bid to enforce
                role: 'salesman',
                bid: employee.bid
            };
            const res = await api.put(`/manager/employees/${e_id}`, updateData);
            setSuccessMessage(res.data.message || 'Employee updated successfully');
            setErrorMessage('');
            // Refetch to update state
            const updatedRes = await api.get(`/manager/employees/${e_id}`);
            setEmployee(updatedRes.data);
            setFormData({
                ...formData,
                status: updatedRes.data.status.toLowerCase(),
                baseSalary: updatedRes.data.base_salary || 0,
            });
        } catch (err) {
            console.error("Error updating employee details:", err);
            setErrorMessage(err.response?.data?.message || "Failed to update employee details");
            setSuccessMessage('');
        }
    };

    if (notFound) {
        return <div className={styles.errorMessage}>Employee not found.</div>;
    }

    if (!employee) {
        return <div>Loading...</div>;
    }

    const branchName = employee.branch_name || 'Not Assigned';

    return (
        <div className={styles.container}>
            <div className={styles.contentArea}>
                <h1>Employee Details {isFired && '(View Only - Fired)'}</h1> {/* NEW: Indicate view only */}
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
                                        value={formData.firstName}
                                        disabled
                                    />
                                </div>
                                <div>
                                    <label className={styles.fieldLabel}>Last Name</label>
                                    <input
                                        className={`${styles.fieldInput} ${styles.disabledField}`}
                                        type="text"
                                        value={formData.lastName}
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
                                        className={`${styles.fieldInput} ${isFired ? styles.disabledField : ''}`}
                                        name="status"
                                        value={formData.status}
                                        onChange={handleChange}
                                        disabled={isFired} // FIXED: Disable if fired
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
                                        value={formData.email}
                                        disabled
                                    />
                                </div>
                                <div>
                                    <label className={styles.fieldLabel}>Phone Number</label>
                                    <input
                                        className={`${styles.fieldInput} ${styles.disabledField}`}
                                        type="text"
                                        value={formData.phoneNumber}
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
                                        value={employee.formattedHireDate || (employee.hiredAt ? new Date(employee.hiredAt).toLocaleDateString() : 'N/A')}
                                        disabled
                                    />
                                </div>
                                <div>
                                    <label className={styles.fieldLabel}>Account Number</label>
                                    <input
                                        className={`${styles.fieldInput} ${styles.disabledField}`}
                                        type="text"
                                        value={formData.accountNumber}
                                        disabled
                                    />
                                </div>
                                <div>
                                    <label className={styles.fieldLabel}>IFSC Code</label>
                                    <input
                                        className={`${styles.fieldInput} ${styles.disabledField}`}
                                        type="text"
                                        value={formData.ifsc}
                                        disabled
                                    />
                                </div>
                                <div>
                                    <label className={styles.fieldLabel}>Bank</label>
                                    <input
                                        className={`${styles.fieldInput} ${styles.disabledField}`}
                                        type="text"
                                        value={formData.bank}
                                        disabled
                                    />
                                </div>
                                <div>
                                    <label className={styles.fieldLabel}>Monthly Salary</label>
                                    <input
                                        className={`${styles.fieldInput} ${isFired ? styles.disabledField : ''}`}
                                        type="number"
                                        name="baseSalary"
                                        value={formData.baseSalary}
                                        onChange={handleChange}
                                        disabled={isFired} // FIXED: Disable if fired
                                        min="0"
                                        placeholder="Enter monthly salary"
                                    />
                                </div>
                                <div>
                                    <label className={styles.fieldLabel}>Address</label>
                                    <input
                                        className={`${styles.fieldInput} ${styles.disabledField}`}
                                        type="text"
                                        value={formData.address}
                                        disabled
                                    />
                                </div>
                            </div>
                        </div>

                        {!isFired && ( // FIXED: Hide update button if fired
                            <button className={styles.submitButton} onClick={handleSubmit}>
                                Update Details
                            </button>
                        )}
                        <button className={styles.backButton} onClick={() => navigate('/manager/employees')}>
                            Back to List
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ManagerEmployeeDetails;