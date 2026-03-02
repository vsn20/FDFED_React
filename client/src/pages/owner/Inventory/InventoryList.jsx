import React, { useState, useEffect, useMemo } from 'react';
import api from '../../../api/api';

/* ── Icon helpers ────────────────────────────────────────── */
const IconSearch = () => (
  <svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
);
const IconReset = () => (
  <svg viewBox="0 0 24 24"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 102.13-9.36L1 10"/></svg>
);
const IconChevLeft = () => (
  <svg viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"/></svg>
);
const IconChevRight = () => (
  <svg viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"/></svg>
);

/* ── Quantity tier helper ────────────────────────────────── */
const qtyTier = (qty) => {
  if (qty >= 100) return 'high';
  if (qty >= 30)  return 'medium';
  return 'low';
};

/* ── Component ───────────────────────────────────────────── */
const InventoryList = () => {
  const [inventory, setInventory]   = useState([]);
  const [branches, setBranches]     = useState([]);
  const [loading, setLoading]       = useState(true);

  const [searchQuery, setSearchQuery]     = useState('');
  const [selectedBranch, setSelectedBranch] = useState('');

  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage]   = useState(10);
  const [rowsInput, setRowsInput]       = useState('10');

  /* ── Fetch ── */
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [invRes, branchRes] = await Promise.all([
          api.get('/owner/inventory'),
          api.get('/owner/inventory/branches'),
        ]);
        setInventory(invRes.data);
        setBranches(branchRes.data);
      } catch (err) {
        console.error('Error fetching inventory data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  /* ── Filter ── */
  const filtered = useMemo(() => {
    let result = inventory;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(item =>
        item.branch_id?.toLowerCase().includes(q)   ||
        item.branch_name?.toLowerCase().includes(q) ||
        item.product_id?.toLowerCase().includes(q)  ||
        item.product_name?.toLowerCase().includes(q)||
        item.company_name?.toLowerCase().includes(q)||
        item.model_no?.toLowerCase().includes(q)
      );
    }
    if (selectedBranch) {
      result = result.filter(item => item.branch_id === selectedBranch);
    }
    return result;
  }, [searchQuery, selectedBranch, inventory]);

  // Reset page when filters change
  useEffect(() => { setCurrentPage(1); }, [searchQuery, selectedBranch]);

  /* ── Pagination ── */
  const totalPages  = Math.max(1, Math.ceil(filtered.length / rowsPerPage));
  const safePage    = Math.min(currentPage, totalPages);
  const indexFirst  = (safePage - 1) * rowsPerPage;
  const currentRows = filtered.slice(indexFirst, indexFirst + rowsPerPage);

  const handleRowsChange = (e) => {
    const val = e.target.value;
    setRowsInput(val);
    const n = parseInt(val, 10);
    if (!isNaN(n) && n > 0) { setRowsPerPage(n); setCurrentPage(1); }
  };

  /* ── Stats ── */
  const totalQty      = inventory.reduce((s, i) => s + (i.quantity || 0), 0);
  const uniqueBranches= new Set(inventory.map(i => i.branch_id)).size;
  const uniqueProducts= new Set(inventory.map(i => i.product_id)).size;
  const lowStockCount = inventory.filter(i => i.quantity < 30).length;

  const stats = [
    { icon: '📦', value: inventory.length, label: 'Total Records'   },
    { icon: '🔢', value: totalQty.toLocaleString(), label: 'Total Stock'    },
    { icon: '🌐', value: uniqueBranches,   label: 'Branches'        },
    { icon: '⚠️', value: lowStockCount,    label: 'Low Stock Items' },
  ];

  /* ── Loading ── */
  if (loading) return (
    <div className="inv-loading">
      <span className="inv-spinner" />
      Loading inventory…
    </div>
  );

  return (
    <div className="inv-page">

      {/* ── Header ── */}
      <div className="inv-header">
        <div className="inv-header-left">
          <div className="inv-overline">Stock Management</div>
          <h1 className="inv-title">Inventory <em>Overview</em></h1>
          <p className="inv-sub">
            {filtered.length === inventory.length
              ? `Showing all ${inventory.length} records across ${uniqueBranches} branches`
              : `Showing ${filtered.length} of ${inventory.length} records`}
          </p>
        </div>
        <div className="inv-count-badge">
          <span className="inv-count-num">{inventory.length}</span>
          Total Records
        </div>
      </div>

      {/* ── Stat Strip ── */}
      <div className="inv-stats">
        {stats.map((s, i) => (
          <div className="inv-stat" key={i}>
            <div className="inv-stat-icon">{s.icon}</div>
            <div className="inv-stat-value">{s.value}</div>
            <div className="inv-stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      {/* ── Main Card ── */}
      <div className="inv-card">

        {/* Card header */}
        <div className="inv-card-header">
          <span className="inv-card-title">Inventory Records</span>
        </div>

        {/* Filter bar */}
        <div className="filters-bar">
          <div className="filter-search-wrap">
            <input
              type="text"
              className="filter-input"
              placeholder="Search branch, product, company or model…"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>

          <select
            className="filter-input"
            value={selectedBranch}
            onChange={e => setSelectedBranch(e.target.value)}
            style={{ flex: '1', minWidth: '160px', paddingLeft: '14px' }}
          >
            <option value="">All Branches</option>
            {branches.map(b => (
              <option key={b._id} value={b.bid}>{b.b_name} ({b.bid})</option>
            ))}
          </select>

          <button
            className="btn-reset"
            onClick={() => { setSearchQuery(''); setSelectedBranch(''); }}
          >
            <IconReset /> Reset
          </button>
        </div>

        {/* Table */}
        <div className="table-wrapper">
          <table className="inventory-table">
            <thead>
              <tr>
                <th>Branch ID</th>
                <th>Branch Name</th>
                <th>Product ID</th>
                <th>Product Name</th>
                <th>Company</th>
                <th>Model No.</th>
                <th>Qty</th>
              </tr>
            </thead>
            <tbody>
              {currentRows.length > 0 ? (
                currentRows.map((item, idx) => (
                  <tr key={item._id || idx}>
                    <td><span className="td-id">{item.branch_id}</span></td>
                    <td>{item.branch_name}</td>
                    <td><span className="td-id">{item.product_id}</span></td>
                    <td><span className="td-product-name">{item.product_name}</span></td>
                    <td><span className="td-company">{item.company_name}</span></td>
                    <td>{item.model_no}</td>
                    <td className="td-qty">
                      <span className={`qty-pill ${qtyTier(item.quantity)}`}>
                        {item.quantity}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7">
                    <div className="inv-empty">
                      <div className="inv-empty-icon">🔍</div>
                      <div className="inv-empty-title">No results found</div>
                      <div className="inv-empty-sub">Try adjusting your search or branch filter</div>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {filtered.length > 0 && (
          <div className="inv-card-footer">

            {/* Rows per page */}
            <div className="inv-rows-control">
              <span>Rows per page</span>
              <input
                type="number"
                min="1"
                className="rows-input"
                value={rowsInput}
                onChange={handleRowsChange}
              />
            </div>

            {/* Page info */}
            <span className="inv-page-info">
              <strong>{indexFirst + 1}–{Math.min(indexFirst + rowsPerPage, filtered.length)}</strong>
              {' '}of{' '}
              <strong>{filtered.length}</strong> results
            </span>

            {/* Page buttons */}
            <div className="inv-page-btns">
              <button
                className="btn-page"
                onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                disabled={safePage === 1}
              >
                <IconChevLeft /> Prev
              </button>

              <span className="page-num">{safePage} / {totalPages}</span>

              <button
                className="btn-page"
                onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                disabled={safePage === totalPages}
              >
                Next <IconChevRight />
              </button>
            </div>

          </div>
        )}
      </div>
    </div>
  );
};

export default InventoryList;