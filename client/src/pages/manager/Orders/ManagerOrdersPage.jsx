import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../../../context/AuthContext';
import api from '../../../api/api';
import ManagerAddOrder from './ManagerAddOrder'; // We will create this
import styles from '../Employees/Details.module.css'; // Reusing styles

const ManagerOrdersPage = () => {
    const { user } = useContext(AuthContext);
    const [orders, setOrders] = useState([]);
    const [managerInfo, setManagerInfo] = useState(null);
    const [view, setView] = useState('list'); // 'list' or 'add'
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        if (view === 'list') {
            fetchOrders();
            fetchManagerProfile();
        }
    }, [view]);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const res = await api.get('/manager/orders');
            setOrders(res.data);
            setError('');
        } catch (err) {
            console.error("Error fetching orders:", err);
            setError(err.response?.data?.message || 'Failed to fetch orders');
        } finally {
            setLoading(false);
        }
    };

    const fetchManagerProfile = async () => {
        try {
            const res = await api.get('/manager/employees/me'); // Get manager's branch info
            setManagerInfo(res.data);
        } catch (err) {
            console.error("Error fetching manager profile:", err);
        }
    };

    const handleBackFromAdd = () => {
        setView('list'); // Go back to the list view
        // fetchOrders(); // Already handled by useEffect on [view] change
    };

    const handleRowClick = (order_id) => {
        navigate(`/manager/orders/${order_id}`);
    };

    if (!user || user.role !== 'manager') {
        return <div className={styles.container}><div className={styles.contentArea}><h1>Access Denied</h1></div></div>;
    }

    return (
        <div className={styles.container}>
            <div className={styles.contentArea}>
                <h1>Orders ({managerInfo?.branch_name || 'Your Branch'})</h1>
                
                {/* Add Order Form View */}
                {view === 'add' && (
                    <ManagerAddOrder handleBack={handleBackFromAdd} managerInfo={managerInfo} />
                )}

                {/* Orders List View */}
                {view === 'list' && (
                    <>
                        <div className={styles.headerContainer}>
                            <button className={styles.addButton} onClick={() => setView('add')}>Add Order</button>
                        </div>
                        
                        {loading && <p>Loading orders...</p>}
                        {error && <p className={styles.errorMessage}>{error}</p>}
                        
                        {!loading && !error && (
                            <div className={styles.tableWrapper}>
                                <table className={styles.table}>
                                    <thead className={styles.thead}>
                                        <tr>
                                            <th className={styles.th}>Order ID</th>
                                            <th className={styles.th}>Product</th>
                                            <th className={styles.th}>Company</th>
                                            <th className={styles.th}>Quantity</th>
                                            <th className={styles.th}>Status</th>
                                            <th className={styles.th}>Ordered Date</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {orders.map((order) => (
                                            <tr key={order._id} className={styles.tr} onClick={() => handleRowClick(order.order_id)}>
                                                <td className={styles.td} data-label="Order ID">{order.order_id}</td>
                                                <td className={styles.td} data-label="Product">{order.product_name}</td>
                                                <td className={styles.td} data-label="Company">{order.company_name}</td>
                                                <td className={styles.td} data-label="Quantity">{order.quantity}</td>
                                                <td className={styles.td} data-label="Status">{order.status}</td>
                                                <td className={styles.td} data-label="Ordered Date">
                                                    {new Date(order.ordered_date).toLocaleDateString()}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                {orders.length === 0 && <p>No orders found for your branch.</p>}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default ManagerOrdersPage;