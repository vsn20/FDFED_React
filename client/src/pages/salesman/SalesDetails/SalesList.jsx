import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchSales, resetStatus } from '../../../redux/slices/salesmanSalesSlice';
import styles from './SalesList.module.css'; 

const RECORDS_OPTIONS = [5, 10, 20, 50];

const SalesList = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [successMsg, setSuccessMsg] = useState('');

  // Filters
  const [filterSaleId, setFilterSaleId]       = useState('');
  const [filterProduct, setFilterProduct]     = useState('');
  const [filterDate, setFilterDate]           = useState('');

  // Pagination
  const [currentPage, setCurrentPage]         = useState(1);
  const [recordsPerPage, setRecordsPerPage]   = useState(10);

  const { items, status, error } = useSelector((state) => state.salesmanSales);

  useEffect(() => {
    if (location.state?.successMessage) {
      setSuccessMsg(location.state.successMessage);
      window.history.replaceState({}, document.title);
      const timer = setTimeout(() => setSuccessMsg(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [location]);

  useEffect(() => {
    dispatch(fetchSales());
    return () => { dispatch(resetStatus()); };
  }, [dispatch]);

  // Reset page whenever a filter changes
  useEffect(() => { setCurrentPage(1); }, [filterSaleId, filterProduct, filterDate, recordsPerPage]);

  const filteredSales = items.filter(sale => {
    const matchId      = sale.sales_id.toLowerCase().includes(filterSaleId.toLowerCase());
    const matchProduct = sale.product_name.toLowerCase().includes(filterProduct.toLowerCase());
    const matchDate    = filterDate
      ? new Date(sale.saledate).toLocaleDateString() === new Date(filterDate).toLocaleDateString()
      : true;
    return matchId && matchProduct && matchDate;
  });

  const totalPages   = Math.max(1, Math.ceil(filteredSales.length / recordsPerPage));
  const safePage     = Math.min(currentPage, totalPages);
  const startIdx     = (safePage - 1) * recordsPerPage;
  const paginated    = filteredSales.slice(startIdx, startIdx + recordsPerPage);

  const clearFilters = () => { setFilterSaleId(''); setFilterProduct(''); setFilterDate(''); };

  if (status === 'loading') return <div className={styles.loadingText}>Loading…</div>;

  return (
    <div className={styles.salesContainer}>

      {/* ── Header ── */}
      <div className={styles.header}>
        <h1 className={styles.pageTitle}>Your Sales</h1>
        <Link to="/salesman/sales/add" className={styles.addButton}>+ Add Sale</Link>
      </div>

      {status === 'failed' && <div className={styles.alertError}>⚠️ {error}</div>}
      {successMsg        && <div className={styles.alertSuccess}>✅ {successMsg}</div>}

      {/* ── Filter Bar ── */}
      <div className={styles.filterBar}>
        <div className={styles.filterField}>
          <label className={styles.filterLabel}>Sale ID</label>
          <input
            className={styles.filterInput}
            type="text"
            placeholder="e.g. SL-001"
            value={filterSaleId}
            onChange={e => setFilterSaleId(e.target.value)}
          />
        </div>
        <div className={styles.filterField}>
          <label className={styles.filterLabel}>Product Name</label>
          <input
            className={styles.filterInput}
            type="text"
            placeholder="e.g. AC, TV…"
            value={filterProduct}
            onChange={e => setFilterProduct(e.target.value)}
          />
        </div>
        <div className={styles.filterField}>
          <label className={styles.filterLabel}>Sale Date</label>
          <input
            className={styles.filterInput}
            type="date"
            value={filterDate}
            onChange={e => setFilterDate(e.target.value)}
          />
        </div>
        {(filterSaleId || filterProduct || filterDate) && (
          <button className={styles.clearBtn} onClick={clearFilters}>✕ Clear</button>
        )}
      </div>

      {/* ── Table ── */}
      <div className={styles.tableWrapper}>
        <table className={styles.salesTable}>
          <thead>
            <tr>
              <th>Sale ID</th>
              <th>Product</th>
              <th>Company</th>
              <th>Total Price</th>
              <th>Profit / Loss</th>
              <th>Sale Date</th>
            </tr>
          </thead>
          <tbody>
            {paginated.length > 0 ? (
              paginated.map(sale => (
                <tr
                  key={sale.sales_id}
                  onClick={() => navigate(`/salesman/sales/${sale.sales_id}`)}
                  title="Click to view details"
                >
                  <td data-label="Sale ID">{sale.sales_id}</td>
                  <td data-label="Product">{sale.product_name}</td>
                  <td data-label="Company">{sale.company_name}</td>
                  <td data-label="Total Price">₹{parseFloat(sale.total_amount).toFixed(0)}</td>
                  <td
                    data-label="Profit / Loss"
                    className={parseFloat(sale.profit_or_loss) >= 0 ? styles.profit : styles.loss}
                  >
                    ₹{parseFloat(sale.profit_or_loss).toFixed(0)}
                  </td>
                  <td data-label="Sale Date">{new Date(sale.saledate).toLocaleDateString()}</td>
                </tr>
              ))
            ) : (
              <tr><td colSpan="6" className={styles.noData}>No sales match your filters.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ── Pagination Footer ── */}
      <div className={styles.paginationBar}>
        <div className={styles.recordsControl}>
          <label className={styles.filterLabel}>Rows per page</label>
          <select
            className={styles.recordsSelect}
            value={recordsPerPage}
            onChange={e => setRecordsPerPage(Number(e.target.value))}
          >
            {RECORDS_OPTIONS.map(n => <option key={n} value={n}>{n}</option>)}
          </select>
        </div>

        <span className={styles.pageInfo}>
          {filteredSales.length === 0 ? '0 records' : `${startIdx + 1}–${Math.min(startIdx + recordsPerPage, filteredSales.length)} of ${filteredSales.length}`}
        </span>

        <div className={styles.pageButtons}>
          <button className={styles.pageBtn} onClick={() => setCurrentPage(1)}        disabled={safePage === 1}>«</button>
          <button className={styles.pageBtn} onClick={() => setCurrentPage(p => p - 1)} disabled={safePage === 1}>‹</button>
          <span className={styles.pageNum}>{safePage} / {totalPages}</span>
          <button className={styles.pageBtn} onClick={() => setCurrentPage(p => p + 1)} disabled={safePage === totalPages}>›</button>
          <button className={styles.pageBtn} onClick={() => setCurrentPage(totalPages)} disabled={safePage === totalPages}>»</button>
        </div>
      </div>

    </div>
  );
};

export default SalesList;