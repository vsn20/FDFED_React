import React, { useState, useEffect, useContext, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../../../context/AuthContext';
import api from '../../../api/api';
import ManagerAddOrder from './ManagerAddOrder';
import styles from '../Employees/Details.module.css';

const LOW_STOCK_THRESHOLD = 10;

const ManagerOrdersPage = () => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();

    const [orders, setOrders] = useState([]);
    const [filteredOrders, setFilteredOrders] = useState([]);
    const [managerInfo, setManagerInfo] = useState(null);
    const [view, setView] = useState('list');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [lowStockItems, setLowStockItems] = useState([]);

    // NEW STATES
    const [searchQuery, setSearchQuery] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [ordersPerPage, setOrdersPerPage] = useState(5);
    const [rowsInput, setRowsInput] = useState("5");

    const fetchLowStockItems = useCallback(async () => {
        try {
            const res = await api.get('/manager/inventory');
            const allItems = res.data.data || [];
            setLowStockItems(allItems.filter(item => item.quantity < LOW_STOCK_THRESHOLD));
        } catch (err) {
            console.error('Error fetching low stock data:', err);
        }
    }, []);

    useEffect(() => {
        if (view === 'list') {
            fetchOrders();
            fetchManagerProfile();
            fetchLowStockItems();
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
                        {/* LOW STOCK ALERT BANNER */}
                        {lowStockItems.length > 0 && (
                            <div className={styles.lowStockBanner}>
                                <div className={styles.lowStockBannerContent}>
                                    <span className={styles.lowStockIcon}>⚠️</span>
                                    <div>
                                        <strong>Low Stock Alert!</strong>
                                        <span> {lowStockItems.length} product{lowStockItems.length > 1 ? 's' : ''} below {LOW_STOCK_THRESHOLD} units — consider placing orders:</span>
                                        <span className={styles.lowStockNames}>
                                            {lowStockItems.map(i => `${i.product_name} (${i.quantity})`).join(', ')}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className={styles.headerContainer}>
                            <button className={styles.addButton} onClick={() => setView('add')}>
                                Add Order
                            </button>
                        </div>

                        {/* SEARCH */}
                        <div className={styles.searchRow}>
                            <input
                                type="text"
                                placeholder="Search Order ID, Product, Company..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className={styles.searchInput}
                                style={{ width: '320px' }}
                            />
                        </div>

                        {loading && (
                            <div className={styles.loadingGrid}>
                                {[...Array(6)].map((_, i) => (
                                    <div key={i} className={styles.skeletonCard} style={{ animationDelay: `${i * 0.07}s` }} />
                                ))}
                            </div>
                        )}
                        {error && <p className={styles.errorMessage}>{error}</p>}

                        {!loading && !error && (
                            <>
                                {currentOrders.length === 0 ? (
                                    <div className={styles.emptyState}>
                                        <div className={styles.emptyIcon}>📋</div>
                                        <p>{orders.length === 0 ? 'No orders found for your branch.' : 'No orders match your search.'}</p>
                                    </div>
                                ) : (
                                    <div className={styles.cardGrid}>
                                        {currentOrders.map((order, idx) => {
                                            const st = (order.status || '').toLowerCase();
                                            const statusAccent =
                                                st === 'pending'   ? 'linear-gradient(90deg,#3b82f6,#93c5fd)' :
                                                st === 'delivered' ? 'linear-gradient(90deg,#059669,#34d399)' :
                                                st === 'cancelled' ? 'linear-gradient(90deg,#dc2626,#f87171)' :
                                                st === 'approved'  ? 'linear-gradient(90deg,#0891b2,#22d3ee)' :
                                                                     'linear-gradient(90deg,#6b7280,#9ca3af)';

                                            const statusClass =
                                                st === 'pending'   ? styles.orderStatusPending   :
                                                st === 'delivered' ? styles.orderStatusDelivered :
                                                st === 'cancelled' ? styles.orderStatusCancelled :
                                                st === 'approved'  ? styles.orderStatusApproved  :
                                                                     styles.orderStatusDefault;

                                            const avatarColors = [
                                                ['#3b82f6','#93c5fd'], ['#7c3aed','#a78bfa'],
                                                ['#059669','#34d399'], ['#d97706','#fbbf24'],
                                                ['#0891b2','#22d3ee'], ['#dc2626','#f87171'],
                                            ];
                                            const [c1, c2] = avatarColors[(order.product_name?.charCodeAt(0) || 0) % avatarColors.length];
                                            const initial = (order.product_name?.[0] || 'O').toUpperCase();

                                            return (
                                                <div
                                                    key={order._id}
                                                    className={styles.empCard}
                                                    style={{ animationDelay: `${idx * 0.05}s`, cursor: 'pointer' }}
                                                    onClick={() => handleRowClick(order.order_id)}
                                                >
                                                    <div className={styles.cardAccent} style={{ background: statusAccent }} />

                                                    <div className={styles.cardHeader}>
                                                        <div className={styles.avatar} style={{ background: `linear-gradient(135deg,${c1},${c2})` }}>
                                                            {initial}
                                                        </div>
                                                        <div className={styles.cardMeta}>
                                                            <div className={styles.cardName}>{order.product_name}</div>
                                                            <div className={styles.cardRole}>{order.company_name}</div>
                                                        </div>
                                                        <span className={statusClass}>
                                                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                                        </span>
                                                    </div>

                                                    <div className={styles.cardId}>
                                                        <span className={styles.cardIdLabel}>ORDER</span>
                                                        <span className={styles.cardIdValue}>{order.order_id}</span>
                                                    </div>

                                                    <div className={styles.cardStats}>
                                                        <div className={styles.cardStat}>
                                                            <div className={styles.cardStatVal}>{order.quantity}</div>
                                                            <div className={styles.cardStatLabel}>Units</div>
                                                        </div>
                                                        <div className={styles.cardStatDivider} />
                                                        <div className={styles.cardStat}>
                                                            <div className={styles.cardStatVal}>
                                                                {new Date(order.ordered_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                                                            </div>
                                                            <div className={styles.cardStatLabel}>Ordered</div>
                                                        </div>
                                                    </div>

                                                    <div className={styles.cardFooter}>
                                                        <span className={styles.viewDetails}>View Details →</span>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </>
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
                                        className={styles.rowsInput}
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