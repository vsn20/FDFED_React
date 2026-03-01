// src/pages/manager/ManagerInventoryPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import api from '../../../api/api';
import styles from './ManagerInventory.module.css'; // ⬅ using SAME CSS as employees

const LOW_STOCK_THRESHOLD = 10;

const ManagerInventoryPage = () => {
    const [fullInventory, setFullInventory] = useState([]);
    const [filteredInventory, setFilteredInventory] = useState([]);
    const [branchName, setBranchName] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [showLowStockOnly, setShowLowStockOnly] = useState(false);

    // PAGINATION
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsInput, setRowsInput] = useState("5");
    const [rowsPerPage, setRowsPerPage] = useState(5);

    const fetchInventory = useCallback(async () => {
        setLoading(true);
        setError('');

        try {
            const res = await api.get('/manager/inventory');
            setFullInventory(res.data.data);
            setFilteredInventory(res.data.data);
            setBranchName(res.data.branchName);
        } catch (err) {
            console.error("Error fetching inventory:", err);
            setError(err.response?.data?.message || 'Failed to fetch inventory.');
            setFullInventory([]);
            setFilteredInventory([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchInventory();
    }, [fetchInventory]);

    // Compute low stock items
    const lowStockItems = fullInventory.filter(item => item.quantity < LOW_STOCK_THRESHOLD);

    // SEARCH FILTER (Product ID, Name, Company) + Low Stock Filter
    useEffect(() => {
        const q = searchQuery.toLowerCase();

        let result = fullInventory.filter(item => {
            const matchesSearch =
                item.product_id?.toLowerCase().includes(q) ||
                item.product_name?.toLowerCase().includes(q) ||
                item.company_name?.toLowerCase().includes(q);

            const matchesLowStock = showLowStockOnly ? item.quantity < LOW_STOCK_THRESHOLD : true;

            return matchesSearch && matchesLowStock;
        });

        setFilteredInventory(result);
        setCurrentPage(1);
    }, [searchQuery, fullInventory, showLowStockOnly]);

    // PAGINATION CALCULATIONS
    const indexOfLast = currentPage * rowsPerPage;
    const indexOfFirst = indexOfLast - rowsPerPage;
    const currentItems = filteredInventory.slice(indexOfFirst, indexOfLast);
    const totalPages = Math.ceil(filteredInventory.length / rowsPerPage);

    // Handle rows input change
    const handleRowsChange = (e) => {
        const val = e.target.value;
        setRowsInput(val);

        if (val !== '' && !isNaN(val) && parseInt(val) > 0) {
            setRowsPerPage(parseInt(val));
            setCurrentPage(1);
        }
    };

    if (loading) {
        return <div className={styles.loading}>Loading inventory...</div>;
    }

    return (
        <div className={styles.container}>
            <div className={styles.contentArea}>
                <h1>Inventory ({branchName})</h1>

                {error && <div className={styles.errorMessage}>{error}</div>}

                {/* LOW STOCK ALERT BANNER */}
                {lowStockItems.length > 0 && (
                    <div className={styles.lowStockBanner}>
                        <div className={styles.lowStockBannerContent}>
                            <span className={styles.lowStockIcon}>⚠️</span>
                            <div>
                                <strong>Low Stock Alert!</strong>
                                <span> {lowStockItems.length} product{lowStockItems.length > 1 ? 's' : ''} below {LOW_STOCK_THRESHOLD} units:</span>
                                <span className={styles.lowStockNames}>
                                    {lowStockItems.map(i => `${i.product_name} (${i.quantity})`).join(', ')}
                                </span>
                            </div>
                        </div>
                        <button
                            className={styles.lowStockFilterBtn}
                            onClick={() => setShowLowStockOnly(prev => !prev)}
                        >
                            {showLowStockOnly ? 'Show All' : 'Show Low Stock Only'}
                        </button>
                    </div>
                )}

                <div>

                    {/* SEARCH BAR */}
                    <div className={styles.searchRow}>
                        <input
                            type="text"
                            placeholder="Search Product ID, Name, Company..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className={styles.searchInput}
                        />
                    </div>

                    {/* INVENTORY CARD GRID */}
                    {currentItems.length === 0 ? (
                        <div className={styles.emptyState}>No inventory found.</div>
                    ) : (
                        <div className={styles.invCardGrid}>
                            {currentItems.map((item, idx) => {
                                const isOut = item.quantity === 0;
                                const isLow = !isOut && item.quantity < LOW_STOCK_THRESHOLD;
                                const isHealthy = !isOut && !isLow;

                                const accentGradient = isOut
                                    ? 'linear-gradient(90deg,#dc2626,#f87171)'
                                    : isLow
                                    ? 'linear-gradient(90deg,#d97706,#fbbf24)'
                                    : 'linear-gradient(90deg,#059669,#34d399)';

                                const avatarGradient = isOut
                                    ? 'linear-gradient(135deg,#dc2626,#f87171)'
                                    : isLow
                                    ? 'linear-gradient(135deg,#d97706,#fbbf24)'
                                    : 'linear-gradient(135deg,#059669,#34d399)';

                                const stockPct = isOut ? 0 : Math.min(100, Math.max(6, (item.quantity / 50) * 100));
                                const initial = (item.product_name?.[0] || '?').toUpperCase();

                                return (
                                    <div
                                        key={item._id}
                                        className={styles.invCard}
                                        style={{ animationDelay: `${idx * 0.045}s` }}
                                    >
                                        {/* Status accent stripe */}
                                        <div className={styles.invCardAccent} style={{ background: accentGradient }} />

                                        <div className={styles.invCardBody}>
                                            {/* Header: avatar + name + company */}
                                            <div className={styles.invCardHeader}>
                                                <div className={styles.invAvatar} style={{ background: avatarGradient }}>
                                                    {initial}
                                                </div>
                                                <div className={styles.invMeta}>
                                                    <div className={styles.invProductName}>{item.product_name}</div>
                                                    <div className={styles.invCompany}>{item.company_name}</div>
                                                </div>
                                            </div>

                                            {/* Model + ID row */}
                                            <div className={styles.invModelRow}>
                                                <span className={styles.invModelLabel}>MODEL</span>
                                                <span className={styles.invModelValue}>{item.model_no || '—'}</span>
                                                <span className={styles.invIdBadge}>#{item.product_id}</span>
                                            </div>

                                            {/* Stock meter */}
                                            <div className={styles.invStockSection}>
                                                <div className={styles.invStockRow}>
                                                    <span className={styles.invStockLabel}>STOCK LEVEL</span>
                                                    <span className={`${styles.invStockValue} ${isLow ? styles.invStockLow : ''} ${isOut ? styles.invStockOut : ''}`}>
                                                        {item.quantity}
                                                        {isLow && <span className={styles.invLowBadge}>LOW</span>}
                                                        {isOut && <span className={styles.invOutBadge}>OUT</span>}
                                                    </span>
                                                </div>
                                                <div className={styles.invMeterTrack}>
                                                    <div
                                                        className={styles.invMeterFill}
                                                        style={{ width: `${stockPct}%`, background: accentGradient }}
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Footer */}
                                        <div className={styles.invCardFooter}>
                                            <span className={styles.invUpdatedLabel}>Last updated</span>
                                            <span className={styles.invUpdatedDate}>
                                                {new Date(item.updatedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {/* PAGINATION CONTROLS */}
                    {filteredInventory.length > 0 && (
                        <div className={styles.paginationControls}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <span>Rows per page:</span>
                                <input
                                    type="number"
                                    min="1"
                                    value={rowsInput}
                                    onChange={handleRowsChange}
                                    className={styles.rowsInput}
                                />
                            </div>

                            <div>
                                <button
                                    className={styles.pageButton}
                                    onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                                    disabled={currentPage === 1}
                                >
                                    Previous
                                </button>

                                <span style={{ margin: '0 10px' }}>
                                    Page {currentPage} of {totalPages}
                                </span>

                                <button
                                    className={styles.pageButton}
                                    onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                                    disabled={currentPage === totalPages}
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
};

export default ManagerInventoryPage;