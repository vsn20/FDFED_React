import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../../../context/AuthContext';
import api from '../../../api/api';
import ManagerAddOrder from './ManagerAddOrder';
import styles from '../Employees/Details.module.css';

const ManagerOrdersPage = () => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();

    const [orders, setOrders] = useState([]);
    const [filteredOrders, setFilteredOrders] = useState([]);
    const [managerInfo, setManagerInfo] = useState(null);
    const [view, setView] = useState('list');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // NEW STATES
    const [searchQuery, setSearchQuery] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [ordersPerPage, setOrdersPerPage] = useState(5);
    const [rowsInput, setRowsInput] = useState("5");

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
            setFilteredOrders(res.data);
            setError('');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to fetch orders');
        } finally {
            setLoading(false);
        }
    };

    const fetchManagerProfile = async () => {
        try {
            const res = await api.get('/manager/employees/me');
            setManagerInfo(res.data);
        } catch (err) {}
    };

    // ------------ PREFIX SEARCH ------------
    useEffect(() => {
        let result = orders;

        if (searchQuery.trim() !== "") {
            const q = searchQuery.toLowerCase();

            result = orders.filter(o => {
                const id = o.order_id?.toLowerCase() || "";
                const product = o.product_name?.toLowerCase() || "";
                const company = o.company_name?.toLowerCase() || "";

                return (
                    id.startsWith(q) ||
                    product.startsWith(q) ||
                    company.startsWith(q)
                );
            });
        }

        setFilteredOrders(result);
        setCurrentPage(1);
    }, [searchQuery, orders]);


    // ---------- PAGINATION ----------
    const last = currentPage * ordersPerPage;
    const first = last - ordersPerPage;
    const currentOrders = filteredOrders.slice(first, last);
    const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);


    const handleRowsChange = (e) => {
        const val = e.target.value;
        setRowsInput(val);
        if (val !== "" && !isNaN(val) && parseInt(val) > 0) {
            setOrdersPerPage(parseInt(val));
            setCurrentPage(1);
        }
    };

    const handleRowClick = (order_id) => navigate(`/manager/orders/${order_id}`);

    if (!user || user.role !== 'manager') {
        return (
            <div className={styles.container}>
                <div className={styles.contentArea}>
                    <h1>Access Denied</h1>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <div className={styles.contentArea}>
                <h1>Orders ({managerInfo?.branch_name || 'Your Branch'})</h1>
                
                {view === 'add' && (
                    <ManagerAddOrder handleBack={() => setView('list')} managerInfo={managerInfo} />
                )}

                {view === 'list' && (
                    <>
                        <div className={styles.headerContainer}>
                            <button className={styles.addButton} onClick={() => setView('add')}>
                                Add Order
                            </button>
                        </div>

                        {/* SEARCH */}
                        <input
                            type="text"
                            placeholder="Search Order ID, Product, Company..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            style={{ marginBottom: "10px", padding: "8px", width: "50%" }}
                        />

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
                                        {currentOrders.map((order) => (
                                            <tr key={order._id} className={styles.tr} onClick={() => handleRowClick(order.order_id)}>
                                                <td className={styles.td}>{order.order_id}</td>
                                                <td className={styles.td}>{order.product_name}</td>
                                                <td className={styles.td}>{order.company_name}</td>
                                                <td className={styles.td}>{order.quantity}</td>
                                                <td className={styles.td}>{order.status}</td>
                                                <td className={styles.td}>{new Date(order.ordered_date).toLocaleDateString()}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                {orders.length === 0 && <p>No orders found for your branch.</p>}
                            </div>
                        )}

                        {/* PAGINATION */}
                        {filteredOrders.length > 0 && (
                            <div className={styles.paginationControls}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    Rows per page:
                                    <input
                                        type="number"
                                        min="1"
                                        value={rowsInput}
                                        onChange={handleRowsChange}
                                        style={{ width: "60px", marginLeft: "10px" }}
                                    />
                                </div>

                                <div>
                                    <button className={styles.pageButton} onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} disabled={currentPage === 1}>
                                        Prev
                                    </button>

                                    <span style={{ margin: "0 12px" }}>
                                        Page {currentPage} of {totalPages}
                                    </span>

                                    <button className={styles.pageButton} onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages}>
                                        Next
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default ManagerOrdersPage;
