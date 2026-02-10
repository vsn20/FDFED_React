import React, { useState, useEffect } from 'react';
import api from '../../../api/api';
import styles from './Details.module.css';

const Details = () => {
    const [salesman, setSalesman] = useState(null);
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
        const fetchSalesman = async () => {
            try {
                const res = await api.get('/salesman/profile');
                setSalesman(res.data);
                setFormData({
                    firstName: res.data.firstName,
                    lastName: res.data.lastName,
                    status: res.data.status.toLowerCase(),
                    email: res.data.email,
                    phoneNumber: res.data.phoneNumber || '',
                    accountNumber: res.data.accountNumber,
                    ifsc: res.data.ifsc,
                    bank: res.data.bank,
                    address: res.data.address || '',
                    baseSalary: res.data.monthlySalary || 0,
                });
            } catch (err) {
                console.error("Error fetching salesman details:", err);
                setNotFound(true);
                setErrorMessage(err.response?.data?.message || "Failed to load salesman details");
            }
        };
        fetchSalesman();
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await api.post('/salesman/profile/update', {
                ...formData,
                baseSalary: parseFloat(formData.baseSalary) || 0,
            });
            setSuccessMessage(res.data.message);
            setErrorMessage('');
            const updatedRes = await api.get('/salesman/profile');
            setSalesman(updatedRes.data);
            setFormData({
                firstName: updatedRes.data.firstName,
                lastName: updatedRes.data.lastName,
                status: updatedRes.data.status.toLowerCase(),
                email: updatedRes.data.email,
                phoneNumber: updatedRes.data.phoneNumber || '',
                accountNumber: updatedRes.data.accountNumber,
                ifsc: updatedRes.data.ifsc,
                bank: updatedRes.data.bank,
                address: updatedRes.data.address || '',
                baseSalary: updatedRes.data.monthlySalary || 0,
            });
        } catch (err) {
            console.error("Error updating salesman details:", err);
            setErrorMessage(err.response?.data?.message || "Failed to update salesman details");
            setSuccessMessage('');
        }
    };

    if (notFound) {
        return <div className={styles.errorMessage}>Salesman not found.</div>;
    }

    if (!salesman) {
        return <div>Loading...</div>;
    }

    return (
        <div className={styles.container}>
            <div className={styles.contentArea}>
                <h1>Employee Details</h1>
                {successMessage && <p className={styles.successMessage}>{successMessage}</p>}
                {errorMessage && <p className={styles.errorMessage}>{errorMessage}</p>}
                <div className={styles.formContainer}>
                    <div className={styles.formWrapper}>
                        <div className={styles.formSection}>
                            <h2 className={styles.sectionTitle}>Personal Details</h2>
                            <div className={styles.fieldGroup}>
                                <div>
                                    <label className={styles.fieldLabel}>Salesman ID</label>
                                    <input
                                        className={`${styles.fieldInput} ${styles.disabledField}`}
                                        type="text"
                                        value={salesman.salesmanId}
                                        disabled
                                    />
                                </div>
                                <div>
                                    <label className={styles.fieldLabel}>First Name</label>
                                    <input
                                        className={styles.fieldInput}
                                        type="text"
                                        name="firstName"
                                        value={formData.firstName}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className={styles.fieldLabel}>Last Name</label>
                                    <input
                                        className={styles.fieldInput}
                                        type="text"
                                        name="lastName"
                                        value={formData.lastName}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className={styles.fieldLabel}>Role</label>
                                    <input
                                        className={`${styles.fieldInput} ${styles.disabledField}`}
                                        type="text"
                                        value={salesman.role}
                                        disabled
                                    />
                                </div>
                                <div>
                                    <label className={styles.fieldLabel}>Status</label>
                                    <select
                                        className={styles.fieldInput}
                                        name="status"
                                        value={formData.status}
                                        onChange={handleChange}
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
                                        value={salesman.branch}
                                        disabled
                                    />
                                </div>
                                <div>
                                    <label className={styles.fieldLabel}>Email</label>
                                    <input
                                        className={`${styles.fieldInput} ${styles.disabledField}`}
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        disabled
                                    />
                                </div>
                                <div>
                                    <label className={styles.fieldLabel}>Phone Number</label>
                                    <input
                                        className={styles.fieldInput}
                                        type="text"
                                        name="phoneNumber"
                                        value={formData.phoneNumber}
                                        onChange={handleChange}
                                        pattern="[0-9]{10}"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className={styles.formSection}>
                            <h2 className={styles.sectionTitle}>Account and Salaries</h2>
                            <div className={styles.fieldGroup}>
                                <div>
                                    <label className={styles.fieldLabel}>Registration Date</label>
                                    <input
                                        className={`${styles.fieldInput} ${styles.disabledField}`}
                                        type="text"
                                        value={salesman.formattedRegistrationDate}
                                        disabled
                                    />
                                </div>
                                <div>
                                    <label className={styles.fieldLabel}>Account Number</label>
                                    <input
                                        className={`${styles.fieldInput} ${styles.disabledField}`}
                                        type="text"
                                        name="accountNumber"
                                        value={formData.accountNumber}
                                        disabled
                                    />
                                </div>
                                <div>
                                    <label className={styles.fieldLabel}>IFSC Code</label>
                                    <input
                                        className={`${styles.fieldInput} ${styles.disabledField}`}
                                        type="text"
                                        name="ifsc"
                                        value={formData.ifsc}
                                        disabled
                                    />
                                </div>
                                <div>
                                    <label className={styles.fieldLabel}>Bank</label>
                                    <input
                                        className={`${styles.fieldInput} ${styles.disabledField}`}
                                        type="text"
                                        name="bank"
                                        value={formData.bank}
                                        disabled
                                    />
                                </div>
                                <div>
                                    <label className={styles.fieldLabel}>Hire Date</label>
                                    <input
                                        className={`${styles.fieldInput} ${styles.disabledField}`}
                                        type="text"
                                        value={salesman.formattedHireDate}
                                        disabled
                                    />
                                </div>
                                <div>
                                    <label className={styles.fieldLabel}>Monthly Salary</label>
                                    <input
                                        className={`${styles.fieldInput} ${styles.disabledField}`}
                                        type="number"
                                        name="baseSalary"
                                        value={formData.baseSalary}
                                        disabled
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
                                    />
                                </div>
                            </div>
                        </div>

                        <button className={styles.submitButton} onClick={handleSubmit}>
                            Update Details
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Details;