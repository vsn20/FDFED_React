// client/src/pages/owner/Company/CompanyDetails.jsx
import React, { useState, useEffect } from 'react';
import api from '../../../api/api';
import styles from './Company.module.css';

const CompanyDetails = ({ id, handleback }) => {
    const [formdata, setFormData] = useState({
        cname: '',
        email: '',
        phone: '',
        address: ''
    });
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchCompanyDetails = async () => {
            try {
                const res = await api.get(`/companies/${id}`);
                setFormData(res.data);
            } catch (error) {
                console.log('Error fetching company details:', error);
                setError('Failed to fetch company details.');
            }
        };

        if (id) {
            fetchCompanyDetails();
        }
    }, [id]);

    const handleChange = (e) => {
        setFormData({
            ...formdata,
            [e.target.name]: e.target.value
        });
        if (error) setError('');
    };

    const validateForm = () => {
        const cname = formdata.cname.trim();
        const phone = formdata.phone.trim();
        const email = formdata.email.trim();
        const address = formdata.address.trim();

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
            await api.put(`/companies/${id}`, formdata);
            handleback();
        } catch (error) {
            console.error('Error updating company details:', error);
            setError('Failed to update details. Please try again.');
        }
    };

    return (
        <div className={styles.formContainer}>
            <form onSubmit={handleSubmit} className={styles.formWrapper}>
                <h2>Edit Company Details</h2>
                
                {error && <div className={styles.errorMessage}>{error}</div>}

                <div className={styles.formSection}>
                    <div className={styles.fieldGroup}>
                        <div>
                            <label className={styles.fieldLabel}>Company ID</label>
                            <input
                                value={id}
                                disabled
                                className={`${styles.fieldInput} ${styles.disabledField}`}
                            />
                        </div>
                        <div>
                            <label className={styles.fieldLabel} htmlFor="cname">Company Name</label>
                            <input
                                type="text"
                                id="cname"
                                name="cname"
                                value={formdata.cname}
                                onChange={handleChange}
                                required
                                className={styles.fieldInput}
                            />
                        </div>
                        <div>
                            <label className={styles.fieldLabel} htmlFor="email">Email</label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={formdata.email}
                                onChange={handleChange}
                                required
                                className={styles.fieldInput}
                            />
                        </div>
                        <div>
                            <label className={styles.fieldLabel} htmlFor="phone">Phone</label>
                            <input
                                type="tel"
                                id="phone"
                                name="phone"
                                value={formdata.phone}
                                onChange={handleChange}
                                required
                                className={styles.fieldInput}
                            />
                        </div>
                        <div>
                            <label className={styles.fieldLabel} htmlFor="address">Address</label>
                            <textarea
                                id="address"
                                name="address"
                                value={formdata.address}
                                onChange={handleChange}
                                rows="3"
                                required
                                className={styles.fieldTextarea}
                            />
                        </div>
                    </div>
                </div>
                <button type="submit" className={styles.submitButton}>Save Changes</button>
            </form>
        </div>
    );
};

export default CompanyDetails;