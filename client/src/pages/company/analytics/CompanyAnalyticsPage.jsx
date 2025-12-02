// path: client/src/pages/company/analytics/CompanyAnalyticsPage.jsx
import React, { useState, useEffect, useContext } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import AuthContext from '../../../context/AuthContext'; // Assuming AuthContext provides 'token'
import styles from './Analytics.module.css'; // Using a CSS module for styling

// Register Chart.js components needed for Line charts (crucial)
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

const API_BASE_URL = 'http://localhost:5001/api'; // Update if your backend runs on a different port/URL

const CompanyAnalyticsPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { token } = useContext(AuthContext) || { token: 'mock-token' }; // Mock token if context is not fully implemented

  useEffect(() => {
    fetchDashboardData();
  }, [token]);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/company/analytics/data`, {
        headers: {
          'x-auth-token': token, // Standard header for JWT
          'Authorization': `Bearer ${token}` // Common practice for Authorization
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      if (result.error) {
        throw new Error(result.error);
      }
      
      setData(result);
      
    } catch (err) {
      console.error('Fetch error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className={styles.loading}>Loading Dashboard Data...</div>;
  if (error) return <div className={styles.error}>Error: {error}</div>;
  if (!data || data.months.length === 0) return <div className={styles.noData}>No analytics data available for the last 6 months.</div>;


  // Chart Data Configuration (Based on the data returned from the backend)
  const orderChartData = {
    labels: data.months,
    datasets: [
      {
        label: 'Number of Orders',
        data: data.orderCounts,
        borderColor: '#007bff', // Blue
        backgroundColor: 'rgba(0, 123, 255, 0.3)',
        tension: 0.3,
        fill: true,
      },
    ],
  };

  const salesChartData = {
    labels: data.months,
    datasets: [
      {
        label: 'Number of Sales',
        data: data.saleCounts,
        borderColor: '#28a745', // Green
        backgroundColor: 'rgba(40, 167, 69, 0.3)',
        tension: 0.3,
        fill: true,
      },
    ],
  };

  // Chart Options Configuration (based on your EJS file logic)
  const chartOptions = (titleText, yAxisLabel) => ({
    responsive: true,
    maintainAspectRatio: false, // Allows charts to take up full container space
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: titleText,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: yAxisLabel,
        },
        ticks: {
          stepSize: 1,
        }
      },
      x: {
        title: {
          display: true,
          text: 'Month',
        }
      }
    }
  });

  return (
    <div className={styles.dashboardContainer}>
      <h1 className={styles.header}>Company Analytics Dashboard</h1>
      <p className={styles.subtitle}>Monthly Orders and Sales Data (Last 6 Months)</p>

      {/* Summary Cards */}
      <div className={styles.summaryCards}>
        <div className={styles.summaryCard}>
          <h3>Total Orders</h3>
          <p>{data.orderCounts.reduce((sum, count) => sum + count, 0)}</p>
        </div>
        <div className={styles.summaryCard}>
          <h3>Total Sales</h3>
          <p>{data.saleCounts.reduce((sum, count) => sum + count, 0)}</p>
        </div>
      </div>

      {/* Chart Grid */}
      <div className={styles.chartGrid}>
        <div className={styles.chartCard}>
            <h3>Order Trend</h3>
            <div className={styles.chartWrapper}>
              <Line 
                data={orderChartData} 
                options={chartOptions('Monthly Orders Trend', 'Number of Orders')} 
              />
            </div>
        </div>
        <div className={styles.chartCard}>
            <h3>Sales Trend</h3>
            <div className={styles.chartWrapper}>
              <Line 
                data={salesChartData} 
                options={chartOptions('Monthly Sales Trend', 'Number of Sales')} 
              />
            </div>
        </div>
      </div>
    </div>
  );
};

export default CompanyAnalyticsPage;