import React, { useEffect, useState } from 'react';
import api from '../../../api/api';
import styles from './Sales.module.css'; // Import Module

const SaleDetails = ({ saleId, onBack }) => {
    const [sale, setSale] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSaleDetails = async () => {
            try {
                const response = await api.get(`/owner/sales/${saleId}`);
                setSale(response.data);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching sale details:", error);
                setLoading(false);
            }
        };

        if (saleId) fetchSaleDetails();
    }, [saleId]);

    if (loading) return <div className={styles.contentArea}><p>Loading details...</p></div>;
    if (!sale) return <div className={styles.contentArea}><p>Sale not found</p></div>;

    return (
        <div className={styles.container}>
            <div className={`${styles.contentArea} ${styles.detailViewContainer}`}>
                <button className={styles.backBtn} onClick={onBack}>
                    ← Back to Sales
                </button>
                
                <h2 style={{textAlign: 'left', marginBottom: '10px'}}>Sale Details: {sale.sales_id}</h2>

                <div className={styles.detailSection}>
                    <h3 className={styles.detailSectionTitle}>Sale Information</h3>
                    <div className={styles.formRow}>
                        <div className={styles.formGroup}>
                            <label>Sale ID</label>
                            <input type="text" value={sale.sales_id} readOnly />
                        </div>
                        <div className={styles.formGroup}>
                            <label>Unique Code</label>
                            <input type="text" value={sale.unique_code} readOnly />
                        </div>
                        <div className={styles.formGroup}>
                            <label>Sale Date</label>
                            <input type="text" value={new Date(sale.sales_date).toLocaleDateString()} readOnly />
                        </div>
                    </div>

                    <div className={styles.formRow}>
                        <div className={styles.formGroup}>
                            <label>Branch Name</label>
                            <input type="text" value={sale.branch_name} readOnly />
                        </div>
                        <div className={styles.formGroup}>
                            <label>Salesman Name</label>
                            <input type="text" value={sale.salesman_name} readOnly />
                        </div>
                        <div className={styles.formGroup}>
                            <label>Customer Name</label>
                            <input type="text" value={sale.customer_name} readOnly />
                        </div>
                    </div>

                    <h3 className={styles.detailSectionTitle}>Product Information</h3>
                    <div className={styles.formRow}>
                        <div className={styles.formGroup}>
                            <label>Product Name</label>
                            <input type="text" value={sale.product_name} readOnly />
                        </div>
                        <div className={styles.formGroup}>
                            <label>Model Number</label>
                            <input type="text" value={sale.model_number} readOnly />
                        </div>
                        <div className={styles.formGroup}>
                            <label>Company Name</label>
                            <input type="text" value={sale.company_name} readOnly />
                        </div>
                    </div>

                    <h3 className={styles.detailSectionTitle}>Transaction Details</h3>
                    <div className={styles.formRow}>
                        <div className={styles.formGroup}>
                            <label>Purchased Price</label>
                            <input type="text" value={`$${sale.purchased_price?.toFixed(2)}`} readOnly />
                        </div>
                        <div className={styles.formGroup}>
                            <label>Sold Price</label>
                            <input type="text" value={`$${sale.sold_price?.toFixed(2)}`} readOnly />
                        </div>
                        <div className={styles.formGroup}>
                            <label>Quantity</label>
                            <input type="text" value={sale.quantity} readOnly />
                        </div>
                    </div>

                    <div className={styles.formRow}>
                        <div className={styles.formGroup}>
                            <label>Total Amount</label>
                            <input type="text" value={`₹${sale.amount?.toFixed(2)}`} readOnly />
                        </div>
                        <div className={styles.formGroup}>
                            <label>Profit/Loss</label>
                            <input 
                                type="text" 
                                value={`₹${sale.profit_or_loss?.toFixed(2)}`} 
                                style={{ color: sale.profit_or_loss >= 0 ? '#27ae60' : '#c0392b', fontWeight: 'bold' }}
                                readOnly 
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SaleDetails;