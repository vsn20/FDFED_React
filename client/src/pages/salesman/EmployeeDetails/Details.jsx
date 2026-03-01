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
    const [originalData, setOriginalData] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [notFound, setNotFound] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    const buildFormData = (data) => ({
        firstName: data.firstName,
        lastName: data.lastName,
        status: data.status.toLowerCase(),
        email: data.email,
        phoneNumber: data.phoneNumber || '',
        accountNumber: data.accountNumber,
        ifsc: data.ifsc,
        bank: data.bank,
        address: data.address || '',
        baseSalary: data.monthlySalary || 0,
    });

    useEffect(() => {
        const fetchSalesman = async () => {
            try {
                const res = await api.get('/salesman/profile');
                setSalesman(res.data);
                const built = buildFormData(res.data);
                setFormData(built);
                setOriginalData(built);
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

    const handleEdit = () => {
        setOriginalData({ ...formData });
        setSuccessMessage('');
        setErrorMessage('');
        setIsEditing(true);
    };

    const handleCancel = () => {
        setFormData({ ...originalData });
        setSuccessMessage('');
        setErrorMessage('');
        setIsEditing(false);
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
            const built = buildFormData(updatedRes.data);
            setFormData(built);
            setOriginalData(built);
            setIsEditing(false);
        } catch (err) {
            console.error("Error updating salesman details:", err);
            setErrorMessage(err.response?.data?.message || "Failed to update salesman details");
            setSuccessMessage('');
        }
    };

    const statusColors = {
        active: styles.statusActive,
        resigned: styles.statusResigned,
        fired: styles.statusFired,
    };

    if (notFound) {
        return (
            <div className={styles.centeredError}>
                <div className={styles.errorBubble}>Employee record not found.</div>
            </div>
        );
    }

    if (!salesman) {
        return (
            <div className={styles.loadingWrapper}>
                <div className={styles.spinner}></div>
                <p>Loading profile…</p>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <div className={styles.contentArea}>

                {/* ── Header Row ── */}
                <div className={styles.pageHeader}>
                    <div className={styles.avatarBlock}>
                        <div className={styles.avatar}>
                            {formData.firstName.charAt(0)}{formData.lastName.charAt(0)}
                        </div>
                        <div>
                            <h1 className={styles.profileName}>
                                {formData.firstName} {formData.lastName}
                            </h1>
                            <span className={`${styles.statusBadge} ${statusColors[formData.status] || ''}`}>
                                {formData.status.charAt(0).toUpperCase() + formData.status.slice(1)}
                            </span>
                        </div>
                    </div>

                    {!isEditing ? (
                        <button className={styles.editButton} onClick={handleEdit}>
                            ✏️ Edit Profile
                        </button>
                    ) : (
                        <div className={styles.actionButtons}>
                            <button className={styles.cancelButton} onClick={handleCancel}>
                                ✕ Cancel
                            </button>
                            <button className={styles.saveButton} onClick={handleSubmit}>
                                ✔ Save Changes
                            </button>
                        </div>
                    )}
                </div>

                {/* ── Alerts ── */}
                {successMessage && (
                    <div className={styles.alertSuccess}>✅ {successMessage}</div>
                )}
                {errorMessage && (
                    <div className={styles.alertError}>⚠️ {errorMessage}</div>
                )}

                {/* ── Sections ── */}
                <div className={styles.sectionsGrid}>

                    {/* Personal Details */}
                    <div className={styles.card}>
                        <div className={styles.cardHeader}>
                            <span className={styles.cardIcon}>👤</span>
                            <h2 className={styles.cardTitle}>Personal Details</h2>
                        </div>
                        <div className={styles.fieldGroup}>

                            <div className={`${styles.fieldItem} ${isEditing ? styles.lockedItem : ''}`}>
                                <label className={styles.fieldLabel}>Salesman ID</label>
                                <div className={styles.readValue}>{salesman.salesmanId}</div>
                            </div>

                            <div className={styles.fieldItem}>
                                <label className={styles.fieldLabel}>First Name</label>
                                {isEditing ? (
                                    <input
                                        className={styles.fieldInput}
                                        type="text"
                                        name="firstName"
                                        value={formData.firstName}
                                        onChange={handleChange}
                                        required
                                    />
                                ) : (
                                    <div className={styles.readValue}>{formData.firstName}</div>
                                )}
                            </div>

                            <div className={styles.fieldItem}>
                                <label className={styles.fieldLabel}>Last Name</label>
                                {isEditing ? (
                                    <input
                                        className={styles.fieldInput}
                                        type="text"
                                        name="lastName"
                                        value={formData.lastName}
                                        onChange={handleChange}
                                        required
                                    />
                                ) : (
                                    <div className={styles.readValue}>{formData.lastName}</div>
                                )}
                            </div>

                            <div className={`${styles.fieldItem} ${isEditing ? styles.lockedItem : ''}`}>
                                <label className={styles.fieldLabel}>Role</label>
                                <div className={styles.readValue}>{salesman.role}</div>
                            </div>

                            <div className={styles.fieldItem}>
                                <label className={styles.fieldLabel}>Status</label>
                                {isEditing ? (
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
                                ) : (
                                    <div className={styles.readValue}>
                                        <span className={`${styles.statusBadgeSmall} ${statusColors[formData.status] || ''}`}>
                                            {formData.status.charAt(0).toUpperCase() + formData.status.slice(1)}
                                        </span>
                                    </div>
                                )}
                            </div>

                            <div className={`${styles.fieldItem} ${isEditing ? styles.lockedItem : ''}`}>
                                <label className={styles.fieldLabel}>Branch Name</label>
                                <div className={styles.readValue}>{salesman.branch}</div>
                            </div>

                            <div className={`${styles.fieldItem} ${isEditing ? styles.lockedItem : ''}`}>
                                <label className={styles.fieldLabel}>Email</label>
                                <div className={styles.readValue}>{formData.email}</div>
                            </div>

                            <div className={styles.fieldItem}>
                                <label className={styles.fieldLabel}>Phone Number</label>
                                {isEditing ? (
                                    <input
                                        className={styles.fieldInput}
                                        type="text"
                                        name="phoneNumber"
                                        value={formData.phoneNumber}
                                        onChange={handleChange}
                                        pattern="[0-9]{10}"
                                        placeholder="10-digit number"
                                    />
                                ) : (
                                    <div className={styles.readValue}>{formData.phoneNumber || '—'}</div>
                                )}
                            </div>

                        </div>
                    </div>

                    {/* Account & Salary */}
                    <div className={styles.card}>
                        <div className={styles.cardHeader}>
                            <span className={styles.cardIcon}>💳</span>
                            <h2 className={styles.cardTitle}>Account & Salary</h2>
                        </div>
                        <div className={styles.fieldGroup}>

                            <div className={`${styles.fieldItem} ${isEditing ? styles.lockedItem : ''}`}>
                                <label className={styles.fieldLabel}>Registration Date</label>
                                <div className={styles.readValue}>{salesman.formattedRegistrationDate}</div>
                            </div>

                            <div className={`${styles.fieldItem} ${isEditing ? styles.lockedItem : ''}`}>
                                <label className={styles.fieldLabel}>Hire Date</label>
                                <div className={styles.readValue}>{salesman.formattedHireDate}</div>
                            </div>

                            <div className={`${styles.fieldItem} ${isEditing ? styles.lockedItem : ''}`}>
                                <label className={styles.fieldLabel}>Account Number</label>
                                <div className={styles.readValue}>{formData.accountNumber}</div>
                            </div>

                            <div className={`${styles.fieldItem} ${isEditing ? styles.lockedItem : ''}`}>
                                <label className={styles.fieldLabel}>IFSC Code</label>
                                <div className={styles.readValue}>{formData.ifsc}</div>
                            </div>

                            <div className={`${styles.fieldItem} ${isEditing ? styles.lockedItem : ''}`}>
                                <label className={styles.fieldLabel}>Bank</label>
                                <div className={styles.readValue}>{formData.bank}</div>
                            </div>

                            <div className={`${styles.fieldItem} ${isEditing ? styles.lockedItem : ''}`}>
                                <label className={styles.fieldLabel}>Monthly Salary</label>
                                <div className={styles.readValue}>₹ {Number(formData.baseSalary).toLocaleString('en-IN')}</div>
                            </div>

                            <div className={`${styles.fieldItem} ${styles.fullWidth}`}>
                                <label className={styles.fieldLabel}>Address</label>
                                {isEditing ? (
                                    <input
                                        className={styles.fieldInput}
                                        type="text"
                                        name="address"
                                        value={formData.address}
                                        onChange={handleChange}
                                        placeholder="Enter your address"
                                    />
                                ) : (
                                    <div className={styles.readValue}>{formData.address || '—'}</div>
                                )}
                            </div>

                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default Details;