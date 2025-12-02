// client/src/pages/customer/Complaints/ComplaintDetails.jsx
import React, { useState } from 'react';
// import api from '../../../api/api'; // Uncomment if you add an Edit endpoint later
import styles from './Complaints.module.css';

const ComplaintDetails = ({ data, handleBack }) => {
    // We are using data passed from the parent list to avoid an extra API call,
    // but typically you might do a fetch by ID here if you want fresh data.
    
    // For now, this is Read-Only view based on your provided backend logic
    // If you add an Edit endpoint, we can enable the form.

    const [formData] = useState({
        complaint_id: data.complaint_id,
        sale_id: data.sale_id,
        product_name: data.product_name,
        company_name: data.company_name,
        status: data.status,
        date: new Date(data.complaint_date).toLocaleDateString(),
        complaint_info: data.complaint_info
    });

    return (
        <div className={styles.formContainer}>
            <h2>Complaint Details</h2>
            <div className={styles.formWrapper}>
                <div className={styles.formSection}>
                    <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                        <h3 className={styles.sectionTitle}>General Information</h3>
                        <span className={`${styles.statusBadge} ${formData.status === 'Open' ? styles.open : styles.closed}`}>
                            {formData.status}
                        </span>
                    </div>
                    
                    <div className={styles.fieldGroup}>
                        <div>
                            <label className={styles.fieldLabel}>Complaint ID</label>
                            <input
                                type="text"
                                value={formData.complaint_id}
                                disabled
                                className={`${styles.fieldInput} ${styles.disabledField}`}
                            />
                        </div>
                        <div>
                            <label className={styles.fieldLabel}>Sale ID</label>
                            <input
                                type="text"
                                value={formData.sale_id}
                                disabled
                                className={`${styles.fieldInput} ${styles.disabledField}`}
                            />
                        </div>
                        <div>
                            <label className={styles.fieldLabel}>Product Name</label>
                            <input
                                type="text"
                                value={formData.product_name}
                                disabled
                                className={`${styles.fieldInput} ${styles.disabledField}`}
                            />
                        </div>
                        <div>
                            <label className={styles.fieldLabel}>Company</label>
                            <input
                                type="text"
                                value={formData.company_name}
                                disabled
                                className={`${styles.fieldInput} ${styles.disabledField}`}
                            />
                        </div>
                        <div>
                            <label className={styles.fieldLabel}>Date Filed</label>
                            <input
                                type="text"
                                value={formData.date}
                                disabled
                                className={`${styles.fieldInput} ${styles.disabledField}`}
                            />
                        </div>
                    </div>
                </div>

                <div className={styles.formSection}>
                    <h3 className={styles.sectionTitle}>Description</h3>
                    <div className={styles.fieldGroup}>
                        <div style={{flex: '1 1 100%'}}>
                            <textarea
                                value={formData.complaint_info}
                                disabled
                                className={`${styles.fieldTextarea} ${styles.disabledField}`}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ComplaintDetails;