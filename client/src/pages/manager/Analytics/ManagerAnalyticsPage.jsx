import React, { useState, useEffect, useCallback } from 'react';
import api from '../../../api/api';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';
import styles from './ManagerAnalytics.module.css';

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend, Filler);

const LOW_STOCK_THRESHOLD = 10;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const makeGradientPlugin = (id, colorTop, colorBottom) => ({
  id,
  beforeDatasetsDraw(chart) {
    const { ctx, chartArea } = chart;
    if (!chartArea) return;
    chart.data.datasets.forEach((dataset) => {
      const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
      gradient.addColorStop(0, colorTop);
      gradient.addColorStop(1, colorBottom);
      dataset.backgroundColor = gradient;
    });
  },
});

const createModernOptions = (chartTitle, yLabel) => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: true,
      position: 'top',
      labels: { font: { size: 12, family: "'Inter', 'Segoe UI', sans-serif" }, color: '#4a5568', boxWidth: 12, padding: 16 },
    },
    title: {
      display: true,
      text: chartTitle,
      font: { size: 15, weight: '600', family: "'Inter', 'Segoe UI', sans-serif" },
      color: '#212529',
      padding: { bottom: 16 },
    },
    tooltip: {
      backgroundColor: 'rgba(30, 39, 46, 0.92)',
      titleFont: { size: 13, weight: 'bold' },
      bodyFont: { size: 12 },
      cornerRadius: 8,
      padding: 10,
    },
  },
  scales: {
    x: {
      grid: { color: 'rgba(0,0,0,0.04)', drawBorder: false },
      ticks: { color: '#718096', font: { size: 11 }, maxRotation: 45, minRotation: 0 },
    },
    y: {
      beginAtZero: true,
      title: { display: !!yLabel, text: yLabel, color: '#718096', font: { size: 11 } },
      grid: { color: 'rgba(0,0,0,0.04)', drawBorder: false },
      ticks: { color: '#718096', font: { size: 11 }, stepSize: 1 },
    },
  },
  elements: {
    line: { tension: 0.4, borderWidth: 2 },
    point: { radius: 3, hoverRadius: 5 },
    bar: { borderRadius: 8 },
  },
  animation: { duration: 600, easing: 'easeInOutQuart' },
});

const formatMonthLabel = (m) => {
  if (!m) return '';
  const [year, mon] = m.split('-');
  return new Date(Number(year), Number(mon) - 1, 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
};

// Gradient plugins — created once
const gradientPlugins = {
  orders:  makeGradientPlugin('gp_orders',  'rgba(0, 123, 255, 0.55)',  'rgba(0, 123, 255, 0.03)'),
  sales:   makeGradientPlugin('gp_sales',   'rgba(246, 201, 14, 0.55)', 'rgba(246, 201, 14, 0.03)'),
  salesman:makeGradientPlugin('gp_salesman','rgba(40, 167, 69, 0.80)',  'rgba(40, 167, 69, 0.05)'),
  company: makeGradientPlugin('gp_company', 'rgba(237, 137, 54, 0.75)', 'rgba(237, 137, 54, 0.05)'),
  product: makeGradientPlugin('gp_product', 'rgba(159, 122, 234, 0.75)','rgba(159, 122, 234, 0.05)'),
};

const TABS = [
  { id: 1, label: 'Overview',             icon: '📊' },
  { id: 2, label: 'Salesman Performance', icon: '👤' },
  { id: 3, label: 'Company Sales',        icon: '🏭' },
  { id: 4, label: 'Product Sales',        icon: '📦' },
];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

const ManagerAnalyticsPage = () => {

  // ── Tab ─────────────────────────────────────────────────────────────────────
  const [activeSection, setActiveSection] = useState(1);

  // ── Low-stock alert (shown regardless of active tab) ────────────────────────
  const [lowStockItems, setLowStockItems] = useState([]);

  // ── Section 1: Overview ─────────────────────────────────────────────────────
  const [overviewData, setOverviewData]     = useState(null);
  const [overviewLoading, setOverviewLoading] = useState(true);
  const [overviewError, setOverviewError]   = useState(null);

  // ── Section 2: Salesman Performance ────────────────────────────────────────
  const [salesmanData, setSalesmanData]         = useState(null);
  const [salesmanLoading, setSalesmanLoading]   = useState(true);
  const [salesmanError, setSalesmanError]       = useState(null);
  const [s2Month, setS2Month]                   = useState('');
  const [s2AvailableMonths, setS2AvailableMonths] = useState([]);
  const [s2InitDone, setS2InitDone]             = useState(false);
  const [s2Product, setS2Product]               = useState('All');
  const [s2Metric, setS2Metric]                 = useState('units');

  // ── Section 3: Company Sales ────────────────────────────────────────────────
  const [companySalesData, setCompanySalesData]       = useState(null);
  const [companySalesLoading, setCompanySalesLoading] = useState(false);
  const [companySalesError, setCompanySalesError]     = useState(null);
  const [s3Month, setS3Month]                         = useState('');
  const [s3AvailableMonths, setS3AvailableMonths]     = useState([]);
  const [s3Metric, setS3Metric]                       = useState('units');
  const [s3Triggered, setS3Triggered]                 = useState(false);

  // ── Section 4: Product Sales ────────────────────────────────────────────────
  const [productSalesData, setProductSalesData]       = useState(null);
  const [productSalesLoading, setProductSalesLoading] = useState(false);
  const [productSalesError, setProductSalesError]     = useState(null);
  const [s4Month, setS4Month]                         = useState('');
  const [s4AvailableMonths, setS4AvailableMonths]     = useState([]);
  const [s4Company, setS4Company]                     = useState('All');
  const [s4Metric, setS4Metric]                       = useState('units');
  const [s4Triggered, setS4Triggered]                 = useState(false);

  // ---------------------------------------------------------------------------
  // Tab click — lazy-trigger sections 3 & 4 on first visit
  // ---------------------------------------------------------------------------
  const handleTabClick = (id) => {
    setActiveSection(id);
    if (id === 3 && !s3Triggered) setS3Triggered(true);
    if (id === 4 && !s4Triggered) setS4Triggered(true);
  };

  // ---------------------------------------------------------------------------
  // Low-stock items — fetch once on mount
  // ---------------------------------------------------------------------------
  useEffect(() => {
    api.get('/manager/inventory')
      .then(res => {
        const items = res.data.data || [];
        setLowStockItems(items.filter(i => i.quantity < LOW_STOCK_THRESHOLD));
      })
      .catch(err => console.error('Error fetching low stock:', err));
  }, []);

  // ---------------------------------------------------------------------------
  // Section 1: Overview — fetch on mount
  // ---------------------------------------------------------------------------
  useEffect(() => {
    const fetch = async () => {
      setOverviewLoading(true);
      setOverviewError(null);
      try {
        const res = await api.get('/manager/analytics/overview');
        if (res.data.success) setOverviewData(res.data.data);
        else setOverviewError('Failed to load overview data');
      } catch (err) {
        console.error('Overview fetch error:', err);
        setOverviewError(err.response?.data?.message || 'Failed to load overview data');
      } finally {
        setOverviewLoading(false);
      }
    };
    fetch();
  }, []);

  // ---------------------------------------------------------------------------
  // Section 2: Salesman — init fetch (discover months), then re-fetch on month change
  // ---------------------------------------------------------------------------
  useEffect(() => {
    const init = async () => {
      setSalesmanLoading(true);
      setSalesmanError(null);
      try {
        const res = await api.get('/manager/analytics/salesman-performance');
        if (res.data.success) {
          const { availableMonths } = res.data.data;
          const months = availableMonths || [];
          setS2AvailableMonths(months);
          const best = months.length > 0 ? months[0] : (() => {
            const n = new Date();
            return `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, '0')}`;
          })();
          setS2Month(best);
        }
      } catch (err) {
        console.error('Salesman init error:', err);
        setSalesmanError('Failed to load salesman data');
      } finally {
        setS2InitDone(true);
      }
    };
    init();
  }, []);

  useEffect(() => {
    if (!s2InitDone || !s2Month) return;
    const fetch = async () => {
      setSalesmanLoading(true);
      setSalesmanError(null);
      try {
        const res = await api.get(`/manager/analytics/salesman-performance?month=${s2Month}`);
        if (res.data.success) {
          setSalesmanData(res.data.data);
          if (res.data.data.availableMonths?.length) setS2AvailableMonths(res.data.data.availableMonths);
          if (!res.data.data.products.includes(s2Product)) setS2Product('All');
        }
      } catch (err) {
        console.error('Salesman fetch error:', err);
        setSalesmanError('Failed to load salesman data');
      } finally {
        setSalesmanLoading(false);
      }
    };
    fetch();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [s2InitDone, s2Month]);

  // ---------------------------------------------------------------------------
  // Section 3: Company Sales — lazy, phase-1/phase-2
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (!s3Triggered) return;

    if (s3Month === '') {
      const init = async () => {
        setCompanySalesLoading(true);
        try {
          const res = await api.get('/manager/analytics/company-sales');
          if (res.data.success) {
            const months = res.data.data.availableMonths || [];
            if (months.length) setS3AvailableMonths(months);
            const best = months.length > 0 ? months[0] : (() => {
              const n = new Date();
              return `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, '0')}`;
            })();
            setS3Month(best);
          }
        } catch (err) {
          console.error('Company-sales init error:', err);
          setCompanySalesError('Failed to load company sales data');
          setCompanySalesLoading(false);
        }
      };
      init();
      return;
    }

    let cancelled = false;
    const fetch = async () => {
      setCompanySalesLoading(true);
      setCompanySalesError(null);
      try {
        const res = await api.get(`/manager/analytics/company-sales?month=${s3Month}`);
        if (!cancelled && res.data.success) {
          setCompanySalesData(res.data.data);
          if (res.data.data.availableMonths?.length) setS3AvailableMonths(res.data.data.availableMonths);
        }
      } catch (err) {
        if (!cancelled) {
          console.error('Company-sales fetch error:', err);
          setCompanySalesError('Failed to load company sales data');
        }
      } finally {
        if (!cancelled) setCompanySalesLoading(false);
      }
    };
    fetch();
    return () => { cancelled = true; };
  }, [s3Triggered, s3Month]);

  // ---------------------------------------------------------------------------
  // Section 4: Product Sales — lazy, phase-1/phase-2, re-fetches on company change
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (!s4Triggered) return;

    if (s4Month === '') {
      const init = async () => {
        setProductSalesLoading(true);
        try {
          const res = await api.get('/manager/analytics/product-sales');
          if (res.data.success) {
            const months = res.data.data.availableMonths || [];
            if (months.length) setS4AvailableMonths(months);
            const best = months.length > 0 ? months[0] : (() => {
              const n = new Date();
              return `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, '0')}`;
            })();
            setS4Month(best);
          }
        } catch (err) {
          console.error('Product-sales init error:', err);
          setProductSalesError('Failed to load product sales data');
          setProductSalesLoading(false);
        }
      };
      init();
      return;
    }

    let cancelled = false;
    const fetch = async () => {
      setProductSalesLoading(true);
      setProductSalesError(null);
      try {
        const params = new URLSearchParams({ month: s4Month });
        if (s4Company && s4Company !== 'All') params.set('company', s4Company);
        const res = await api.get(`/manager/analytics/product-sales?${params.toString()}`);
        if (!cancelled && res.data.success) {
          setProductSalesData(res.data.data);
          if (res.data.data.availableMonths?.length) setS4AvailableMonths(res.data.data.availableMonths);
        }
      } catch (err) {
        if (!cancelled) {
          console.error('Product-sales fetch error:', err);
          setProductSalesError('Failed to load product sales data');
        }
      } finally {
        if (!cancelled) setProductSalesLoading(false);
      }
    };
    fetch();
    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [s4Triggered, s4Month, s4Company]);

  // ---------------------------------------------------------------------------
  // Chart config builders
  // ---------------------------------------------------------------------------

  const buildOverviewCharts = () => {
    if (!overviewData) return null;
    const { days, orderCounts, saleCounts, profitLossTotals } = overviewData;

    const ordersData = {
      labels: days,
      datasets: [{ label: 'Daily Orders', data: orderCounts, borderColor: '#007bff', backgroundColor: 'rgba(0,123,255,0.25)', fill: true, tension: 0.4 }],
    };
    const salesData = {
      labels: days,
      datasets: [{ label: 'Daily Sales', data: saleCounts, borderColor: '#d4a017', backgroundColor: 'rgba(246,201,14,0.22)', fill: true, tension: 0.4 }],
    };
    const profitData = {
      labels: days,
      datasets: [{
        label: 'Profit / Loss (₹)',
        data: profitLossTotals,
        backgroundColor: profitLossTotals.map(v => v >= 0 ? 'rgba(40,167,69,0.72)' : 'rgba(220,53,69,0.68)'),
        borderColor:      profitLossTotals.map(v => v >= 0 ? 'rgba(40,167,69,1)'    : 'rgba(220,53,69,1)'),
        borderWidth: 1.5, borderRadius: 8,
      }],
    };

    const profitBase = createModernOptions('Financial Performance (Daily)', 'Amount (₹)');
    const profitOptions = {
      ...profitBase,
      scales: { ...profitBase.scales, y: { ...profitBase.scales.y, ticks: { ...profitBase.scales.y.ticks, callback: v => `₹${v.toLocaleString()}` } } },
    };

    return {
      ordersData,  ordersOptions:  createModernOptions('Order Volume', 'Orders'),
      salesData,   salesOptions:   createModernOptions('Sales Volume', 'Sales'),
      profitData,  profitOptions,
    };
  };

  const buildSalesmanChart = () => {
    if (!salesmanData) return null;
    const perf = salesmanData.performance?.[s2Product];
    if (!perf || perf.length === 0) return null;

    const isUnits = s2Metric === 'units';
    const yLabel = isUnits
      ? (s2Product === 'All' ? 'Units Sold (All Products)' : 'Units Sold')
      : (s2Product === 'All' ? 'No. of Sales (All Products)' : 'No. of Sales');

    const chartConfig = {
      labels: perf.map(p => p.name),
      datasets: [{
        label: yLabel,
        data: perf.map(p => isUnits ? p.units : p.sales),
        backgroundColor: 'rgba(40,167,69,0.6)',
        borderColor: 'rgba(25,135,84,1)',
        borderWidth: 1.5, borderRadius: 8,
      }],
    };

    const chartTitle = `${salesmanData.branchName} — ${s2Product === 'All' ? 'All Products' : s2Product}`;
    return { chartConfig, options: createModernOptions(chartTitle, yLabel) };
  };

  const buildCompanySalesChart = () => {
    if (!companySalesData) return null;
    const { companies, companySales } = companySalesData;
    const isUnits = s3Metric === 'units';

    const labels = companies.filter(c => companySales[c]);
    const values = labels.map(c => isUnits ? companySales[c].totalUnits : companySales[c].totalSales);

    if (values.length === 0 || values.every(v => v === 0)) return null;

    const yLabel = isUnits ? 'Units Sold' : 'No. of Sales';
    return {
      chartConfig: {
        labels,
        datasets: [{ label: yLabel, data: values, backgroundColor: 'rgba(237,137,54,0.7)', borderColor: 'rgba(197,97,14,1)', borderWidth: 1.5, borderRadius: 8 }],
      },
      options: createModernOptions(isUnits ? 'Total Units Sold per Company' : 'Total Sales per Company', yLabel),
    };
  };

  const buildProductSalesChart = () => {
    if (!productSalesData) return null;
    const { productSales } = productSalesData;
    const isUnits = s4Metric === 'units';

    const labels = Object.keys(productSales);
    const values = labels.map(p => isUnits ? productSales[p].totalUnits : productSales[p].totalSales);

    if (labels.length === 0 || values.every(v => v === 0)) return null;

    const yLabel     = isUnits ? 'Units Sold' : 'No. of Sales';
    const chartTitle = s4Company === 'All'
      ? (isUnits ? 'Units Sold per Product' : 'Sales per Product')
      : (isUnits ? `Units Sold — ${s4Company}` : `Sales — ${s4Company}`);

    return {
      chartConfig: {
        labels,
        datasets: [{ label: yLabel, data: values, backgroundColor: 'rgba(159,122,234,0.7)', borderColor: 'rgba(107,70,193,1)', borderWidth: 1.5, borderRadius: 8 }],
      },
      options: createModernOptions(chartTitle, yLabel),
    };
  };

  // ---------------------------------------------------------------------------
  // Derived configs
  // ---------------------------------------------------------------------------
  const overviewCharts    = buildOverviewCharts();
  const salesmanChart     = buildSalesmanChart();
  const companySalesChart = buildCompanySalesChart();
  const productSalesChart = buildProductSalesChart();

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------
  return (
    <div className={styles.container}>
      <div className={styles.contentArea}>

        <h1>Manager Analytics</h1>
        {overviewData && (
          <p className={styles.welcomeMessage}>
            Branch: <strong>{overviewData.branchName}</strong>
          </p>
        )}

        {/* ── Low Stock Alert — always visible ── */}
        {lowStockItems.length > 0 && (
          <div className={styles.lowStockAlert}>
            <div className={styles.lowStockHeader}>
              <span className={styles.lowStockIcon}>⚠️</span>
              <h2>Low Stock Alert — {lowStockItems.length} Product{lowStockItems.length > 1 ? 's' : ''} Need Restocking</h2>
            </div>
            <p className={styles.lowStockSubtext}>
              The following products are below {LOW_STOCK_THRESHOLD} units. Consider placing orders soon.
            </p>
            <div className={styles.lowStockCardGrid}>
              {lowStockItems.map((item, idx) => {
                const isOut = item.quantity === 0;
                const pct = isOut ? 0 : Math.min(100, Math.max(5, (item.quantity / LOW_STOCK_THRESHOLD) * 100));
                return (
                  <div
                    key={item._id}
                    className={`${styles.lowStockCard} ${isOut ? styles.lowStockCardOut : ''}`}
                    style={{ animationDelay: `${idx * 0.06}s` }}
                  >
                    <div className={styles.lscAccent} style={{
                      background: isOut
                        ? 'linear-gradient(90deg,#dc2626,#f87171)'
                        : 'linear-gradient(90deg,#d97706,#fbbf24)'
                    }} />
                    <div className={styles.lscBody}>
                      <div className={styles.lscName}>{item.product_name}</div>
                      <div className={styles.lscCompany}>{item.company_name}</div>
                      {item.model_no && <div className={styles.lscModel}>{item.model_no}</div>}
                      <div className={styles.lscMeterRow}>
                        <div className={styles.lscMeterTrack}>
                          <div className={styles.lscMeterFill} style={{
                            width: `${pct}%`,
                            background: isOut ? '#dc2626' : '#d97706'
                          }} />
                        </div>
                        <span className={`${styles.lscQty} ${isOut ? styles.lscQtyOut : ''}`}>
                          {isOut ? 'OUT OF STOCK' : `${item.quantity} left`}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Tab Navigation ── */}
        <nav className={styles.tabBar} role="tablist" aria-label="Analytics sections">
          {TABS.map(tab => (
            <button
              key={tab.id}
              role="tab"
              aria-selected={activeSection === tab.id}
              className={`${styles.tabBtn} ${activeSection === tab.id ? styles.tabActive : ''}`}
              onClick={() => handleTabClick(tab.id)}
            >
              <span className={styles.tabIcon} aria-hidden="true">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>

        {/* ── Section 1: Overview ── */}
        {activeSection === 1 && (
          <section className={styles.section} role="tabpanel">
            <div className={styles.sectionHeader}>
              <h3 className={styles.sectionTitle}>Branch Overview</h3>
              {overviewData && (
                <span className={styles.sectionSubtitle}>{overviewData.title}</span>
              )}
            </div>

            {overviewLoading && <div className={styles.loading}>Loading overview…</div>}
            {overviewError   && <div className={styles.error}>{overviewError}</div>}

            {!overviewLoading && !overviewError && overviewCharts && (
              <>
                <div className={styles.graphGrid}>
                  <div className={styles.graphCard}>
                    <div className={styles.chartWrapper}>
                      <Line options={overviewCharts.ordersOptions} data={overviewCharts.ordersData} plugins={[gradientPlugins.orders]} />
                    </div>
                  </div>
                  <div className={styles.graphCard}>
                    <div className={styles.chartWrapper}>
                      <Line options={overviewCharts.salesOptions} data={overviewCharts.salesData} plugins={[gradientPlugins.sales]} />
                    </div>
                  </div>
                  <div className={`${styles.graphCard} ${styles.fullWidth}`}>
                    <div className={styles.chartWrapper}>
                      <Bar options={overviewCharts.profitOptions} data={overviewCharts.profitData} />
                    </div>
                  </div>
                </div>
                <p className={styles.note}>
                  Note: Profit/Loss shown is based on sale records only (sold price − purchased price). Net profit after salaries and commissions may differ.
                </p>
              </>
            )}
          </section>
        )}

        {/* ── Section 2: Salesman Performance ── */}
        {activeSection === 2 && (
          <section className={styles.section} role="tabpanel">
            <div className={styles.sectionHeader}>
              <h3 className={styles.sectionTitle}>Salesman Performance</h3>
              {salesmanData && (
                <span className={styles.sectionSubtitle}>{salesmanData.branchName}</span>
              )}
            </div>

            {salesmanLoading && <div className={styles.loading}>Loading salesman data…</div>}
            {salesmanError   && <div className={styles.error}>{salesmanError}</div>}

            {!salesmanLoading && !salesmanError && salesmanData && (
              <>
                <div className={styles.filterRow}>
                  {/* Month filter */}
                  <div className={styles.filterGroup}>
                    <label className={styles.filterLabel} htmlFor="s2MonthSelect">Month</label>
                    <select id="s2MonthSelect" className={styles.filterSelect} value={s2Month} onChange={e => setS2Month(e.target.value)}>
                      {s2AvailableMonths.map(m => (
                        <option key={m} value={m}>{formatMonthLabel(m)}</option>
                      ))}
                    </select>
                  </div>

                  {/* Product filter */}
                  <div className={styles.filterGroup}>
                    <label className={styles.filterLabel} htmlFor="s2ProductSelect">Product</label>
                    <select id="s2ProductSelect" className={styles.filterSelect} value={s2Product} onChange={e => setS2Product(e.target.value)}>
                      {salesmanData.products.map(p => (
                        <option key={p} value={p}>{p}</option>
                      ))}
                    </select>
                  </div>

                  {/* Sales / Units toggle */}
                  <div className={styles.filterGroup}>
                    <label className={styles.filterLabel}>Metric</label>
                    <div className={styles.toggleWrapper}>
                      <button type="button" className={`${styles.toggleBtn} ${s2Metric === 'sales' ? styles.toggleActive : ''}`} onClick={() => setS2Metric('sales')}>Sales</button>
                      <button type="button" className={`${styles.toggleBtn} ${s2Metric === 'units' ? styles.toggleActive : ''}`} onClick={() => setS2Metric('units')}>Units</button>
                    </div>
                  </div>
                </div>

                {salesmanChart ? (
                  <div className={`${styles.graphCard} ${styles.fullWidth}`}>
                    <div className={styles.chartWrapper}>
                      <Bar options={salesmanChart.options} data={salesmanChart.chartConfig} plugins={[gradientPlugins.salesman]} />
                    </div>
                  </div>
                ) : (
                  <div className={styles.emptyState}>No performance data available for the selected filters.</div>
                )}
              </>
            )}
          </section>
        )}

        {/* ── Section 3: Company Sales ── */}
        {activeSection === 3 && (
          <section className={styles.section} role="tabpanel">
            <div className={styles.sectionHeader}>
              <h3 className={styles.sectionTitle}>Company Sales</h3>
            </div>

            {companySalesLoading && <div className={styles.loading}>Loading company data…</div>}
            {companySalesError   && <div className={styles.error}>{companySalesError}</div>}

            {!companySalesLoading && !companySalesError && companySalesData && (
              <>
                <div className={styles.filterRow}>
                  <div className={styles.filterGroup}>
                    <label className={styles.filterLabel} htmlFor="s3MonthSelect">Month</label>
                    <select id="s3MonthSelect" className={styles.filterSelect} value={s3Month} onChange={e => setS3Month(e.target.value)}>
                      {s3AvailableMonths.map(m => (
                        <option key={m} value={m}>{formatMonthLabel(m)}</option>
                      ))}
                    </select>
                  </div>
                  <div className={styles.filterGroup}>
                    <label className={styles.filterLabel}>Metric</label>
                    <div className={styles.toggleWrapper}>
                      <button type="button" className={`${styles.toggleBtn} ${s3Metric === 'sales' ? styles.toggleActive : ''}`} onClick={() => setS3Metric('sales')}>Sales</button>
                      <button type="button" className={`${styles.toggleBtn} ${s3Metric === 'units' ? styles.toggleActive : ''}`} onClick={() => setS3Metric('units')}>Units</button>
                    </div>
                  </div>
                </div>

                {companySalesChart ? (
                  <div className={`${styles.graphCard} ${styles.fullWidth}`}>
                    <div className={styles.chartWrapper}>
                      <Bar options={companySalesChart.options} data={companySalesChart.chartConfig} plugins={[gradientPlugins.company]} />
                    </div>
                  </div>
                ) : (
                  <div className={styles.emptyState}>No company sales data for the selected month.</div>
                )}

                <p className={styles.note}>
                  Showing {s3Metric === 'units' ? 'total units sold' : 'total no. of sales'} per company for this branch ({formatMonthLabel(s3Month)}).
                  {s3Metric === 'units' && ' Units reflect the sum of quantities across all transactions.'}
                </p>
              </>
            )}
          </section>
        )}

        {/* ── Section 4: Product Sales ── */}
        {activeSection === 4 && (
          <section className={styles.section} role="tabpanel">
            <div className={styles.sectionHeader}>
              <h3 className={styles.sectionTitle}>Product Sales</h3>
            </div>

            {productSalesLoading && <div className={styles.loading}>Loading product data…</div>}
            {productSalesError   && <div className={styles.error}>{productSalesError}</div>}

            {!productSalesLoading && !productSalesError && productSalesData && (
              <>
                <div className={styles.filterRow}>
                  <div className={styles.filterGroup}>
                    <label className={styles.filterLabel} htmlFor="s4MonthSelect">Month</label>
                    <select id="s4MonthSelect" className={styles.filterSelect} value={s4Month} onChange={e => setS4Month(e.target.value)}>
                      {s4AvailableMonths.map(m => (
                        <option key={m} value={m}>{formatMonthLabel(m)}</option>
                      ))}
                    </select>
                  </div>

                  <div className={styles.filterGroup}>
                    <label className={styles.filterLabel} htmlFor="s4CompanySelect">Company</label>
                    <select id="s4CompanySelect" className={styles.filterSelect} value={s4Company} onChange={e => setS4Company(e.target.value)}>
                      {productSalesData.companies.map(c => (
                        <option key={c} value={c}>{c === 'All' ? 'All Companies' : c}</option>
                      ))}
                    </select>
                  </div>

                  <div className={styles.filterGroup}>
                    <label className={styles.filterLabel}>Metric</label>
                    <div className={styles.toggleWrapper}>
                      <button type="button" className={`${styles.toggleBtn} ${s4Metric === 'sales' ? styles.toggleActive : ''}`} onClick={() => setS4Metric('sales')}>Sales</button>
                      <button type="button" className={`${styles.toggleBtn} ${s4Metric === 'units' ? styles.toggleActive : ''}`} onClick={() => setS4Metric('units')}>Units</button>
                    </div>
                  </div>
                </div>

                {productSalesChart ? (
                  <div className={`${styles.graphCard} ${styles.fullWidth}`}>
                    <div className={styles.chartWrapper}>
                      <Bar options={productSalesChart.options} data={productSalesChart.chartConfig} plugins={[gradientPlugins.product]} />
                    </div>
                  </div>
                ) : (
                  <div className={styles.emptyState}>No product sales data for the selected filters.</div>
                )}

                <p className={styles.note}>
                  {s4Company === 'All'
                    ? `Showing ${s4Metric === 'units' ? 'units sold' : 'no. of sales'} for all products in this branch (${formatMonthLabel(s4Month)}).`
                    : `Showing ${s4Metric === 'units' ? 'units sold' : 'no. of sales'} for products under "${s4Company}" in this branch (${formatMonthLabel(s4Month)}).`
                  }
                </p>
              </>
            )}
          </section>
        )}

      </div>
    </div>
  );
};

export default ManagerAnalyticsPage;