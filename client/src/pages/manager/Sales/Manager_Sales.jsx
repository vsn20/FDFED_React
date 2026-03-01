import React, { useState, useEffect } from 'react';
import api from '../../../api/api';
import AddSale from './AddSale';
import SaleDetails from './SaleDetails';
import './ManagerSales.css';

const avatarPalette = [
    ['#d97706','#fbbf24'], ['#0d6efd','#60a5fa'], ['#7c3aed','#a78bfa'],
    ['#059669','#34d399'], ['#dc2626','#f87171'], ['#0891b2','#22d3ee'],
    ['#db2777','#f9a8d4'], ['#ea580c','#fb923c'],
];

const getAvatarGradient = (name = '') => {
    const idx = (name.charCodeAt(0) || 0) % avatarPalette.length;
    return `linear-gradient(135deg, ${avatarPalette[idx][0]}, ${avatarPalette[idx][1]})`;
};

const getInitials = (name = '') => {
    const parts = name.trim().split(' ');
    return parts.length >= 2
        ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
        : (parts[0]?.[0] || 'S').toUpperCase();
};

const Manager_Sales = () => {
    const [sales, setSales]               = useState([]);
    const [viewMode, setViewMode]         = useState('list');
    const [selectedSaleId, setSelectedSaleId] = useState(null);
    const [searchQuery, setSearchQuery]   = useState('');
    const [filteredSales, setFilteredSales] = useState([]);
    const [currentPage, setCurrentPage]   = useState(1);
    const [salesPerPage, setSalesPerPage] = useState(9);
    const [rowsInput, setRowsInput]       = useState("9");

    useEffect(() => {
        if (viewMode === 'list') fetchSales();
    }, [viewMode]);

    const fetchSales = async () => {
        try {
            const res = await api.get('/manager/sales');
            setSales(res.data);
            setFilteredSales(res.data);
        } catch (err) {
            console.error("Error fetching sales:", err);
        }
    };

    useEffect(() => {
        let result = sales;
        if (searchQuery.trim() !== '') {
            const q = searchQuery.toLowerCase();
            result = sales.filter(s => {
                const id       = s.sales_id?.toLowerCase()       || '';
                const customer = s.customer_name?.toLowerCase()  || '';
                const code     = s.unique_code?.toLowerCase()    || '';
                return id.startsWith(q) || customer.startsWith(q) || code.startsWith(q);
            });
        }
        setFilteredSales(result);
        setCurrentPage(1);
    }, [searchQuery, sales]);

    const indexOfLast    = currentPage * salesPerPage;
    const indexOfFirst   = indexOfLast - salesPerPage;
    const currentSales   = filteredSales.slice(indexOfFirst, indexOfLast);
    const totalPages     = Math.ceil(filteredSales.length / salesPerPage);

    // Summary stats
    const totalRevenue   = filteredSales.reduce((a, s) => a + Number(s.amount || 0), 0);
    const todaySales     = filteredSales.filter(s => {
        const d = new Date(s.sales_date);
        const n = new Date();
        return d.toDateString() === n.toDateString();
    }).length;

    const handleRowClick  = (id) => { setSelectedSaleId(id); setViewMode('details'); };
    const handleBack      = () => { setViewMode('list'); setSelectedSaleId(null); };
    const handleRowsChange = (e) => {
        const val = e.target.value;
        setRowsInput(val);
        if (val !== '' && !isNaN(val) && parseInt(val) > 0) {
            setSalesPerPage(parseInt(val));
            setCurrentPage(1);
        }
    };

    return (
        <div className="manager-sales-container">
            {viewMode === 'list' && (
                <div className="content-area">
                    {/* Header */}
                    <div className="header-container">
                        <h2>Sales Management</h2>
                        <button className="submit-btn" onClick={() => setViewMode('add')}>
                            + Add New Sale
                        </button>
                    </div>

                    {/* Summary strip */}
                    <div className="sales-summary-strip">
                        <div className="sales-stat-card">
                            <span className="sales-stat-icon">🧾</span>
                            <div>
                                <div className="sales-stat-value">{filteredSales.length}</div>
                                <div className="sales-stat-label">Total Sales</div>
                            </div>
                        </div>
                        <div className="sales-stat-card">
                            <span className="sales-stat-icon">💰</span>
                            <div>
                                <div className="sales-stat-value">
                                    ₹{totalRevenue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                                </div>
                                <div className="sales-stat-label">Total Revenue</div>
                            </div>
                        </div>
                        <div className="sales-stat-card">
                            <span className="sales-stat-icon">📅</span>
                            <div>
                                <div className="sales-stat-value">{todaySales}</div>
                                <div className="sales-stat-label">Today's Sales</div>
                            </div>
                        </div>
                        <div className="sales-stat-card">
                            <span className="sales-stat-icon">⌀</span>
                            <div>
                                <div className="sales-stat-value">
                                    ₹{filteredSales.length > 0
                                        ? (totalRevenue / filteredSales.length).toLocaleString('en-IN', { maximumFractionDigits: 0 })
                                        : '0'}
                                </div>
                                <div className="sales-stat-label">Avg. Sale Value</div>
                            </div>
                        </div>
                    </div>

                    {/* Search */}
                    <div className="sales-search-row">
                        <div className="sales-search-wrap">
                            <svg className="sales-search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35" strokeLinecap="round"/>
                            </svg>
                            <input
                                type="text"
                                className="sales-search-input"
                                placeholder="Search by ID, Customer, or Code…"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Card grid */}
                    {filteredSales.length === 0 ? (
                        <div className="sales-empty-state">
                            <div className="sales-empty-icon">🔍</div>
                            <p>No sales match your search.</p>
                        </div>
                    ) : (
                        <div className="sales-card-grid">
                            {currentSales.map((sale, idx) => {
                                const profit = Number(sale.profit_or_loss || 0);
                                const isProfitable = profit >= 0;
                                const accentGradient = isProfitable
                                    ? 'linear-gradient(90deg,#059669,#34d399)'
                                    : 'linear-gradient(90deg,#dc2626,#f87171)';

                                return (
                                    <div
                                        key={sale._id}
                                        className="sale-card"
                                        style={{ animationDelay: `${idx * 0.04}s` }}
                                        onClick={() => handleRowClick(sale.sales_id)}
                                    >
                                        {/* Top accent bar */}
                                        <div className="sale-card-accent" style={{ background: accentGradient }} />

                                        <div className="sale-card-header">
                                            <div
                                                className="sale-avatar"
                                                style={{ background: getAvatarGradient(sale.product_name) }}
                                            >
                                                {getInitials(sale.product_name || 'Sale')}
                                            </div>
                                            <div className="sale-card-meta">
                                                <div className="sale-product-name">{sale.product_name}</div>
                                                <div className="sale-company-name">{sale.company_name || '—'}</div>
                                            </div>
                                            <span className={`sale-profit-badge ${isProfitable ? 'profit-pos' : 'profit-neg'}`}>
                                                {isProfitable ? '▲' : '▼'} ₹{Math.abs(profit).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                                            </span>
                                        </div>

                                        {/* Sale ID row */}
                                        <div className="sale-id-row">
                                            <span className="sale-id-label">SALE ID</span>
                                            <span className="sale-id-value">{sale.sales_id}</span>
                                            {sale.unique_code && (
                                                <span className="sale-code-badge">{sale.unique_code}</span>
                                            )}
                                        </div>

                                        {/* Stats row */}
                                        <div className="sale-stats-row">
                                            <div className="sale-stat">
                                                <div className="sale-stat-val">
                                                    ₹{Number(sale.amount || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                                                </div>
                                                <div className="sale-stat-lbl">Amount</div>
                                            </div>
                                            <div className="sale-stat-divider" />
                                            <div className="sale-stat">
                                                <div className="sale-stat-val">{sale.customer_name}</div>
                                                <div className="sale-stat-lbl">Customer</div>
                                            </div>
                                        </div>

                                        {/* Footer */}
                                        <div className="sale-card-footer">
                                            <span className="sale-date">
                                                {new Date(sale.sales_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                                            </span>
                                            <span className="sale-view-link">View Details →</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {/* Pagination */}
                    {filteredSales.length > 0 && (
                        <div className="pagination-controls">
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <span>Cards per page:</span>
                                <input
                                    type="number"
                                    min="1"
                                    value={rowsInput}
                                    onChange={handleRowsChange}
                                    className="rows-input"
                                />
                            </div>
                            <div>
                                <button onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} disabled={currentPage === 1}>← Prev</button>
                                <span style={{ margin: '0 14px', fontWeight: 600 }}>{currentPage} / {totalPages}</span>
                                <button onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages}>Next →</button>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {viewMode === 'add' && <AddSale handleBack={handleBack} />}

            {viewMode === 'details' && selectedSaleId && (
                <SaleDetails saleId={selectedSaleId} handleBack={handleBack} />
            )}
        </div>
    );
};

export default Manager_Sales;