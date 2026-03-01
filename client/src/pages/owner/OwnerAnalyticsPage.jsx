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
 * with a linear gradient (top → bottom).
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
  if (!m) return '';
  const [year, mon] = m.split('-');
  return new Date(Number(year), Number(mon) - 1, 1).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });
};

// Gradient plugin instances — created once outside the component
const gradientPlugins = {
  orders: makeGradientPlugin('gradient_orders', 'rgba(108, 99, 255, 0.55)', 'rgba(108, 99, 255, 0.03)'),
  sales: makeGradientPlugin('gradient_sales', 'rgba(246, 201, 14, 0.55)', 'rgba(246, 201, 14, 0.03)'),
  salesman: makeGradientPlugin('gradient_salesman', 'rgba(72, 187, 120, 0.88)', 'rgba(72, 187, 120, 0.08)'),
  branch: makeGradientPlugin('gradient_branch', 'rgba(66, 153, 225, 0.65)', 'rgba(66, 153, 225, 0.05)'),
  company: makeGradientPlugin('gradient_company', 'rgba(237, 137, 54, 0.75)', 'rgba(237, 137, 54, 0.05)'),
  product: makeGradientPlugin('gradient_product', 'rgba(159, 122, 234, 0.75)', 'rgba(159, 122, 234, 0.05)'),
};

// Tab definitions
const TABS = [
  { id: 1, label: 'Overview',            icon: '📊' },
  { id: 2, label: 'Salesman Performance',icon: '👤' },
  { id: 3, label: 'Branch Sales',        icon: '🏢' },
  { id: 4, label: 'Company Sales',       icon: '🏭' },
  { id: 5, label: 'Product Sales',       icon: '📦' },
];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

const OwnerAnalyticsPage = () => {

  // ── Active tab ──────────────────────────────────────────────────────────────
  const [activeSection, setActiveSection] = useState(1);

  // ── Section 1: Overview ─────────────────────────────────────────────────────
  const [chartData, setChartData]   = useState(null);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(null);
  const [title, setTitle]           = useState('');

  // ── Section 2: Salesman Performance ────────────────────────────────────────
  const [salesmanData, setSalesmanData]       = useState(null);
  const [salesmanLoading, setSalesmanLoading] = useState(true);
  const [salesmanError, setSalesmanError]     = useState(null);
  const [selectedBranch, setSelectedBranch]   = useState('');
  const [selectedProduct, setSelectedProduct] = useState('All');
  const [selectedMonth, setSelectedMonth]     = useState('');
  const [availableMonths, setAvailableMonths] = useState([]);
  const [salesmanInitDone, setSalesmanInitDone] = useState(false);
  const [s2Metric, setS2Metric] = useState('units');

  // ── Section 3: Branch Sales ─────────────────────────────────────────────────
  const [branchSalesData, setBranchSalesData]       = useState(null);
  const [branchSalesLoading, setBranchSalesLoading] = useState(true);
  const [branchSalesError, setBranchSalesError]     = useState(null);
  const [s3Branch, setS3Branch]   = useState('All');
  const [s3Product, setS3Product] = useState('All');
  const [s3Month, setS3Month]     = useState('');
  const [s3AvailableMonths, setS3AvailableMonths] = useState([]);
  const [s3Metric, setS3Metric] = useState('units');

  // ── Section 4: Company Sales ────────────────────────────────────────────────
  const [companySalesData, setCompanySalesData]       = useState(null);
  const [companySalesLoading, setCompanySalesLoading] = useState(false);
  const [companySalesError, setCompanySalesError]     = useState(null);
  const [s4Month, setS4Month]             = useState('');
  const [s4AvailableMonths, setS4AvailableMonths] = useState([]);
  const [s4Metric, setS4Metric]           = useState('units');
  // Flag: true once user has visited section 4 for the first time
  const [s4Triggered, setS4Triggered] = useState(false);

  // ── Section 5: Product Sales ────────────────────────────────────────────────
  const [productSalesData, setProductSalesData]       = useState(null);
  const [productSalesLoading, setProductSalesLoading] = useState(false);
  const [productSalesError, setProductSalesError]     = useState(null);
  const [s5Month, setS5Month]             = useState('');
  const [s5AvailableMonths, setS5AvailableMonths] = useState([]);
  const [s5Company, setS5Company]         = useState('All');
  const [s5Metric, setS5Metric]           = useState('units');
  // Flag: true once user has visited section 5 for the first time
  const [s5Triggered, setS5Triggered] = useState(false);

  // ---------------------------------------------------------------------------
  // Tab click handler — triggers lazy-load for sections 4 & 5
  // ---------------------------------------------------------------------------
  const handleTabClick = (sectionId) => {
    setActiveSection(sectionId);
    if (sectionId === 4 && !s4Triggered) setS4Triggered(true);
    if (sectionId === 5 && !s5Triggered) setS5Triggered(true);
  };

  // ---------------------------------------------------------------------------
  // Section 1: Overview — fetch on mount
  // ---------------------------------------------------------------------------
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

  // ---------------------------------------------------------------------------
  // Section 2: Salesman — init fetch to discover available months
  // ---------------------------------------------------------------------------
  useEffect(() => {
    const initSalesman = async () => {
      setSalesmanLoading(true);
      setSalesmanError(null);
      try {
        const response = await api.get('/owner/analytics/salesman-performance');
        if (response.data.success) {
          const data = response.data.data;
          const months = data.availableMonths || [];
          setAvailableMonths(months);
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

  // Section 2: re-fetch when selectedMonth changes
  useEffect(() => {
    if (!salesmanInitDone || !selectedMonth) return;
    const fetchSalesmanData = async () => {
      setSalesmanLoading(true);
      setSalesmanError(null);
      try {
        const response = await api.get(`/owner/analytics/salesman-performance?month=${selectedMonth}`);
        if (response.data.success) {
          const data = response.data.data;
          setSalesmanData(data);
          if (data.availableMonths?.length) setAvailableMonths(data.availableMonths);
          if (data.branches?.length > 0) {
            setSelectedBranch((prev) =>
              prev && data.branches.includes(prev) ? prev : data.branches[0]
            );
          }
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

  // ---------------------------------------------------------------------------
  // Section 3: Branch Sales — phase-1 / phase-2 pattern
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (s3Month === '') {
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
            setS3Month(best);
          }
        } catch (err) {
          console.error('Error during branch-sales init:', err);
          setBranchSalesError('Failed to load branch sales data');
          setBranchSalesLoading(false);
        }
      };
      init();
      return;
    }

    let cancelled = false;
    const fetchBranchSales = async () => {
      setBranchSalesLoading(true);
      setBranchSalesError(null);
      try {
        const response = await api.get(`/owner/analytics/branch-sales?month=${s3Month}`);
        if (!cancelled && response.data.success) {
          const data = response.data.data;
          setBranchSalesData(data);
          if (data.availableMonths?.length) setS3AvailableMonths(data.availableMonths);
          setS3Branch((prev) => prev !== 'All' && !data.branches.includes(prev) ? 'All' : prev);
          setS3Product((prev) => prev !== 'All' && !data.products.includes(prev) ? 'All' : prev);
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
    return () => { cancelled = true; };
  }, [s3Month]);

  // ---------------------------------------------------------------------------
  // Section 4: Company Sales — lazy-loaded on first tab visit
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (!s4Triggered) return;

    // Phase 1: discover available months
    if (s4Month === '') {
      const init = async () => {
        setCompanySalesLoading(true);
        try {
          const res = await api.get('/owner/analytics/company-sales');
          if (res.data.success) {
            const months = res.data.data.availableMonths || [];
            if (months.length) setS4AvailableMonths(months);
            const best = months.length > 0 ? months[0] : (() => {
              const n = new Date();
              return `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, '0')}`;
            })();
            setS4Month(best); // triggers Phase 2
          }
        } catch (err) {
          console.error('Error during company-sales init:', err);
          setCompanySalesError('Failed to load company sales data');
          setCompanySalesLoading(false);
        }
      };
      init();
      return;
    }

    // Phase 2: fetch month-filtered data
    let cancelled = false;
    const fetchCompanySales = async () => {
      setCompanySalesLoading(true);
      setCompanySalesError(null);
      try {
        const res = await api.get(`/owner/analytics/company-sales?month=${s4Month}`);
        if (!cancelled && res.data.success) {
          setCompanySalesData(res.data.data);
          if (res.data.data.availableMonths?.length)
            setS4AvailableMonths(res.data.data.availableMonths);
        }
      } catch (err) {
        if (!cancelled) {
          console.error('Error fetching company sales data:', err);
          setCompanySalesError('Failed to load company sales data');
        }
      } finally {
        if (!cancelled) setCompanySalesLoading(false);
      }
    };
    fetchCompanySales();
    return () => { cancelled = true; };
  }, [s4Triggered, s4Month]);

  // ---------------------------------------------------------------------------
  // Section 5: Product Sales — lazy-loaded on first tab visit, re-fetched on
  //            month OR company filter change
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (!s5Triggered) return;

    // Phase 1: discover available months
    if (s5Month === '') {
      const init = async () => {
        setProductSalesLoading(true);
        try {
          const res = await api.get('/owner/analytics/product-sales');
          if (res.data.success) {
            const months = res.data.data.availableMonths || [];
            if (months.length) setS5AvailableMonths(months);
            const best = months.length > 0 ? months[0] : (() => {
              const n = new Date();
              return `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, '0')}`;
            })();
            setS5Month(best); // triggers Phase 2
          }
        } catch (err) {
          console.error('Error during product-sales init:', err);
          setProductSalesError('Failed to load product sales data');
          setProductSalesLoading(false);
        }
      };
      init();
      return;
    }

    // Phase 2: fetch filtered data
    let cancelled = false;
    const fetchProductSales = async () => {
      setProductSalesLoading(true);
      setProductSalesError(null);
      try {
        const params = new URLSearchParams({ month: s5Month });
        if (s5Company && s5Company !== 'All') params.set('company', s5Company);
        const res = await api.get(`/owner/analytics/product-sales?${params.toString()}`);
        if (!cancelled && res.data.success) {
          setProductSalesData(res.data.data);
          if (res.data.data.availableMonths?.length)
            setS5AvailableMonths(res.data.data.availableMonths);
        }
      } catch (err) {
        if (!cancelled) {
          console.error('Error fetching product sales data:', err);
          setProductSalesError('Failed to load product sales data');
        }
      } finally {
        if (!cancelled) setProductSalesLoading(false);
      }
    };
    fetchProductSales();
    return () => { cancelled = true; };
  // s5Company change should always re-fetch (server-side filter)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [s5Triggered, s5Month, s5Company]);

  // ---------------------------------------------------------------------------
  // Chart config builders
  // ---------------------------------------------------------------------------

  const buildOverviewCharts = () => {
    if (!chartData) return null;

    const ordersData = {
      labels: chartData.days,
      datasets: [{
        label: 'Daily Orders',
        data: chartData.orderCounts,
        borderColor: '#6c63ff',
        backgroundColor: 'rgba(108, 99, 255, 0.25)',
        fill: true,
        tension: 0.4,
      }],
    };

    const salesData = {
      labels: chartData.days,
      datasets: [{
        label: 'Daily Sales',
        data: chartData.saleCounts,
        borderColor: '#d4a017',
        backgroundColor: 'rgba(246, 201, 14, 0.22)',
        fill: true,
        tension: 0.4,
      }],
    };

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

    const names  = productPerf.map((p) => p.name);
    const values = productPerf.map((p) => isUnits ? p.units : p.sales);

    const chartConfig = {
      labels: names,
      datasets: [{
        label: yLabel,
        data: values,
        backgroundColor: 'rgba(72, 187, 120, 0.6)',
        borderColor: 'rgba(56, 161, 105, 1)',
        borderWidth: 1.5,
        borderRadius: 8,
      }],
    };

    const chartTitle = `${selectedBranch} — ${selectedProduct === 'All' ? 'All Products' : selectedProduct}`;
    const baseOptions = createModernOptions(chartTitle, yLabel);
    const options = {
      ...baseOptions,
      scales: {
        ...baseOptions.scales,
        x: { ...baseOptions.scales.x, ticks: { ...baseOptions.scales.x.ticks, maxRotation: 45, minRotation: 0 } },
        y: { ...baseOptions.scales.y, ticks: { ...baseOptions.scales.y.ticks, stepSize: 1 } },
      },
    };
    return { chartConfig, options };
  };

  const buildBranchSalesChart = () => {
    if (!branchSalesData) return null;
    const { branchSales, branches } = branchSalesData;
    const isUnits = s3Metric === 'units';

    const bothAll      = s3Branch === 'All' && s3Product === 'All';
    const branchOnly   = s3Branch !== 'All' && s3Product === 'All';
    const productOnly  = s3Branch === 'All' && s3Product !== 'All';

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
        backgroundColor: 'rgba(66, 153, 225, 0.6)',
        borderColor: 'rgba(43, 108, 176, 1)',
        borderWidth: 1.5,
        borderRadius: 8,
      }],
    };

    return { chartConfig, options: createModernOptions(chartTitle, yLabel) };
  };

  // Section 4: Company Sales chart
  const buildCompanySalesChart = () => {
    if (!companySalesData) return null;
    const { companies, companySales } = companySalesData;
    const isUnits = s4Metric === 'units';

    const labels = companies.filter((c) => companySales[c]);
    const values = labels.map((c) => isUnits ? companySales[c].totalUnits : companySales[c].totalSales);

    if (values.length === 0 || values.every((v) => v === 0)) return null;

    const yLabel    = isUnits ? 'Units Sold' : 'No. of Sales';
    const chartTitle = isUnits ? 'Total Units Sold per Company' : 'Total Sales per Company';

    const chartConfig = {
      labels,
      datasets: [{
        label: yLabel,
        data: values,
        backgroundColor: 'rgba(237, 137, 54, 0.7)',
        borderColor: 'rgba(197, 97, 14, 1)',
        borderWidth: 1.5,
        borderRadius: 8,
      }],
    };

    const baseOptions = createModernOptions(chartTitle, yLabel);
    const options = {
      ...baseOptions,
      scales: {
        ...baseOptions.scales,
        x: { ...baseOptions.scales.x, ticks: { ...baseOptions.scales.x.ticks, maxRotation: 45, minRotation: 0 } },
        y: { ...baseOptions.scales.y, ticks: { ...baseOptions.scales.y.ticks, stepSize: 1 } },
      },
    };

    return { chartConfig, options };
  };

  // Section 5: Product Sales chart
  const buildProductSalesChart = () => {
    if (!productSalesData) return null;
    const { productSales } = productSalesData;
    const isUnits = s5Metric === 'units';

    const labels = Object.keys(productSales);
    const values = labels.map((p) => isUnits ? productSales[p].totalUnits : productSales[p].totalSales);

    if (labels.length === 0 || values.every((v) => v === 0)) return null;

    const yLabel     = isUnits ? 'Units Sold' : 'No. of Sales';
    const chartTitle = s5Company === 'All'
      ? (isUnits ? 'Units Sold per Product' : 'Sales per Product')
      : (isUnits ? `Units Sold per Product — ${s5Company}` : `Sales per Product — ${s5Company}`);

    const chartConfig = {
      labels,
      datasets: [{
        label: yLabel,
        data: values,
        backgroundColor: 'rgba(159, 122, 234, 0.7)',
        borderColor: 'rgba(107, 70, 193, 1)',
        borderWidth: 1.5,
        borderRadius: 8,
      }],
    };

    const baseOptions = createModernOptions(chartTitle, yLabel);
    const options = {
      ...baseOptions,
      scales: {
        ...baseOptions.scales,
        x: { ...baseOptions.scales.x, ticks: { ...baseOptions.scales.x.ticks, maxRotation: 45, minRotation: 0 } },
        y: { ...baseOptions.scales.y, ticks: { ...baseOptions.scales.y.ticks, stepSize: 1 } },
      },
    };

    return { chartConfig, options };
  };

  // ---------------------------------------------------------------------------
  // Derived chart configs
  // ---------------------------------------------------------------------------
  const overviewCharts    = buildOverviewCharts();
  const salesmanChart     = buildSalesmanChart();
  const branchSalesChart  = buildBranchSalesChart();
  const companySalesChart = buildCompanySalesChart();
  const productSalesChart = buildProductSalesChart();

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------
  return (
    <div className={styles.container}>
      <h2>Owner Dashboard</h2>

      <div className={styles.contentArea}>

        {/* ── Tab Navigation Bar ──────────────────────────────────────── */}
        <nav className={styles.tabBar} role="tablist" aria-label="Analytics sections">
          {TABS.map((tab) => (
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

        {/* ── Section 1: Overview ─────────────────────────────────────── */}
        {activeSection === 1 && (
          <section className={styles.section} role="tabpanel">
            <div className={styles.sectionHeader}>
              <h3 className={styles.sectionTitle}>Overview</h3>
              {title && (
                <p className={styles.subtitle}>
                  Period: <strong>{title}</strong>
                </p>
              )}
            </div>

            {loading && <div className={styles.loading}>Loading overview…</div>}
            {error   && <div className={styles.error}>{error}</div>}

            {!loading && !error && overviewCharts && (
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
                  Note: Profits shown are for sales only. Realized profit (after salaries) can be verified from the Profits page.
                </p>
              </>
            )}
          </section>
        )}

        {/* ── Section 2: Salesman Performance ─────────────────────────── */}
        {activeSection === 2 && (
          <section className={styles.section} role="tabpanel">
            <div className={styles.sectionHeader}>
              <h3 className={styles.sectionTitle}>Salesman Performance</h3>
            </div>

            {salesmanLoading && <div className={styles.loading}>Loading salesman data…</div>}
            {salesmanError   && <div className={styles.error}>{salesmanError}</div>}

            {!salesmanLoading && !salesmanError && salesmanData && (
              <>
                <div className={styles.filterRow}>
                  <div className={styles.filterGroup}>
                    <label className={styles.filterLabel} htmlFor="monthSelect">Month</label>
                    <select id="monthSelect" className={styles.filterSelect} value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)}>
                      {availableMonths.map((m) => (
                        <option key={m} value={m}>{formatMonthLabel(m)}</option>
                      ))}
                    </select>
                  </div>
                  <div className={styles.filterGroup}>
                    <label className={styles.filterLabel} htmlFor="branchSelect">Branch</label>
                    <select id="branchSelect" className={styles.filterSelect} value={selectedBranch} onChange={(e) => setSelectedBranch(e.target.value)}>
                      {salesmanData.branches.map((b) => (
                        <option key={b} value={b}>{b}</option>
                      ))}
                    </select>
                  </div>
                  <div className={styles.filterGroup}>
                    <label className={styles.filterLabel} htmlFor="productSelect">Product</label>
                    <select id="productSelect" className={styles.filterSelect} value={selectedProduct} onChange={(e) => setSelectedProduct(e.target.value)}>
                      {salesmanData.products.map((p) => (
                        <option key={p} value={p}>{p}</option>
                      ))}
                    </select>
                  </div>
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

        {/* ── Section 3: Branch Sales ───────────────────────────────────── */}
        {activeSection === 3 && (
          <section className={styles.section} role="tabpanel">
            <div className={styles.sectionHeader}>
              <h3 className={styles.sectionTitle}>Branch Sales</h3>
            </div>

            {branchSalesLoading && <div className={styles.loading}>Loading branch data…</div>}
            {branchSalesError   && <div className={styles.error}>{branchSalesError}</div>}

            {!branchSalesLoading && !branchSalesError && branchSalesData && (
              <>
                <div className={styles.filterRow}>
                  <div className={styles.filterGroup}>
                    <label className={styles.filterLabel} htmlFor="s3MonthSelect">Month</label>
                    <select id="s3MonthSelect" className={styles.filterSelect} value={s3Month} onChange={(e) => setS3Month(e.target.value)}>
                      {s3AvailableMonths.map((m) => (
                        <option key={m} value={m}>{formatMonthLabel(m)}</option>
                      ))}
                    </select>
                  </div>
                  <div className={styles.filterGroup}>
                    <label className={styles.filterLabel} htmlFor="s3BranchSelect">Branch</label>
                    <select id="s3BranchSelect" className={styles.filterSelect} value={s3Branch} onChange={(e) => setS3Branch(e.target.value)}>
                      <option value="All">All Branches</option>
                      {branchSalesData.branches.map((b) => (
                        <option key={b} value={b}>{b}</option>
                      ))}
                    </select>
                  </div>
                  <div className={styles.filterGroup}>
                    <label className={styles.filterLabel} htmlFor="s3ProductSelect">Product</label>
                    <select id="s3ProductSelect" className={styles.filterSelect} value={s3Product} onChange={(e) => setS3Product(e.target.value)}>
                      {branchSalesData.products.map((p) => (
                        <option key={p} value={p}>{p === 'All' ? 'All Products' : p}</option>
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

                {branchSalesChart ? (
                  <div className={`${styles.graphCard} ${styles.fullWidth}`}>
                    <div className={styles.chartWrapper}>
                      <Bar options={branchSalesChart.options} data={branchSalesChart.chartConfig} plugins={[gradientPlugins.branch]} />
                    </div>
                  </div>
                ) : (
                  <div className={styles.emptyState}>No sales data available for the selected filters.</div>
                )}

                <p className={styles.note}>
                  {s3Branch === 'All' && s3Product === 'All' && `Showing total ${s3Metric === 'units' ? 'units sold' : 'sales'} per branch (${formatMonthLabel(s3Month)}).`}
                  {s3Branch !== 'All' && s3Product === 'All' && `Showing ${s3Metric === 'units' ? 'units sold' : 'no. of sales'} per product in ${s3Branch} (${formatMonthLabel(s3Month)}).`}
                  {s3Branch === 'All' && s3Product !== 'All' && `Showing ${s3Metric === 'units' ? 'units sold' : 'no. of sales'} of "${s3Product}" across all branches (${formatMonthLabel(s3Month)}).`}
                  {s3Branch !== 'All' && s3Product !== 'All' && `Showing ${s3Metric === 'units' ? 'units sold' : 'no. of sales'} of "${s3Product}" in ${s3Branch} (${formatMonthLabel(s3Month)}).`}
                </p>
              </>
            )}
          </section>
        )}

        {/* ── Section 4: Company Sales ──────────────────────────────────── */}
        {activeSection === 4 && (
          <section className={styles.section} role="tabpanel">
            <div className={styles.sectionHeader}>
              <h3 className={styles.sectionTitle}>Company Sales</h3>
            </div>

            {companySalesLoading && <div className={styles.loading}>Loading company data…</div>}
            {companySalesError   && <div className={styles.error}>{companySalesError}</div>}

            {!companySalesLoading && !companySalesError && companySalesData && (
              <>
                <div className={styles.filterRow}>
                  {/* Month filter */}
                  <div className={styles.filterGroup}>
                    <label className={styles.filterLabel} htmlFor="s4MonthSelect">Month</label>
                    <select
                      id="s4MonthSelect"
                      className={styles.filterSelect}
                      value={s4Month}
                      onChange={(e) => setS4Month(e.target.value)}
                    >
                      {s4AvailableMonths.map((m) => (
                        <option key={m} value={m}>{formatMonthLabel(m)}</option>
                      ))}
                    </select>
                  </div>

                  {/* Sales / Units toggle */}
                  <div className={styles.filterGroup}>
                    <label className={styles.filterLabel}>Metric</label>
                    <div className={styles.toggleWrapper}>
                      <button
                        type="button"
                        className={`${styles.toggleBtn} ${s4Metric === 'sales' ? styles.toggleActive : ''}`}
                        onClick={() => setS4Metric('sales')}
                      >
                        Sales
                      </button>
                      <button
                        type="button"
                        className={`${styles.toggleBtn} ${s4Metric === 'units' ? styles.toggleActive : ''}`}
                        onClick={() => setS4Metric('units')}
                      >
                        Units
                      </button>
                    </div>
                  </div>
                </div>

                {companySalesChart ? (
                  <div className={`${styles.graphCard} ${styles.fullWidth}`}>
                    <div className={styles.chartWrapper}>
                      <Bar
                        options={companySalesChart.options}
                        data={companySalesChart.chartConfig}
                        plugins={[gradientPlugins.company]}
                      />
                    </div>
                  </div>
                ) : (
                  <div className={styles.emptyState}>No company sales data available for the selected month.</div>
                )}

                <p className={styles.note}>
                  Showing {s4Metric === 'units' ? 'total units sold' : 'total no. of sales'} per company ({formatMonthLabel(s4Month)}).
                  {s4Metric === 'units' && ' Units reflect the sum of quantities across all transactions.'}
                </p>
              </>
            )}
          </section>
        )}

        {/* ── Section 5: Product Sales ──────────────────────────────────── */}
        {activeSection === 5 && (
          <section className={styles.section} role="tabpanel">
            <div className={styles.sectionHeader}>
              <h3 className={styles.sectionTitle}>Product Sales</h3>
            </div>

            {productSalesLoading && <div className={styles.loading}>Loading product data…</div>}
            {productSalesError   && <div className={styles.error}>{productSalesError}</div>}

            {!productSalesLoading && !productSalesError && productSalesData && (
              <>
                <div className={styles.filterRow}>
                  {/* Month filter */}
                  <div className={styles.filterGroup}>
                    <label className={styles.filterLabel} htmlFor="s5MonthSelect">Month</label>
                    <select
                      id="s5MonthSelect"
                      className={styles.filterSelect}
                      value={s5Month}
                      onChange={(e) => setS5Month(e.target.value)}
                    >
                      {s5AvailableMonths.map((m) => (
                        <option key={m} value={m}>{formatMonthLabel(m)}</option>
                      ))}
                    </select>
                  </div>

                  {/* Company filter — filters x-axis to products from that company */}
                  <div className={styles.filterGroup}>
                    <label className={styles.filterLabel} htmlFor="s5CompanySelect">Company</label>
                    <select
                      id="s5CompanySelect"
                      className={styles.filterSelect}
                      value={s5Company}
                      onChange={(e) => setS5Company(e.target.value)}
                    >
                      {productSalesData.companies.map((c) => (
                        <option key={c} value={c}>{c === 'All' ? 'All Companies' : c}</option>
                      ))}
                    </select>
                  </div>

                  {/* Sales / Units toggle */}
                  <div className={styles.filterGroup}>
                    <label className={styles.filterLabel}>Metric</label>
                    <div className={styles.toggleWrapper}>
                      <button
                        type="button"
                        className={`${styles.toggleBtn} ${s5Metric === 'sales' ? styles.toggleActive : ''}`}
                        onClick={() => setS5Metric('sales')}
                      >
                        Sales
                      </button>
                      <button
                        type="button"
                        className={`${styles.toggleBtn} ${s5Metric === 'units' ? styles.toggleActive : ''}`}
                        onClick={() => setS5Metric('units')}
                      >
                        Units
                      </button>
                    </div>
                  </div>
                </div>

                {productSalesChart ? (
                  <div className={`${styles.graphCard} ${styles.fullWidth}`}>
                    <div className={styles.chartWrapper}>
                      <Bar
                        options={productSalesChart.options}
                        data={productSalesChart.chartConfig}
                        plugins={[gradientPlugins.product]}
                      />
                    </div>
                  </div>
                ) : (
                  <div className={styles.emptyState}>No product sales data available for the selected filters.</div>
                )}

                <p className={styles.note}>
                  {s5Company === 'All'
                    ? `Showing ${s5Metric === 'units' ? 'units sold' : 'no. of sales'} for all products across all companies (${formatMonthLabel(s5Month)}).`
                    : `Showing ${s5Metric === 'units' ? 'units sold' : 'no. of sales'} for products under "${s5Company}" only (${formatMonthLabel(s5Month)}).`
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

export default OwnerAnalyticsPage;