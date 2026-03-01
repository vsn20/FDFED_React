import React, { useEffect, useState } from 'react';
import api from '../../api/api';
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
import styles from './OwnerAnalyticsPage.module.css';

// Register ChartJS components (added PointElement, LineElement, Filler for Line charts)
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Creates an inline Chart.js plugin that fills each dataset's backgroundColor
 * with a linear gradient (top → bottom). Because it runs in beforeDatasetsDraw,
 * the gradient automatically adapts when the chart is resized.
 *
 * @param {string}  id           - Unique plugin id (used by Chart.js internally)
 * @param {string}  colorTop     - CSS color string for the top / left of the gradient
 * @param {string}  colorBottom  - CSS color string for the bottom / right of the gradient
 * @param {boolean} horizontal   - If true, draws the gradient left-to-right instead
 */
const makeGradientPlugin = (id, colorTop, colorBottom, horizontal = false) => ({
  id,
  beforeDatasetsDraw(chart) {
    const { ctx, chartArea } = chart;
    if (!chartArea) return;
    chart.data.datasets.forEach((dataset) => {
      const gradient = horizontal
        ? ctx.createLinearGradient(chartArea.left, 0, chartArea.right, 0)
        : ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
      gradient.addColorStop(0, colorTop);
      gradient.addColorStop(1, colorBottom);
      dataset.backgroundColor = gradient;
    });
  },
});

/**
 * DRY factory for modern, dashboard-style Chart.js options.
 *
 * @param {string}  chartTitle  - Title displayed above the chart
 * @param {string}  yLabel      - Y-axis scale title (pass '' to hide)
 * @param {boolean} horizontal  - Set indexAxis:'y' for horizontal bar charts
 */
const createModernOptions = (chartTitle, yLabel, horizontal = false) => ({
  responsive: true,
  maintainAspectRatio: false,
  indexAxis: horizontal ? 'y' : 'x',
  plugins: {
    legend: {
      display: true,
      position: 'top',
      labels: {
        font: { size: 12, family: "'Inter', 'Segoe UI', sans-serif" },
        color: '#4a5568',
        boxWidth: 12,
        padding: 16,
      },
    },
    title: {
      display: true,
      text: chartTitle,
      font: { size: 15, weight: '600', family: "'Inter', 'Segoe UI', sans-serif" },
      color: '#2d3436',
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
      ticks: {
        color: '#718096',
        font: { size: 11, family: "'Inter', 'Segoe UI', sans-serif" },
        maxRotation: horizontal ? 0 : 45,
        minRotation: horizontal ? 0 : 45,
      },
    },
    y: {
      beginAtZero: true,
      title: {
        display: !!yLabel,
        text: yLabel,
        color: '#718096',
        font: { size: 11, family: "'Inter', 'Segoe UI', sans-serif" },
      },
      grid: { color: 'rgba(0,0,0,0.04)', drawBorder: false },
      ticks: {
        color: '#718096',
        font: { size: 11, family: "'Inter', 'Segoe UI', sans-serif" },
      },
    },
  },
  elements: {
    line: { tension: 0.4, borderWidth: 2 },
    point: { radius: 3, hoverRadius: 5 },
    bar: { borderRadius: 8 },
  },
  animation: { duration: 600, easing: 'easeInOutQuart' },
});

// Formats "YYYY-MM" → "Month YYYY" for display in the month dropdown
const formatMonthLabel = (m) => {
  const [year, mon] = m.split('-');
  return new Date(Number(year), Number(mon) - 1, 1).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });
};

// Gradient plugin instances — created once outside the component so they have
// stable references and Chart.js does not re-register them on every render.
const gradientPlugins = {
  orders: makeGradientPlugin(
    'gradient_orders',
    'rgba(108, 99, 255, 0.55)',
    'rgba(108, 99, 255, 0.03)'
  ),
  sales: makeGradientPlugin(
    'gradient_sales',
    'rgba(246, 201, 14, 0.55)',
    'rgba(246, 201, 14, 0.03)'
  ),
  // Vertical gradient for salesman bars (top=vivid, bottom=transparent)
  salesman: makeGradientPlugin(
    'gradient_salesman',
    'rgba(72, 187, 120, 0.88)',
    'rgba(72, 187, 120, 0.08)'
  ),
  // Vertical gradient for branch sales bars (blue tones)
  branch: makeGradientPlugin(
    'gradient_branch',
    'rgba(66, 153, 225, 0.65)',
    'rgba(66, 153, 225, 0.05)'
  ),
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

const OwnerAnalyticsPage = () => {
  // --- Overview state ---
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [title, setTitle] = useState('');

  // --- Salesman Performance state ---
  const [salesmanData, setSalesmanData] = useState(null);
  const [salesmanLoading, setSalesmanLoading] = useState(true);
  const [salesmanError, setSalesmanError] = useState(null);
  const [selectedBranch, setSelectedBranch] = useState('');
  const [selectedProduct, setSelectedProduct] = useState('All');
  // Month filter: initialised to '' so we can auto-select the latest month with data
  const [selectedMonth, setSelectedMonth] = useState('');
  const [availableMonths, setAvailableMonths] = useState([]);
  // Tracks whether the very first salesman fetch has resolved
  const [salesmanInitDone, setSalesmanInitDone] = useState(false);
  // Toggle: 'units' = quantity sum, 'sales' = transaction count
  const [s2Metric, setS2Metric] = useState('units');

  // --- Branch Sales state (Section 3) ---
  const [branchSalesData, setBranchSalesData] = useState(null);
  const [branchSalesLoading, setBranchSalesLoading] = useState(true);
  const [branchSalesError, setBranchSalesError] = useState(null);
  const [s3Branch, setS3Branch] = useState('All');
  const [s3Product, setS3Product] = useState('All');
  // Section 3 month filter — also starts empty and auto-selects
  const [s3Month, setS3Month] = useState('');
  const [s3AvailableMonths, setS3AvailableMonths] = useState([]);
  // Toggle: 'units' = quantity sum, 'sales' = transaction count
  const [s3Metric, setS3Metric] = useState('units');

  // Fetch overview analytics data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get('/owner/analytics/data');
        if (response.data.success) {
          setChartData(response.data.data);
          setTitle(response.data.data.title);
        }
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // ── Section 2: Initial fetch (without month param) to discover available months,
  //    then auto-select the latest month that actually has data.
  useEffect(() => {
    const initSalesman = async () => {
      setSalesmanLoading(true);
      setSalesmanError(null);
      try {
        // First call without month → API defaults to current month.
        // We only need availableMonths from it.
        const response = await api.get('/owner/analytics/salesman-performance');
        if (response.data.success) {
          const data = response.data.data;
          const months = data.availableMonths || [];
          setAvailableMonths(months);

          // Pick the latest month that has data (most-recent first from API)
          const bestMonth = months.length > 0 ? months[0] : (() => {
            const n = new Date();
            return `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, '0')}`;
          })();
          setSelectedMonth(bestMonth);
        }
      } catch (err) {
        console.error('Error during salesman init:', err);
        setSalesmanError('Failed to load salesman performance data');
      } finally {
        setSalesmanInitDone(true);
      }
    };
    initSalesman();
  }, []);

  // ── Section 2: Re-fetch whenever selectedMonth changes (skipped until init is done).
  //    Note: The API already filters out employees with the Sales Manager role —
  //    only field salespeople are included in the response.
  useEffect(() => {
    if (!salesmanInitDone || !selectedMonth) return;
    const fetchSalesmanData = async () => {
      setSalesmanLoading(true);
      setSalesmanError(null);
      try {
        const response = await api.get(
          `/owner/analytics/salesman-performance?month=${selectedMonth}`
        );
        if (response.data.success) {
          const data = response.data.data;
          setSalesmanData(data);
          // Keep the months list up-to-date
          if (data.availableMonths?.length) setAvailableMonths(data.availableMonths);
          // Default to the first branch, or keep current if it still exists
          if (data.branches?.length > 0) {
            setSelectedBranch((prev) =>
              prev && data.branches.includes(prev) ? prev : data.branches[0]
            );
          }
          // Reset product if it no longer exists in the returned product list
          if (!data.products.includes(selectedProduct)) setSelectedProduct('All');
        }
      } catch (err) {
        console.error('Error fetching salesman performance data:', err);
        setSalesmanError('Failed to load salesman performance data');
      } finally {
        setSalesmanLoading(false);
      }
    };
    fetchSalesmanData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [salesmanInitDone, selectedMonth]);

  // ── Section 3: Single effect driven by s3Month.
  //    Phase 1 (s3Month === ''): fetch without month to discover availableMonths, then
  //    set s3Month to the latest month with data — this triggers Phase 2 automatically.
  //    Phase 2 (s3Month !== ''): fetch month-filtered data and render the chart.
  //    Functional updaters for setS3Branch / setS3Product avoid stale-closure bugs.
  useEffect(() => {
    if (s3Month === '') {
      // Phase 1 — branchSalesLoading stays true throughout so no flicker occurs
      const init = async () => {
        try {
          const res = await api.get('/owner/analytics/branch-sales');
          if (res.data.success) {
            const months = res.data.data.availableMonths || [];
            if (months.length) setS3AvailableMonths(months);
            const best = months.length > 0 ? months[0] : (() => {
              const n = new Date();
              return `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, '0')}`;
            })();
            setS3Month(best); // triggers Phase 2 re-run
          }
        } catch (err) {
          console.error('Error during branch-sales init:', err);
          setBranchSalesError('Failed to load branch sales data');
          setBranchSalesLoading(false);
        }
        // branchSalesLoading intentionally NOT set to false here;
        // Phase 2 will resolve it after the month-filtered fetch completes.
      };
      init();
      return;
    }

    // Phase 2 — fetch data for the selected month
    let cancelled = false;
    const fetchBranchSales = async () => {
      setBranchSalesLoading(true);
      setBranchSalesError(null);
      try {
        const response = await api.get(
          `/owner/analytics/branch-sales?month=${s3Month}`
        );
        if (!cancelled && response.data.success) {
          const data = response.data.data;
          setBranchSalesData(data);
          if (data.availableMonths?.length) setS3AvailableMonths(data.availableMonths);
          // Use functional updaters to read current state — avoids stale closure values
          setS3Branch((prev) =>
            prev !== 'All' && !data.branches.includes(prev) ? 'All' : prev
          );
          setS3Product((prev) =>
            prev !== 'All' && !data.products.includes(prev) ? 'All' : prev
          );
        }
      } catch (err) {
        if (!cancelled) {
          console.error('Error fetching branch sales data:', err);
          setBranchSalesError('Failed to load branch sales data');
        }
      } finally {
        if (!cancelled) setBranchSalesLoading(false);
      }
    };
    fetchBranchSales();
    return () => { cancelled = true; }; // cancel stale fetch if month changes quickly
  }, [s3Month]);

  // ---------------------------------------------------------------------------
  // Overview chart configs (derived from chartData)
  // ---------------------------------------------------------------------------

  const buildOverviewCharts = () => {
    if (!chartData) return null;

    // 1. Orders — smooth Line chart with purple gradient fill
    const ordersData = {
      labels: chartData.days,
      datasets: [{
        label: 'Daily Orders',
        data: chartData.orderCounts,
        borderColor: '#6c63ff',
        backgroundColor: 'rgba(108, 99, 255, 0.25)', // overridden by gradient plugin
        fill: true,
        tension: 0.4,
      }],
    };

    // 2. Sales — smooth Line chart with gold gradient fill
    const salesData = {
      labels: chartData.days,
      datasets: [{
        label: 'Daily Sales',
        data: chartData.saleCounts,
        borderColor: '#d4a017',
        backgroundColor: 'rgba(246, 201, 14, 0.22)', // overridden by gradient plugin
        fill: true,
        tension: 0.4,
      }],
    };

    // 3. Financial Performance — per-bar color (profit=green / loss=red), rounded corners.
    //    Multi-color bars are set directly; no single gradient plugin needed here.
    const profitData = {
      labels: chartData.days,
      datasets: [{
        label: 'Profit / Loss ($)',
        data: chartData.profitLossTotals,
        backgroundColor: chartData.profitLossTotals.map((val) =>
          val >= 0 ? 'rgba(46, 204, 113, 0.72)' : 'rgba(231, 76, 60, 0.68)'
        ),
        borderColor: chartData.profitLossTotals.map((val) =>
          val >= 0 ? 'rgba(46, 204, 113, 1)' : 'rgba(231, 76, 60, 1)'
        ),
        borderWidth: 1.5,
        borderRadius: 8,
      }],
    };

    // Extend base options to format y-axis as currency for the profit chart
    const profitBase = createModernOptions('Financial Performance', 'Amount ($)');
    const profitOptions = {
      ...profitBase,
      scales: {
        ...profitBase.scales,
        y: {
          ...profitBase.scales.y,
          ticks: {
            ...profitBase.scales.y.ticks,
            callback: (val) => `$${val.toLocaleString()}`,
          },
        },
      },
    };

    return {
      ordersData,
      salesData,
      profitData,
      ordersOptions: createModernOptions('Order Volume', 'Orders'),
      salesOptions: createModernOptions('Sales Volume', 'Sales'),
      profitOptions,
    };
  };

  // ---------------------------------------------------------------------------
  // Salesman Performance chart config (derived from current filter selections)
  // ---------------------------------------------------------------------------

  const buildSalesmanChart = () => {
    if (!salesmanData || !selectedBranch) return null;

    const branchPerf = salesmanData.performance?.[selectedBranch];
    if (!branchPerf) return null;

    const productPerf = branchPerf[selectedProduct];
    if (!productPerf || productPerf.length === 0) return null;

    const isUnits = s2Metric === 'units';
    const yLabel = isUnits
      ? (selectedProduct === 'All' ? 'Units Sold (All Products)' : 'Units Sold')
      : (selectedProduct === 'All' ? 'No. of Sales (All Products)' : 'No. of Sales');

    const names = productPerf.map((p) => p.name);
    const values = productPerf.map((p) => isUnits ? p.units : p.sales);

    const chartConfig = {
      labels: names,
      datasets: [{
        label: yLabel,
        data: values,
        backgroundColor: 'rgba(72, 187, 120, 0.6)', // overridden by gradient plugin
        borderColor: 'rgba(56, 161, 105, 1)',
        borderWidth: 1.5,
        borderRadius: 8,
      }],
    };

    const chartTitle = `${selectedBranch} — ${
      selectedProduct === 'All' ? 'All Products' : selectedProduct
    }`;

    // Vertical bar chart: salesman names on X-axis, units on Y-axis.
    // maxRotation:45 so names don't overlap when there are many salesmen.
    const baseOptions = createModernOptions(chartTitle, yLabel);
    const options = {
      ...baseOptions,
      scales: {
        ...baseOptions.scales,
        x: {
          ...baseOptions.scales.x,
          ticks: {
            ...baseOptions.scales.x.ticks,
            maxRotation: 45,
            minRotation: 0,
          },
        },
        y: {
          ...baseOptions.scales.y,
          ticks: {
            ...baseOptions.scales.y.ticks,
            stepSize: 1, // units are whole numbers
          },
        },
      },
    };

    return { chartConfig, options };
  };

  // ---------------------------------------------------------------------------
  // Branch Sales chart config (Section 3)
  // ---------------------------------------------------------------------------
  //
  // Filter logic:
  //   (All, All)      → total sales transactions per branch (bar per branch)
  //   (Branch, All)   → units sold per product inside that branch (bar per product)
  //   (All, Product)  → that product's units sold per branch (bar per branch)
  //   (Branch, Prod)  → single bar: units of that product in that branch
  //
  const buildBranchSalesChart = () => {
    if (!branchSalesData) return null;
    const { branchSales, branches } = branchSalesData;
    const isUnits = s3Metric === 'units';

    const bothAll      = s3Branch === 'All' && s3Product === 'All';
    const branchOnly   = s3Branch !== 'All' && s3Product === 'All';
    const productOnly  = s3Branch === 'All' && s3Product !== 'All';
    const bothSelected = s3Branch !== 'All' && s3Product !== 'All';

    let labels, values, chartTitle, yLabel;

    if (bothAll) {
      labels = branches.filter((b) => branchSales[b]);
      values = labels.map((b) => isUnits ? branchSales[b].totalUnits : branchSales[b].totalSales);
      chartTitle = isUnits ? 'Total Units Sold per Branch' : 'Total Sales per Branch';
      yLabel = isUnits ? 'Units Sold' : 'No. of Sales';
    } else if (branchOnly) {
      const byProduct = branchSales[s3Branch]?.byProduct || {};
      labels = Object.keys(byProduct);
      values = labels.map((p) => isUnits ? byProduct[p].units : byProduct[p].sales);
      chartTitle = `Product Breakdown — ${s3Branch}`;
      yLabel = isUnits ? 'Units Sold' : 'No. of Sales';
    } else if (productOnly) {
      labels = branches.filter((b) => branchSales[b]);
      values = labels.map((b) => {
        const entry = branchSales[b]?.byProduct[s3Product];
        return entry ? (isUnits ? entry.units : entry.sales) : 0;
      });
      chartTitle = `${s3Product} — ${isUnits ? 'Units' : 'Sales'} per Branch`;
      yLabel = isUnits ? 'Units Sold' : 'No. of Sales';
    } else {
      const entry = branchSales[s3Branch]?.byProduct[s3Product];
      const count = entry ? (isUnits ? entry.units : entry.sales) : 0;
      labels = [s3Product];
      values = [count];
      chartTitle = `${s3Product} in ${s3Branch}`;
      yLabel = isUnits ? 'Units Sold' : 'No. of Sales';
    }

    if (values.length === 0 || values.every((v) => v === 0)) return null;

    const chartConfig = {
      labels,
      datasets: [{
        label: yLabel,
        data: values,
        backgroundColor: 'rgba(66, 153, 225, 0.6)', // overridden by branch gradient plugin
        borderColor: 'rgba(43, 108, 176, 1)',
        borderWidth: 1.5,
        borderRadius: 8,
      }],
    };

    return { chartConfig, options: createModernOptions(chartTitle, yLabel) };
  };

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  const overviewCharts = buildOverviewCharts();
  const salesmanChart = buildSalesmanChart();
  const branchSalesChart = buildBranchSalesChart();

  return (
    <div className={styles.container}>
      <h2>Owner Dashboard</h2>
      <div className={styles.contentArea}>

        {/* ── Section 1: Overview ──────────────────────────────────────── */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h3 className={styles.sectionTitle}>Overview</h3>
            {title && (
              <p className={styles.subtitle}>
                Period: <strong>{title}</strong>
              </p>
            )}
          </div>

          {loading && <div className={styles.loading}>Loading overview…</div>}
          {error && <div className={styles.error}>{error}</div>}

          {!loading && !error && overviewCharts && (
            <>
              <div className={styles.graphGrid}>
                {/* Orders Line Chart */}
                <div className={styles.graphCard}>
                  <div className={styles.chartWrapper}>
                    <Line
                      options={overviewCharts.ordersOptions}
                      data={overviewCharts.ordersData}
                      plugins={[gradientPlugins.orders]}
                    />
                  </div>
                </div>

                {/* Sales Line Chart */}
                <div className={styles.graphCard}>
                  <div className={styles.chartWrapper}>
                    <Line
                      options={overviewCharts.salesOptions}
                      data={overviewCharts.salesData}
                      plugins={[gradientPlugins.sales]}
                    />
                  </div>
                </div>

                {/* Financial Performance Bar Chart — full width */}
                <div className={`${styles.graphCard} ${styles.fullWidth}`}>
                  <div className={styles.chartWrapper}>
                    <Bar
                      options={overviewCharts.profitOptions}
                      data={overviewCharts.profitData}
                    />
                  </div>
                </div>
              </div>

              <p className={styles.note}>
                Note: Profits shown are for sales only. Realized profit (after salaries) can be
                verified from the Profits page.
              </p>
            </>
          )}
        </section>

        {/* ── Section 2: Salesman Performance ─────────────────────────── */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h3 className={styles.sectionTitle}>Salesman Performance</h3>
          </div>

          {salesmanLoading && <div className={styles.loading}>Loading salesman data…</div>}
          {salesmanError && <div className={styles.error}>{salesmanError}</div>}

          {!salesmanLoading && !salesmanError && salesmanData && (
            <>
              {/* Filter dropdowns: Month | Branch | Product | Toggle */}
              <div className={styles.filterRow}>
                {/* Month selector — drives a re-fetch of the performance data */}
                <div className={styles.filterGroup}>
                  <label className={styles.filterLabel} htmlFor="monthSelect">Month</label>
                  <select
                    id="monthSelect"
                    className={styles.filterSelect}
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                  >
                    {availableMonths.map((m) => (
                      <option key={m} value={m}>{formatMonthLabel(m)}</option>
                    ))}
                  </select>
                </div>

                {/* Branch selector — required; defaults to the first branch */}
                <div className={styles.filterGroup}>
                  <label className={styles.filterLabel} htmlFor="branchSelect">Branch</label>
                  <select
                    id="branchSelect"
                    className={styles.filterSelect}
                    value={selectedBranch}
                    onChange={(e) => setSelectedBranch(e.target.value)}
                  >
                    {salesmanData.branches.map((b) => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                </div>

                {/* Product selector — defaults to "All" */}
                <div className={styles.filterGroup}>
                  <label className={styles.filterLabel} htmlFor="productSelect">Product</label>
                  <select
                    id="productSelect"
                    className={styles.filterSelect}
                    value={selectedProduct}
                    onChange={(e) => setSelectedProduct(e.target.value)}
                  >
                    {salesmanData.products.map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>

                {/* Units / Sales toggle */}
                <div className={styles.filterGroup}>
                  <label className={styles.filterLabel}>Metric</label>
                  <div className={styles.toggleWrapper}>
                    <button
                      type="button"
                      className={`${styles.toggleBtn} ${s2Metric === 'sales' ? styles.toggleActive : ''}`}
                      onClick={() => setS2Metric('sales')}
                    >
                      Sales
                    </button>
                    <button
                      type="button"
                      className={`${styles.toggleBtn} ${s2Metric === 'units' ? styles.toggleActive : ''}`}
                      onClick={() => setS2Metric('units')}
                    >
                      Units
                    </button>
                  </div>
                </div>
              </div>

              {/* Vertical bar chart or empty state */}
              {salesmanChart ? (
                <div className={`${styles.graphCard} ${styles.fullWidth}`}>
                  <div className={styles.chartWrapper}>
                    <Bar
                      options={salesmanChart.options}
                      data={salesmanChart.chartConfig}
                      plugins={[gradientPlugins.salesman]}
                    />
                  </div>
                </div>
              ) : (
                <div className={styles.emptyState}>
                  No performance data available for the selected filters.
                </div>
              )}
            </>
          )}
        </section>

        {/* ── Section 3: Branch Sales ───────────────────────────────────── */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h3 className={styles.sectionTitle}>Branch Sales</h3>
          </div>

          {branchSalesLoading && <div className={styles.loading}>Loading branch data…</div>}
          {branchSalesError && <div className={styles.error}>{branchSalesError}</div>}

          {!branchSalesLoading && !branchSalesError && branchSalesData && (
            <>
              {/* Filter dropdowns: Month | Branch | Product | Toggle */}
              <div className={styles.filterRow}>
                {/* Month selector — drives a re-fetch of branch sales data */}
                <div className={styles.filterGroup}>
                  <label className={styles.filterLabel} htmlFor="s3MonthSelect">Month</label>
                  <select
                    id="s3MonthSelect"
                    className={styles.filterSelect}
                    value={s3Month}
                    onChange={(e) => setS3Month(e.target.value)}
                  >
                    {s3AvailableMonths.map((m) => (
                      <option key={m} value={m}>{formatMonthLabel(m)}</option>
                    ))}
                  </select>
                </div>

                {/* Branch filter — 'All' shows all branches */}
                <div className={styles.filterGroup}>
                  <label className={styles.filterLabel} htmlFor="s3BranchSelect">Branch</label>
                  <select
                    id="s3BranchSelect"
                    className={styles.filterSelect}
                    value={s3Branch}
                    onChange={(e) => setS3Branch(e.target.value)}
                  >
                    <option value="All">All Branches</option>
                    {branchSalesData.branches.map((b) => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                </div>

                {/* Product filter — 'All' shows all products */}
                <div className={styles.filterGroup}>
                  <label className={styles.filterLabel} htmlFor="s3ProductSelect">Product</label>
                  <select
                    id="s3ProductSelect"
                    className={styles.filterSelect}
                    value={s3Product}
                    onChange={(e) => setS3Product(e.target.value)}
                  >
                    {branchSalesData.products.map((p) => (
                      <option key={p} value={p}>{p === 'All' ? 'All Products' : p}</option>
                    ))}
                  </select>
                </div>

                {/* Units / Sales toggle */}
                <div className={styles.filterGroup}>
                  <label className={styles.filterLabel}>Metric</label>
                  <div className={styles.toggleWrapper}>
                    <button
                      type="button"
                      className={`${styles.toggleBtn} ${s3Metric === 'sales' ? styles.toggleActive : ''}`}
                      onClick={() => setS3Metric('sales')}
                    >
                      Sales
                    </button>
                    <button
                      type="button"
                      className={`${styles.toggleBtn} ${s3Metric === 'units' ? styles.toggleActive : ''}`}
                      onClick={() => setS3Metric('units')}
                    >
                      Units
                    </button>
                  </div>
                </div>
              </div>

              {/* Chart or empty state */}
              {branchSalesChart ? (
                <div className={`${styles.graphCard} ${styles.fullWidth}`}>
                  <div className={styles.chartWrapper}>
                    <Bar
                      options={branchSalesChart.options}
                      data={branchSalesChart.chartConfig}
                      plugins={[gradientPlugins.branch]}
                    />
                  </div>
                </div>
              ) : (
                <div className={styles.emptyState}>
                  No sales data available for the selected filters.
                </div>
              )}

              {/* Context note describing what the chart is showing */}
              <p className={styles.note}>
                {s3Branch === 'All' && s3Product === 'All' &&
                  `Showing total ${s3Metric === 'units' ? 'units sold' : 'sales'} per branch (${formatMonthLabel(s3Month)}).`}
                {s3Branch !== 'All' && s3Product === 'All' &&
                  `Showing ${s3Metric === 'units' ? 'units sold' : 'no. of sales'} per product in ${s3Branch} (${formatMonthLabel(s3Month)}).`}
                {s3Branch === 'All' && s3Product !== 'All' &&
                  `Showing ${s3Metric === 'units' ? 'units sold' : 'no. of sales'} of "${s3Product}" across all branches (${formatMonthLabel(s3Month)}).`}
                {s3Branch !== 'All' && s3Product !== 'All' &&
                  `Showing ${s3Metric === 'units' ? 'units sold' : 'no. of sales'} of "${s3Product}" in ${s3Branch} (${formatMonthLabel(s3Month)}).`}
              </p>
            </>
          )}
        </section>

      </div>
    </div>
  );
};

export default OwnerAnalyticsPage;