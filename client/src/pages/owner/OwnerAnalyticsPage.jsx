import React, { useEffect, useState } from 'react';
import api from '../../api/api';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import styles from './OwnerAnalyticsPage.module.css';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const OwnerAnalyticsPage = () => {
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [title, setTitle] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get('/owner/analytics/data');
        if (response.data.success) {
          setChartData(response.data.data);
          setTitle(response.data.data.title);
        }
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        setError("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <div className={styles.loading}>Loading Dashboard...</div>;
  if (error) return <div className={styles.error}>{error}</div>;

  // --- Chart Configurations ---

  const commonOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top' },
    },
    scales: { 
      y: { beginAtZero: true, ticks: { stepSize: 1 } },
      x: { ticks: { maxRotation: 45, minRotation: 45 } } // Rotate dates
    }
  };

  // 1. Orders Chart
  const ordersData = {
    labels: chartData.days,
    datasets: [{
      label: 'Daily Orders',
      data: chartData.orderCounts,
      backgroundColor: 'rgba(45, 52, 54, 0.7)', // Dark Grey
      borderColor: '#2d3436',
      borderWidth: 1,
    }]
  };

  const ordersOptions = {
    ...commonOptions,
    plugins: { ...commonOptions.plugins, title: { display: true, text: 'Order Volume' } }
  };

  // 2. Sales Chart
  const salesData = {
    labels: chartData.days,
    datasets: [{
      label: 'Daily Sales',
      data: chartData.saleCounts,
      backgroundColor: 'rgba(212, 177, 6, 0.7)', // Gold
      borderColor: '#d4b106',
      borderWidth: 1,
    }]
  };

  const salesOptions = {
    ...commonOptions,
    plugins: { ...commonOptions.plugins, title: { display: true, text: 'Sales Volume' } }
  };

  // 3. Profit/Loss Chart
  const profitData = {
    labels: chartData.days,
    datasets: [{
      label: 'Profit/Loss ($)',
      data: chartData.profitLossTotals,
      backgroundColor: chartData.profitLossTotals.map(val => val >= 0 ? 'rgba(46, 204, 113, 0.7)' : 'rgba(231, 76, 60, 0.7)'),
      borderColor: chartData.profitLossTotals.map(val => val >= 0 ? '#2ecc71' : '#e74c3c'),
      borderWidth: 1,
    }]
  };

  const profitOptions = {
    ...commonOptions,
    scales: { 
      y: { beginAtZero: true }, // No stepSize for money
      x: { ticks: { maxRotation: 45, minRotation: 45 } }
    },
    plugins: { ...commonOptions.plugins, title: { display: true, text: 'Financial Performance' } }
  };

  return (
    <div className={styles.container}>
      <h2>Owner Dashboard</h2>
      <div className={styles.contentArea}>
        
        <p className={styles.subtitle}>
          Overview: <strong>{title}</strong>
        </p>

        <div className={styles.graphGrid}>
          {/* Orders Graph */}
          <div className={styles.graphCard}>
            <div className={styles.chartWrapper}>
                <Bar options={ordersOptions} data={ordersData} />
            </div>
          </div>

          {/* Sales Graph */}
          <div className={styles.graphCard}>
            <div className={styles.chartWrapper}>
                <Bar options={salesOptions} data={salesData} />
            </div>
          </div>

          {/* Profit Graph (Full Width) */}
          <div className={`${styles.graphCard} ${styles.fullWidth}`}>
            <div className={styles.chartWrapper}>
                <Bar options={profitOptions} data={profitData} />
            </div>
          </div>
        </div>
        
        <p className={styles.note}>
            Note: Profits shown are for sales only. Realized profit (after salaries) can be verified from the Profits page.
        </p>
      </div>
    </div>
  );
};

export default OwnerAnalyticsPage;