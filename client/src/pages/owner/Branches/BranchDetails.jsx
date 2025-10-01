import React, { useState, useEffect } from 'react';
import api from '../../../api/api';
import styles from './Branch.module.css'; // Import CSS module

const BranchDetails = ({ bid, handleBack }) => {
    const [formData, setFormData] = useState({
        bid: '',
        b_name: '',
        manager_name: '',
        manager_email: '',
        manager_ph_no: '',
        address: ''
    });
    const [notFound, setNotFound] = useState(false);

    useEffect(() => {
        const fetchBranch = async () => {
            try {
                const res = await api.get(`/branches/${bid}`);
                setFormData({
                    bid: res.data.bid,
                    b_name: res.data.b_name,
                    manager_name: res.data.manager_name,
                    manager_email: res.data.manager_email,
                    manager_ph_no: res.data.manager_ph_no,
                    address: res.data.location
                });
            } catch (err) {
                console.error("Error fetching branch:", err);
                setNotFound(true);
            }
        };
        fetchBranch();
    }, [bid]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.put(`/branches/${bid}`, {
                b_name: formData.b_name,
                address: formData.address
            });
            handleBack();
        } catch (err) {
            console.error("Error updating branch:", err);
        }
    };

    if (notFound) {
        return <div className={styles.errorMessage}>Branch not found.</div>;
    }

    return (
        <div className={styles.formContainer}>
            <h2>Edit Branch</h2>
            <form onSubmit={handleSubmit} className={styles.formWrapper}>
                <div className={styles.formSection}>
                    <h3 className={styles.sectionTitle}>Branch Information</h3>
                    <div className={styles.fieldGroup}>
                        <div>
                            <label className={styles.fieldLabel}>Branch ID</label>
                            <input
                                type="text"
                                name="bid"
                                value={formData.bid}
                                disabled
                                className={`${styles.fieldInput} ${styles.disabledField}`}
                            />
                        </div>
                        <div>
                            <label className={styles.fieldLabel}>Branch Name</label>
                            <input
                                type="text"
                                name="b_name"
                                value={formData.b_name}
                                onChange={handleChange}
                                required
                                className={styles.fieldInput}
                            />
                        </div>
                        <div>
                            <label className={styles.fieldLabel}>Manager Name</label>
                            <input
                                type="text"
                                name="manager_name"
                                value={formData.manager_name}
                                disabled
                                className={`${styles.fieldInput} ${styles.disabledField}`}
                            />
                        </div>
                        <div>
                            <label className={styles.fieldLabel}>Manager Email</label>
                            <input
                                type="text"
                                name="manager_email"
                                value={formData.manager_email}
                                disabled
                                className={`${styles.fieldInput} ${styles.disabledField}`}
                            />
                        </div>
                        <div>
                            <label className={styles.fieldLabel}>Manager Phone</label>
                            <input
                                type="text"
                                name="manager_ph_no"
                                value={formData.manager_ph_no}
                                disabled
                                className={`${styles.fieldInput} ${styles.disabledField}`}
                            />
                        </div>
                        <div>
                            <label className={styles.fieldLabel}>Address</label>
                            <input
                                type="text"
                                name="address"
                                value={formData.address}
                                onChange={handleChange}
                                required
                                className={styles.fieldInput}
                            />
                        </div>
                    </div>
                </div>
                <button type="submit" className={styles.submitButton}>Update Branch</button>
            </form>
        </div>
    );
};

export default BranchDetails;