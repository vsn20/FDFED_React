import React, { useState, useEffect, useCallback } from 'react';
import api from '../../../api/api'; // Assuming your configured axios instance
import styles from './ManagerAnalytics.module.css'; 

const ManagerAnalyticsPage = () => {
    const [dashboardData, setDashboardData] = useState({
        cumulativeProfit: null,
        previousMonthProfit: null,
        branchName: 'N/A',
        previousMonthName: '',
        months: [], // For the dropdown
    });
    const [selectedMonthProfit, setSelectedMonthProfit] = useState('Select a month to view profit');
    const [profitStatus, setProfitStatus] = useState('na'); // 'na', 'profit', 'error'
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedMonthKey, setSelectedMonthKey] = useState(''); // YYYY-MM key

    // 1. Fetch main dashboard data (Cumulative and Previous Month)
    const fetchDashboardData = useCallback(async () => {
        setLoading(true);
        setError('');

        try {
            const res = await api.get('/manager/analytics/dashboard-data');
            setDashboardData(res.data);
            if (!res.data.branchName || res.data.branchName === 'N/A') {
                 setError('No active branch found. Dashboard data cannot be loaded.');
            }
        } catch (err) {
            console.error("Error fetching dashboard data:", err);
            setError(err.response?.data?.message || 'Failed to load dashboard data. Please try again later.');
            setDashboardData({
                cumulativeProfit: null,
                previousMonthProfit: null,
                branchName: 'N/A',
                previousMonthName: '',
                months: [],
            });
        } finally {
            setLoading(false);
        }
    }, []);

    // 2. Fetch specific monthly profit when a month is selected
    const fetchMonthlyProfit = useCallback(async (monthKey) => {
        if (!monthKey) {
            setSelectedMonthProfit('Select a month to view profit');
            setProfitStatus('na');
            return;
        }

        setSelectedMonthProfit('Calculating...');
        setProfitStatus('loading');
        
        try {
            const res = await api.get(`/manager/analytics/profit-by-month?month=${monthKey}`);
            const profit = parseFloat(res.data.profit);
            
            setSelectedMonthProfit(`₹${profit.toFixed(2)}`);
            setProfitStatus(profit >= 0 ? 'profit' : 'na'); // Check for non-negative profit

        } catch (error) {
            setSelectedMonthProfit('Error fetching profit data');
            setProfitStatus('error');
            console.error('Error fetching monthly profit:', error);
        }
    }, []);

    useEffect(() => {
        fetchDashboardData();
    }, [fetchDashboardData]);
    
    // Trigger monthly profit fetch when dropdown value changes
    useEffect(() => {
        fetchMonthlyProfit(selectedMonthKey);
    }, [selectedMonthKey, fetchMonthlyProfit]);


    // Handle Dropdown Change
    const handleMonthChange = (e) => {
        setSelectedMonthKey(e.target.value);
    };
    
    const { cumulativeProfit, previousMonthProfit, branchName, previousMonthName, months } = dashboardData;
    
    const formatProfit = (value) => {
        if (value === null || isNaN(value)) return 'N/A';
        const floatValue = parseFloat(value);
        return `₹${floatValue.toFixed(2)}`;
    };

    const getProfitClassName = (value) => {
        if (value === null || isNaN(value)) return styles.na;
        return parseFloat(value) >= 0 ? styles.profitValue : styles.na;
    }

    if (loading) {
        return <div className={styles.loading}>Loading profit data...</div>;
    }

    return (
        <div className={styles.container}>
            <div className={styles.contentArea}>
                <h1>Manager Analytics</h1>
                <p className={styles.welcomeMessage}>
                    Welcome to the dashboard for branch: <strong>{branchName}</strong>.
                </p>

                {error && <div className={styles.error}>{error}</div>}
                
                <div className={styles.profitSection} style={{ display: error ? 'none' : 'block' }}>
                    <h2>Profit Overview (As of End of {previousMonthName || 'Previous Month'})</h2>
                    
                    <div className={styles.profitCards}>
                        
                        {/* Cumulative Profit Card */}
                        <div className={styles.profitCard}>
                            <h3>Cumulative Profit</h3>
                            <p className={getProfitClassName(cumulativeProfit)}>
                                {formatProfit(cumulativeProfit)}
                            </p>
                        </div>
                        
                        {/* Previous Month Profit Card */}
                        <div className={styles.profitCard}>
                            <h3>{previousMonthName || 'Previous Month'} Profit</h3>
                            <p className={getProfitClassName(previousMonthProfit)}>
                                {formatProfit(previousMonthProfit)}
                            </p>
                        </div>
                        
                        {/* Profit By Month Card (Full Width) */}
                        <div className={`${styles.profitCard} ${styles.profitCardFull}`}>
                            <h3>Profit by Month</h3>
                            <div className={styles.monthSelectorWrapper}>
                                <select 
                                    value={selectedMonthKey} 
                                    onChange={handleMonthChange}
                                >
                                    <option value="">-- Select Month --</option>
                                    {months.map(month => (
                                        <option key={month.key} value={month.key}>
                                            {month.name}
                                        </option>
                                    ))}
                                </select>
                                <div 
                                    className={`${styles.selectedMonthProfit} ${profitStatus === 'na' || profitStatus === 'error' ? styles.na : ''}`}
                                >
                                    {selectedMonthProfit}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ManagerAnalyticsPage;