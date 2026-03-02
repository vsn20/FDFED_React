import React, { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchSales } from '../../../redux/slices/saleSlice';
import SaleDetails from './SaleDetails';
import styles from './Sales.module.css';

/* ── Icons ── */
const IconSearch = () => (
  <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
);
const IconReset = () => (
  <svg viewBox="0 0 24 24" width="12" height="12" stroke="currentColor" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 102.13-9.36L1 10"/>
  </svg>
);
const IconChevL = () => (
  <svg viewBox="0 0 24 24" width="12" height="12" stroke="currentColor" fill="none" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 18 9 12 15 6"/>
  </svg>
);
const IconChevR = () => (
  <svg viewBox="0 0 24 24" width="12" height="12" stroke="currentColor" fill="none" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6"/>
  </svg>
);

const OwnerSales = () => {
  const dispatch = useDispatch();
  const { items: allSales, status } = useSelector((state) => state.sales);

  const [selectedSaleId, setSelectedSaleId]   = useState(null);
  const [searchQuery, setSearchQuery]         = useState('');
  const [selectedBranch, setSelectedBranch]   = useState('');
  const [selectedCompany, setSelectedCompany] = useState('');
  const [selectedProduct, setSelectedProduct] = useState('');
  const [currentPage, setCurrentPage]         = useState(1);
  const [itemsPerPage, setItemsPerPage]       = useState(12);
  const [itemsPerPageInput, setItemsPerPageInput] = useState('12');

  useEffect(() => {
    if (status === 'idle') dispatch(fetchSales());
  }, [status, dispatch]);

  const uniqueBranches  = useMemo(() => [...new Set(allSales.map(s => s.branch_name))].filter(Boolean).sort(), [allSales]);
  const uniqueCompanies = useMemo(() => [...new Set(allSales.map(s => s.company_name))].filter(Boolean).sort(), [allSales]);
  const uniqueProducts  = useMemo(() => [...new Set(allSales.map(s => s.product_name))].filter(Boolean).sort(), [allSales]);

  const filteredSales = useMemo(() => {
    let result = allSales;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(s =>
        s.sales_id?.toLowerCase().includes(q) ||
        s.customer_name?.toLowerCase().includes(q) ||
        s.branch_name?.toLowerCase().includes(q) ||
        s.product_name?.toLowerCase().includes(q) ||
        s.company_name?.toLowerCase().includes(q)
      );
    }
    if (selectedBranch)  result = result.filter(s => s.branch_name  === selectedBranch);
    if (selectedCompany) result = result.filter(s => s.company_name === selectedCompany);
    if (selectedProduct) result = result.filter(s => s.product_name === selectedProduct);
    return result;
  }, [searchQuery, selectedBranch, selectedCompany, selectedProduct, allSales]);

  useEffect(() => { setCurrentPage(1); }, [searchQuery, selectedBranch, selectedCompany, selectedProduct]);

  const totalPages    = Math.max(1, Math.ceil(filteredSales.length / itemsPerPage));
  const safePage      = Math.min(currentPage, totalPages);
  const indexFirst    = (safePage - 1) * itemsPerPage;
  const currentItems  = filteredSales.slice(indexFirst, indexFirst + itemsPerPage);

  const handleRowsKeyDown = (e) => {
    if (e.key === 'Enter') {
      const n = parseInt(itemsPerPageInput, 10);
      if (!isNaN(n) && n > 0) { setItemsPerPage(n); setCurrentPage(1); }
      else setItemsPerPageInput(String(itemsPerPage));
    }
  };

  const resetFilters = () => {
    setSearchQuery(''); setSelectedBranch(''); setSelectedCompany(''); setSelectedProduct('');
    setItemsPerPage(12); setItemsPerPageInput('12'); setCurrentPage(1);
  };

  /* Stat calcs */
  const totalRevenue = allSales.reduce((s, i) => s + (i.amount || 0), 0);
  const totalProfit  = allSales.reduce((s, i) => s + (i.profit_or_loss || 0), 0);
  const profitSales  = allSales.filter(s => (s.profit_or_loss || 0) >= 0).length;

  if (status === 'loading') return (
    <div className={styles.loadingState}><span className={styles.spinner}/> Loading sales…</div>
  );
  if (status === 'failed') return (
    <div className={styles.loadingState}>Failed to load sales data.</div>
  );
  if (selectedSaleId) return (
    <SaleDetails saleId={selectedSaleId} onBack={() => setSelectedSaleId(null)} />
  );

  return (
    <div className={styles.container}>

      {/* ── Header ── */}
      <div className={styles.pageHeader}>
        <div>
          <div className={styles.pageOverline}>Revenue Management</div>
          <h1 className={styles.pageTitle}>Sales <em>Overview</em></h1>
          <p className={styles.pageSub}>
            {filteredSales.length === allSales.length
              ? `${allSales.length} total transactions recorded`
              : `${filteredSales.length} of ${allSales.length} transactions`}
          </p>
        </div>
        <div className={styles.totalBadge}>
          <span className={styles.totalBadgeNum}>{allSales.length}</span>
          Total Sales
        </div>
      </div>

      {/* ── Stats ── */}
      <div className={styles.statsStrip}>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>💰</div>
          <div className={styles.statValue}>₹{(totalRevenue/1000).toFixed(1)}k</div>
          <div className={styles.statLabel}>Total Revenue</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>📈</div>
          <div className={styles.statValue} style={{color: totalProfit >= 0 ? 'var(--profit)' : 'var(--loss)'}}>
            ₹{Math.abs(totalProfit/1000).toFixed(1)}k
          </div>
          <div className={styles.statLabel}>{totalProfit >= 0 ? 'Total Profit' : 'Total Loss'}</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>🏷️</div>
          <div className={styles.statValue}>{profitSales}</div>
          <div className={styles.statLabel}>Profitable Sales</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>🏢</div>
          <div className={styles.statValue}>{uniqueBranches.length}</div>
          <div className={styles.statLabel}>Active Branches</div>
        </div>
      </div>

      {/* ── Filters ── */}
      <div className={styles.filterPanel}>
        <div className={styles.searchWrap}>
          <span className={styles.searchIcon}><IconSearch /></span>
          <input
            className={styles.searchInput}
            type="text"
            placeholder="Search ID, branch, product, customer…"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>
        <select className={styles.filterSelect} value={selectedBranch} onChange={e => setSelectedBranch(e.target.value)}>
          <option value="">All Branches</option>
          {uniqueBranches.map(b => <option key={b} value={b}>{b}</option>)}
        </select>
        <select className={styles.filterSelect} value={selectedCompany} onChange={e => setSelectedCompany(e.target.value)}>
          <option value="">All Companies</option>
          {uniqueCompanies.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <select className={styles.filterSelect} value={selectedProduct} onChange={e => setSelectedProduct(e.target.value)}>
          <option value="">All Products</option>
          {uniqueProducts.map(p => <option key={p} value={p}>{p}</option>)}
        </select>
        <button className={styles.resetBtn} onClick={resetFilters}><IconReset /> Reset</button>
      </div>

      {/* ── Results bar ── */}
      <div className={styles.resultsBar}>
        <span className={styles.resultsCount}>
          Showing <strong>{indexFirst + 1}–{Math.min(indexFirst + itemsPerPage, filteredSales.length)}</strong> of <strong>{filteredSales.length}</strong> results
        </span>
      </div>

      {/* ── Card Grid ── */}
      <div className={styles.cardGrid}>
        {currentItems.length > 0 ? currentItems.map((sale) => {
          const isProfit = (sale.profit_or_loss || 0) >= 0;
          return (
            <div
              key={sale.sales_id}
              className={styles.saleCard}
              onClick={() => setSelectedSaleId(sale.sales_id)}
            >
              {/* Card top */}
              <div className={styles.cardTop}>
                <div className={styles.cardTopLeft}>
                  <span className={styles.cardIdChip}>{sale.sales_id}</span>
                  <div className={styles.cardProductName}>{sale.product_name}</div>
                  <div className={styles.cardDate}>{new Date(sale.sales_date).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })}</div>
                </div>
                <span className={`${styles.cardPnl} ${isProfit ? styles.profit : styles.loss}`}>
                  {isProfit ? '▲' : '▼'} ₹{Math.abs(sale.profit_or_loss).toFixed(0)}
                </span>
              </div>

              {/* Card body */}
              <div className={styles.cardBody}>
                <div className={styles.cardRow}>
                  <span className={styles.cardRowIcon}>🏢</span>
                  <span className={styles.cardRowLabel}>Branch</span>
                  <span className={styles.cardRowValue}>{sale.branch_name}</span>
                </div>
                <div className={styles.cardRow}>
                  <span className={styles.cardRowIcon}>🏷️</span>
                  <span className={styles.cardRowLabel}>Company</span>
                  <span className={styles.cardRowValue}>{sale.company_name}</span>
                </div>
                <div className={styles.cardRow}>
                  <span className={styles.cardRowIcon}>👤</span>
                  <span className={styles.cardRowLabel}>Customer</span>
                  <span className={styles.cardRowValue}>{sale.customer_name}</span>
                </div>
              </div>

              {/* Card footer */}
              <div className={styles.cardFooter}>
                <div>
                  <div className={styles.cardAmountLabel}>Total Amount</div>
                  <div className={styles.cardAmount}>₹{sale.amount?.toFixed(2)}</div>
                </div>
                <span className={styles.cardViewBtn}>View Details →</span>
              </div>
            </div>
          );
        }) : (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>🔍</div>
            <div className={styles.emptyTitle}>No sales found</div>
            <div className={styles.emptySub}>Try adjusting your filters</div>
          </div>
        )}
      </div>

      {/* ── Pagination ── */}
      {filteredSales.length > 0 && (
        <div className={styles.paginationContainer}>
          <div className={styles.rowsPerPage}>
            <span>Cards per page</span>
            <input
              type="number" min="1"
              className={styles.rowsInput}
              value={itemsPerPageInput}
              onChange={e => setItemsPerPageInput(e.target.value)}
              onKeyDown={handleRowsKeyDown}
              title="Press Enter to apply"
            />
          </div>
          <span className={styles.paginationInfo}>
            <strong>{indexFirst + 1}–{Math.min(indexFirst + itemsPerPage, filteredSales.length)}</strong> of <strong>{filteredSales.length}</strong>
          </span>
          <div className={styles.paginationControls}>
            <button className={styles.pageBtn} onClick={() => setCurrentPage(p => Math.max(p-1,1))} disabled={safePage===1}>
              <IconChevL/> Prev
            </button>
            <span className={styles.pageIndicator}>{safePage} / {totalPages}</span>
            <button className={styles.pageBtn} onClick={() => setCurrentPage(p => Math.min(p+1,totalPages))} disabled={safePage===totalPages}>
              Next <IconChevR/>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default OwnerSales;