// client/src/pages/owner/Branches/BranchDetails.jsx
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updateBranch } from '../../../redux/slices/branchSlice';
import styles from './Branch.module.css';

const BranchDetails = ({ bid, handleBack }) => {
    const dispatch = useDispatch();
    
    const branchFromStore = useSelector(state => 
        state.branches.items.find(b => b.bid === bid)
    );

    const [formData, setFormData] = useState({
        bid: '',
        b_name: '',
        manager_name: '',
        manager_email: '',
        manager_ph_no: '',
        address: ''
    });
    const [error, setError] = useState('');

    useEffect(() => {
        if (branchFromStore) {
            setFormData({
                bid: branchFromStore.bid,
                b_name: branchFromStore.b_name,
                manager_name: branchFromStore.manager_name,
                manager_email: branchFromStore.manager_email,
                manager_ph_no: branchFromStore.manager_ph_no,
                address: branchFromStore.location 
            });
        }
    }, [branchFromStore]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        if (error) setError('');
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
            await dispatch(updateBranch({
                bid: formData.bid,
                branchData: {
                    b_name: formData.b_name.trim(),
                    address: formData.address.trim()
                }
            })).unwrap();
            
            handleBack();
        } catch (err) {
            console.error("Error updating branch:", err);
            setError("Failed to update branch. Please try again.");
        }
    };

    if (!branchFromStore) {
        return <div className={styles.errorMessage}>Branch not found in records.</div>;
    }

    return (
        <div className={styles.formContainer}>
            <h2>Edit Branch</h2>
            
            {/* Error Message Display */}
            {error && <div className={styles.errorMessage}>{error}</div>}

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