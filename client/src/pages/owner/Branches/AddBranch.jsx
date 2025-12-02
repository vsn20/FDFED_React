// client/src/pages/owner/Branches/AddBranch.jsx
import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { createBranch } from '../../../redux/slices/branchSlice';
import styles from './Branch.module.css';

const AddBranch = ({ handleBack }) => {
    const dispatch = useDispatch();
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
            // Dispatch the Redux action
            // unwrap() allows us to catch errors or wait for success in the component
            await dispatch(createBranch({
                b_name: formData.b_name,
                address: formData.address
            })).unwrap();
            
            handleBack(); // Go back to list on success
        } catch (err) {
            console.error("Error adding branch:", err);
            alert("Failed to add branch");
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