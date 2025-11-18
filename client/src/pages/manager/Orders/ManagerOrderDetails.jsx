import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../../api/api';
import styles from '../Employees/Details.module.css'; // Reusing styles

const ManagerOrderDetails = () => {
    const { id } = useParams(); // This is the order_id
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);
    
    const [notFound, setNotFound] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const fetchOrder = async () => {
        setIsSubmitting(false);
        setSuccessMessage('');
        setErrorMessage('');
        try {
            const res = await api.get(`/manager/orders/${id}`);
            setOrder(res.data);
            setNotFound(false);
        } catch (err) {
            console.error("Error fetching order details:", err);
            setNotFound(true);
            setErrorMessage(err.response?.data?.message || "Failed to load order details");
        }
    };

    useEffect(() => {
        fetchOrder();
    }, [id]);

    // NEW: Handle "Cancel Order" button click
    const handleCancelOrder = async () => {
        if (window.confirm("Are you sure you want to cancel this order? This cannot be undone.")) {
            setIsSubmitting(true);
            try {
                const updateData = {
                    status: "cancelled", // Hardcode the new status
                };
                const res = await api.put(`/manager/orders/${id}`, updateData);
                setSuccessMessage(res.data.message || 'Order updated successfully');
                setErrorMessage('');
                
                // Refetch to get updated data (status will now be 'cancelled')
                fetchOrder(); 
                
            } catch (err) {
                console.error("Error cancelling order:", err);
                setErrorMessage(err.response?.data?.message || "Failed to cancel order");
                setSuccessMessage('');
                setIsSubmitting(false); // Only set to false on error, so button stays hidden on success
            }
        }
    };

    if (notFound) {
        return <div className={styles.container}><div className={styles.contentArea}><h1 className={styles.errorMessage}>Order not found.</h1></div></div>;
    }

    if (!order) {
        return <div className={styles.container}><div className={styles.contentArea}><h1>Loading...</h1></div></div>;
    }

    // Check if the order can be cancelled
    const isCancellable = order.status.toLowerCase() === 'pending';

    return (
        <div className={styles.container}>
            <div className={styles.contentArea}>
                <h1>Order Details: {order.order_id}</h1>
                {successMessage && <p className={styles.successMessage}>{successMessage}</p>}
                {errorMessage && <p className={styles.errorMessage}>{errorMessage}</p>}
                
                {/* Form is no longer needed for submission, just display */}
                <div className={styles.formContainer}>
                    <div className={styles.formWrapper}>
                        <div className={styles.formSection}>
                            <h2 className={styles.sectionTitle}>Order Information</h2>
                            <div className={styles.fieldGroup}>
                                {/* ... (all other input fields like Order ID, Branch, etc. are unchanged) ... */}
                                <div>
                                    <label className={styles.fieldLabel}>Order ID</label>
                                    <input className={`${styles.fieldInput} ${styles.disabledField}`} type="text" value={order.order_id} disabled />
                                </div>
                                <div>
                                    <label className={styles.fieldLabel}>Branch</label>
                                    <input className={`${styles.fieldInput} ${styles.disabledField}`} type="text" value={order.branch_name} disabled />
                                </div>
                                <div>
                                    <label className={styles.fieldLabel}>Company</label>
                                    <input className={`${styles.fieldInput} ${styles.disabledField}`} type="text" value={order.company_name} disabled />
                                </div>
                                <div>
                                    <label className={styles.fieldLabel}>Product</label>
                                    <input className={`${styles.fieldInput} ${styles.disabledField}`} type="text" value={order.product_name} disabled />
                                </div>
                                 <div>
                                    <label className={styles.fieldLabel}>Quantity</label>
                                    <input className={`${styles.fieldInput} ${styles.disabledField}`} type="number" value={order.quantity} disabled />
                                </div>
                                <div>
                                    <label className={styles.fieldLabel}>Ordered Date</label>
                                    <input 
                                        className={`${styles.fieldInput} ${styles.disabledField}`} 
                                        type="text" 
                                        value={new Date(order.ordered_date).toLocaleDateString()} 
                                        disabled 
                                    />
                                </div>
                                <div>
                                    <label className={styles.fieldLabel}>Expected Delivery</label>
                                    <input 
                                        className={`${styles.fieldInput} ${styles.disabledField}`} 
                                        type="text" 
                                        value={order.delivery_date ? new Date(order.delivery_date).toLocaleDateString() : 'N/A'} 
                                        disabled 
                                    />
                                </div>
                                <div>
                                    {/* --- MODIFIED STATUS FIELD --- */}
                                    <label className={styles.fieldLabel}>Status</label>
                                    <input
                                        className={`${styles.fieldInput} ${styles.disabledField}`}
                                        type="text"
                                        value={order.status.charAt(0).toUpperCase() + order.status.slice(1)} // Capitalized
                                        disabled
                                    />
                                    {/* --- END MODIFIED STATUS FIELD --- */}
                                </div>
                            </div>
                        </div>

                        {/* --- MODIFIED BUTTONS --- */}
                        {isCancellable && (
                            <button 
                                type="button" 
                                className={styles.submitButton} // You might want a different style for 'cancel'
                                onClick={handleCancelOrder}
                                disabled={isSubmitting}
                                style={{ backgroundColor: '#e74c3c' }} // Example: Make cancel button red
                            >
                                {isSubmitting ? 'Cancelling...' : 'Cancel Order'}
                            </button>
                        )}
                        <button type="button" className={styles.backButton} onClick={() => navigate('/manager/orders')}>
                            Back to List
                        </button>
                        {/* --- END MODIFIED BUTTONS --- */}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ManagerOrderDetails;