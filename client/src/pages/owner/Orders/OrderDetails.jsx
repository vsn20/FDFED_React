import React, { useState, useEffect } from 'react';
import api from '../../../api/api';

const OrderDetails = ({ orderId, onBack }) => {
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDetails = async () => {
            try {
                const res = await api.get(`/owner/orders/${orderId}`);
                setOrder(res.data);
                setLoading(false);
            } catch (err) {
                console.error("Error fetching order details", err);
                setLoading(false);
            }
        };
        fetchDetails();
    }, [orderId]);

    if (loading) return <div className="content-area">Loading order details...</div>;
    if (!order) return <div className="content-area">Order not found.</div>;

    return (
        <div className="content-area">
            <div className="page-header">
                <h2>Order Details</h2>
                <button onClick={onBack} className="btn-reset">
                    ← Back to Orders
                </button>
            </div>

            <h3 className="section-title">Order Information</h3>
            <div className="form-row">
                <div className="form-group">
                    <label>Order ID</label>
                    <input type="text" value={order.order_id} readOnly />
                </div>
                <div className="form-group">
                    <label>Ordered Date</label>
                    <input type="text" value={new Date(order.ordered_date).toLocaleDateString()} readOnly />
                </div>
                <div className="form-group">
                    <label>Current Status</label>
                    <input type="text" value={order.status} readOnly style={{textTransform:'capitalize'}} />
                </div>
            </div>

            <h3 className="section-title">Branch & Company</h3>
            <div className="form-row">
                <div className="form-group">
                    <label>Branch Name</label>
                    <input type="text" value={order.branch_name} readOnly />
                </div>
                <div className="form-group">
                    <label>Branch ID</label>
                    <input type="text" value={order.branch_id} readOnly />
                </div>
                <div className="form-group">
                    <label>Company Name</label>
                    <input type="text" value={order.company_name} readOnly />
                </div>
            </div>

            <h3 className="section-title">Product Details</h3>
            <div className="form-row">
                <div className="form-group">
                    <label>Product Name</label>
                    <input type="text" value={order.product_name} readOnly />
                </div>
                <div className="form-group">
                    <label>Product ID</label>
                    <input type="text" value={order.product_id} readOnly />
                </div>
                <div className="form-group">
                    <label>Quantity</label>
                    <input type="text" value={order.quantity} readOnly />
                </div>
            </div>

            <h3 className="section-title">Fulfillment</h3>
            <div className="form-row">
                <div className="form-group">
                    <label>Delivery Date</label>
                    <input 
                        type="text" 
                        value={order.delivery_date ? new Date(order.delivery_date).toLocaleDateString() : 'Not Scheduled'} 
                        readOnly 
                    />
                </div>
                <div className="form-group">
                    <label>Installation Type</label>
                    <input type="text" value={order.installation_type} readOnly />
                </div>
            </div>
        </div>
    );
};

export default OrderDetails;