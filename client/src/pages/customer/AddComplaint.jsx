import React, { useState, useEffect } from 'react';
import api from '../../api/api'; 
import styles from './Complaints.module.css';

const AddComplaint = ({ handleBack }) => {
    const [eligibleSales, setEligibleSales] = useState([]);
    const [selectedSaleId, setSelectedSaleId] = useState('');
    const [complaintInfo, setComplaintInfo] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchEligible = async () => {
            try {
                const res = await api.get('/customer/complaints/eligible');
                setEligibleSales(res.data);
                setLoading(false);
            } catch (err) {
                console.error("Error fetching eligible sales:", err);
                setLoading(false);
            }
        };
        fetchEligible();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/customer/complaints/add', {
                sale_id: selectedSaleId,
                complaint_info: complaintInfo
            });
            handleBack(); 
        } catch (err) {
            console.error("Error submitting complaint:", err);
            alert("Failed to submit complaint. Please try again.");
        }
    };

    if (loading) return <div className={styles.contentArea}><p>Loading purchases...</p></div>;

    return (
        <div className={styles.formContainer}>
            <h2>File a New Complaint</h2>
            
            {eligibleSales.length === 0 ? (
                <div style={{textAlign: 'center', padding: '20px'}}>
                    <p className={styles.errorMessage}>
                        You have no purchase history to complain about.
                    </p>
                    <button onClick={handleBack} className={styles.submitButton}>Go Back</button>
                </div>
            ) : (
                <form onSubmit={handleSubmit} className={styles.formWrapper}>
                    <div className={styles.formSection}>
                        <h3 className={styles.sectionTitle}>1. Select a Product</h3>
                        <div className={styles.fieldGroup}>
                            <div style={{ flex: '1 1 100%' }}>
                                <label className={styles.fieldLabel}>Choose Purchase</label>
                                <select 
                                    className={styles.fieldInput} 
                                    value={selectedSaleId} 
                                    onChange={(e) => setSelectedSaleId(e.target.value)}
                                    required
                                >
                                    <option value="">-- Select a Product --</option>
                                    {eligibleSales.map(sale => (
                                        <option key={sale.sale_id} value={sale.sale_id}>
                                            {sale.product_name} (ID: {sale.sale_id}) - {new Date(sale.sales_date).toLocaleDateString()}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className={styles.formSection}>
                        <h3 className={styles.sectionTitle}>2. Describe the Issue</h3>
                        <div className={styles.fieldGroup}>
                            <div style={{ flex: '1 1 100%' }}>
                                <label className={styles.fieldLabel}>Complaint Details</label>
                                <textarea
                                    className={styles.fieldTextarea}
                                    value={complaintInfo}
                                    onChange={(e) => setComplaintInfo(e.target.value)}
                                    placeholder="Please describe the problem in detail..."
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    <button type="submit" className={styles.submitButton} disabled={!selectedSaleId}>
                        Submit Complaint
                    </button>
                </form>
            )}
        </div>
    );
};

export default AddComplaint;