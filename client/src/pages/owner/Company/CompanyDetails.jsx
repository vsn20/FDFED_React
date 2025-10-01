import React, { useState, useEffect } from 'react';
import api from '../../../api/api';
import styles from './Company.module.css'; // Import CSS module

const CompanyDetails = ({ id, handleback }) => {
    const [formdata, setFormData] = useState({
        cname: '',
        email: '',
        phone: '',
        address: ''
    });

    useEffect(() => {
        const fetchCompanyDetails = async () => {
            try {
                const res = await api.get(`/companies/${id}`);
                setFormData(res.data);
            } catch (error) {
                console.log('Error fetching company details:', error);
                alert('Failed to fetch company details. Please try again.');
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
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.put(`/companies/${id}`, formdata);
            handleback();
        } catch (error) {
            console.error('Error updating company details:', error);
            alert('Failed to update details. Please try again.');
        }
    };

    return (
        <div className={styles.formContainer}>
            <form onSubmit={handleSubmit} className={styles.formWrapper}>
                <h2>Edit Company Details</h2>
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