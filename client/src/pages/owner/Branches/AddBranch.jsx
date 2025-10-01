import React, { useState } from 'react';
import api from '../../../api/api';
import styles from './Branch.module.css'; // Import CSS module

const AddBranch = ({ handleBack }) => {
    const [formData, setFormData] = useState({
        b_name: '',
        address: ''
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/branches', {
                b_name: formData.b_name,
                address: formData.address
            });
            handleBack();
        } catch (err) {
            console.error("Error adding branch:", err);
        }
    };

    return (
        <div className={styles.formContainer}>
            <h2>Add Branch</h2>
            <form onSubmit={handleSubmit} className={styles.formWrapper}>
                <div className={styles.formSection}>
                    <h3 className={styles.sectionTitle}>Branch Information</h3>
                    <div className={styles.fieldGroup}>
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
                <button type="submit" className={styles.submitButton}>Submit Branch</button>
            </form>
        </div>
    );
};

export default AddBranch;