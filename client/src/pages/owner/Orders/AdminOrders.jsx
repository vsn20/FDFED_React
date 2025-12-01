import React, { useState, useEffect } from 'react';
import api from '../../../api/api';
import OrderList from './OrderList';
import OrderDetails from './OrderDetails';
import './AdminOrders.css';

const AdminOrders = () => {
    const [viewMode, setViewMode] = useState('list'); // 'list' or 'details'
    const [selectedOrderId, setSelectedOrderId] = useState(null);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    // Fetch orders on mount
    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            const res = await api.get('/owner/orders');
            setOrders(res.data);
            setLoading(false);
        } catch (err) {
            console.error("Error fetching orders:", err);
            setLoading(false);
        }
    };

    const handleOrderClick = (orderId) => {
        setSelectedOrderId(orderId);
        setViewMode('details');
    };

    const handleBack = () => {
        setSelectedOrderId(null);
        setViewMode('list');
    };

    return (
        <div className="admin-orders-container">
            {viewMode === 'list' && (
                <OrderList 
                    orders={orders} 
                    loading={loading} 
                    onOrderClick={handleOrderClick} 
                />
            )}
            
            {viewMode === 'details' && selectedOrderId && (
                <OrderDetails 
                    orderId={selectedOrderId} 
                    onBack={handleBack} 
                />
            )}
        </div>
    );
};

export default AdminOrders;