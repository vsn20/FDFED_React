// client/src/pages/owner/Company/AddCompany.jsx
import React, { useState } from 'react';
import api from '../../../api/api';
import styles from './Company.module.css';

const AddCompany = ({ handleBack }) => {
    const [formData, setFormData] = useState({
        cname: '',
        email: '',
        phone: '',
        address: ''
    });
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
        if (error) setError(''); // Clear error on typing
    };

    const validateForm = () => {
        const cname = formData.cname.trim();
        const phone = formData.phone.trim();
        const email = formData.email.trim();
        const address = formData.address.trim();

        if (!cname) return "Company Name is required.";
        if (/^\d/.test(cname)) return "Company Name cannot start with a number.";
        if (cname.length < 3) return "Company Name must be at least 3 characters.";

        if (!email) return "Email is required.";
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return "Invalid email format.";

        if (!phone) return "Phone number is required.";
        if (!/^\d{10}$/.test(phone)) return "Phone number must be exactly 10 digits.";

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
            await api.post('/companies', formData);
            // On success, reset form and go back
            setFormData({
                cname: '',
                email: '',
                phone: '',
                address: ''
            });
            handleBack(); 
        } catch (error) {
            console.log('Error submitting company data:', error);
            setError('Failed to add company. Please try again.');
        }
    };

    return (
        <div className={styles.formContainer}>
            <form onSubmit={handleSubmit} className={styles.formWrapper}>
                <h2>Add New Company</h2>
                
                {error && <div className={styles.errorMessage}>{error}</div>}

                <div className={styles.formSection}>
                    <div className={styles.fieldGroup}>
                        <div>
                            <label className={styles.fieldLabel} htmlFor="cname">Company Name</label>
                            <input
                                type="text"
                                id="cname"
                                name="cname"
                                value={formData.cname}
                                onChange={handleChange}
                                required
                                placeholder="e.g. Tech Solutions"
                                className={styles.fieldInput}
                            />
                        </div>
                        <div>
                            <label className={styles.fieldLabel} htmlFor="email">Email</label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                placeholder="contact@company.com"
                                className={styles.fieldInput}
                            />
                        </div>
                        <div>
                            <label className={styles.fieldLabel} htmlFor="phone">Phone</label>
                            <input
                                type="tel"
                                id="phone"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                required
                                placeholder="10-digit number"
                                className={styles.fieldInput}
                            />
                        </div>
                        <div>
                            <label className={styles.fieldLabel} htmlFor="address">Address</label>
                            <textarea
                                id="address"
                                name="address"
                                value={formData.address}
                                onChange={handleChange}
                                required
                                placeholder="Full business address"
                                className={styles.fieldTextarea}
                            />
                        </div>
                    </div>
                </div>
                <button type="submit" className={styles.submitButton}>Save Company</button>
            </form>
        </div>
    );
};

export default AddCompany;