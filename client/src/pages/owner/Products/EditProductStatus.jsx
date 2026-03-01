import React, { useState, useEffect } from 'react';
import api from '../../../api/api';
import styles from './Products.module.css';

const EditProductStatus = ({ prod_id, onBack }) => {
    const [product, setProduct] = useState(null);
    const [status, setStatus] = useState('Hold');
    const [rejectionReason, setRejectionReason] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        const fetchProduct = async () => {
            if (!prod_id) return;
            try {
                setLoading(true);
                const res = await api.get(`/owner/products/${prod_id}`);
                setProduct(res.data);
                setStatus(res.data.Status);
                setError('');
            } catch (err) {
                console.error("Error fetching product:", err);
                setError('Failed to fetch product.');
            } finally {
                setLoading(false);
            }
        };
        fetchProduct();
    }, [prod_id]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        // Validate rejection reason
        if (status === 'Rejected' && !rejectionReason.trim()) {
            setError('Please provide a reason for rejection.');
            return;
        }

        try {
            const payload = { status };
            if (status === 'Rejected') {
                payload.rejection_reason = rejectionReason.trim();
            }
            await api.put(`/owner/products/${prod_id}/status`, payload);
            setSuccess('Product status updated successfully!');
            // Automatically go back after a short delay
            setTimeout(() => {
                onBack();
            }, 1500);
        } catch (err) {
            console.error("Error updating status:", err);
            setError(err.response?.data?.error || 'Failed to update status.');
        }
    };

    if (loading) return <p>Loading product for editing...</p>;
    if (!product) return <p className={styles.errorMessage}>{error || 'Product not found.'}</p>;

    return (
        <form className={styles.formSection} onSubmit={handleSubmit}>
            <legend className={styles.sectionTitle}>Edit Product Status</legend>
            <div className={styles.fieldGroup}>
                <div>
                    <label className={styles.fieldLabel}>Product ID</label>
                    <input type="text" value={product.prod_id} className={styles.fieldInput} disabled />
                </div>
                <div>
                    <label className={styles.fieldLabel}>Product Name</label>
                    <input type="text" value={product.Prod_name} className={styles.fieldInput} disabled />
                </div>
                <div>
                    <label className={styles.fieldLabel}>Current Status</label>
                    <input type="text" value={product.Status} className={styles.fieldInput} disabled />
                </div>
                <div>
                    <label htmlFor="status" className={styles.fieldLabel}>New Status</label>
                    <select 
                        id="status" 
                        value={status} 
                        onChange={(e) => setStatus(e.target.value)} 
                        className={styles.fieldSelect}
                        required
                    >
                        <option value="Hold">Hold (Move to New)</option>
                        <option value="Accepted">Accepted (Move to Products)</option>
                        <option value="Rejected">Rejected (Move to Rejected)</option>
                    </select>
                </div>
            </div>

            {status === 'Rejected' && (
                <div style={{ marginTop: '15px' }}>
                    <label className={styles.fieldLabel}>Reason for Rejection *</label>
                    <textarea
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                        placeholder="Enter the reason why this product is being rejected..."
                        className={styles.fieldInput}
                        rows="4"
                        style={{ resize: 'vertical', minHeight: '80px' }}
                        required
                    />
                    <p style={{ fontSize: '0.8rem', color: '#888', marginTop: '5px' }}>
                        This reason will be emailed to the company ({product.com_name}).
                    </p>
                </div>
            )}

            <button type="submit" className={styles.formButton}>Update Status</button>
            {error && <p className={styles.errorMessage}>{error}</p>}
            {success && <p style={{ color: 'green', marginTop: '15px' }}>{success}</p>}
        </form>
    );
};

export default EditProductStatus;