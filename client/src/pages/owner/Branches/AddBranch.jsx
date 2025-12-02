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
    const [error, setError] = useState(''); // State for validation errors

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        if (error) setError(''); // Clear error when user types
    };

    const validateForm = () => {
        const name = formData.b_name.trim();
        const address = formData.address.trim();

        if (!name) return "Branch Name is required.";
        if (/^\d/.test(name)) return "Branch Name cannot start with a number.";
        if (name.length < 3) return "Branch Name must be at least 3 characters.";
        
        if (!address) return "Address is required.";
        if (address.length < 5) return "Address must be at least 5 characters.";

        return null;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        const validationError = validateForm();
        if (validationError) {
            setError(validationError);
            return;
        }

        try {
            await dispatch(createBranch({
                b_name: formData.b_name.trim(),
                address: formData.address.trim()
            })).unwrap();
            
            handleBack(); 
        } catch (err) {
            console.error("Error adding branch:", err);
            setError(typeof err === 'string' ? err : "Failed to add branch. Try again.");
        }
    };

    return (
        <div className={styles.formContainer}>
            <h2>Add Branch</h2>
            
            {/* Error Message Display */}
            {error && <div className={styles.errorMessage}>{error}</div>}

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