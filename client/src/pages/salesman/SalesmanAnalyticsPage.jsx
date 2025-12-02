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
import styles from './SalesmanAnalyticsPage.module.css';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const SalesmanAnalyticsPage = () => {
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [title, setTitle] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get('/salesman/analytics/data');
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

  if (loading) return <div className={styles.loading}>Loading Analytics...</div>;
  if (error) return <div className={styles.error}>{error}</div>;

  // --- Chart Configurations ---

  // 1. Sales Count Chart Data
  const salesChartData = {
    labels: chartData.days, // Now contains dates like "Oct 14"
    datasets: [
      {
        label: 'Sales Count',
        data: chartData.saleCounts,
        backgroundColor: 'rgba(212, 177, 6, 0.7)', // Gold
        borderColor: '#d4b106',
        borderWidth: 1,
      },
    ],
  };

  const salesOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top' },
      title: { display: true, text: 'Daily Sales Volume' },
    },
    scales: {
        y: { beginAtZero: true, ticks: { stepSize: 1 } },
        x: { ticks: { maxRotation: 45, minRotation: 45 } } // Rotate dates for better readability
    }
  };

  // 2. Profit Chart Data
  const profitChartData = {
    labels: chartData.days,
    datasets: [
      {
        label: 'Profit (₹)',
        data: chartData.profitTotals,
        // Green for profit, Red for loss
        backgroundColor: chartData.profitTotals.map(val => val >= 0 ? 'rgba(46, 204, 113, 0.7)' : 'rgba(231, 76, 60, 0.7)'),
        borderColor: chartData.profitTotals.map(val => val >= 0 ? '#2ecc71' : '#e74c3c'),
        borderWidth: 1,
      },
    ],
  };

  const profitOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top' },
      title: { display: true, text: 'Daily Financial Performance' },
    },
    scales: {
        y: { beginAtZero: true },
        x: { ticks: { maxRotation: 45, minRotation: 45 } }
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.contentArea}>
        <h1>Salesman Dashboard</h1>
        <p className={styles.subtitle}>
          Performance Overview: <strong>{title}</strong>
        </p>

        <div className={styles.graphContainer}>
          {/* Sales Graph */}
          <div className={styles.graphCard}>
            <div className={styles.chartWrapper}>
                <Bar options={salesOptions} data={salesChartData} />
            </div>
          </div>

          {/* Profit Graph */}
          <div className={styles.graphCard}>
            <div className={styles.chartWrapper}>
                 <Bar options={profitOptions} data={profitChartData} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalesmanAnalyticsPage;