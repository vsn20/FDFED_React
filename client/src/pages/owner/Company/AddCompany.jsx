import React, { useState } from 'react';
import api from '../../../api/api';
import styles from './Company.module.css'; // Import CSS module

const AddCompany = () => {
    const [formData, setFormData] = useState({
        cname: '',
        email: '',
        phone: '',
        address: ''
    });

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/companies', formData);
            setFormData({
                cname: '',
                email: '',
                phone: '',
                address: ''
            });
        } catch (error) {
            console.log('Error submitting company data:', error);
            alert('Failed to add company. Please try again.');
        }
    };

    return (
        <div className={styles.formContainer}>
            <form onSubmit={handleSubmit} className={styles.formWrapper}>
                <h2>Add New Company</h2>
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