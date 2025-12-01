// path: client/src/pages/manager/Salary/ManagerSalaryPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import api from '../../../api/api'; // Assumed path to your Axios instance
import styles from './Salary.module.css'; // New CSS file

const ManagerSalaryPage = () => {
    const [monthOptions, setMonthOptions] = useState([]);
    const [selectedMonthYear, setSelectedMonthYear] = useState('');
    const [salaries, setSalaries] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // 1. Fetch available month options on component mount
    useEffect(() => {
        const fetchMonthOptions = async () => {
            try {
                const res = await api.get('/manager/salary/months');
                const options = res.data.monthYearOptions;
                setMonthOptions(options);
                // Set default to the latest available month
                if (options.length > 0) {
                    setSelectedMonthYear(options[options.length - 1]);
                }
            } catch (err) {
                console.error("Error fetching month options:", err);
                setError('Failed to load salary months.');
            }
        };
        fetchMonthOptions();
    }, []);

    // 2. Fetch salaries when selectedMonthYear changes
    const fetchSalaries = useCallback(async () => {
        if (!selectedMonthYear) return;

        setLoading(true);
        setError('');
        setSalaries([]);

        try {
            const res = await api.get(`/manager/salary?monthYear=${selectedMonthYear}`);
            setSalaries(res.data.salaries);
            if (res.data.salaries.length === 0) {
                setError(`No calculated salaries found for ${selectedMonthYear}.`);
            }
        } catch (err) {
            console.error("Error fetching salaries:", err.response?.data || err);
            setError(err.response?.data?.message || 'Failed to calculate salaries for the selected month.');
        } finally {
            setLoading(false);
        }
    }, [selectedMonthYear]);

    useEffect(() => {
        // Trigger fetch when month is selected or changes
        fetchSalaries();
    }, [fetchSalaries]);

    return (
        <div className={styles.pageContainer}>
            <div className={styles.contentArea}>
                <h1 className={styles.title}>Salary Calculation</h1>
                
                <div className={styles.controls}>
                    <label htmlFor="month-select" className={styles.label}>Select Pay Month:</label>
                    <select
                        id="month-select"
                        className={styles.selectInput}
                        value={selectedMonthYear}
                        onChange={(e) => setSelectedMonthYear(e.target.value)}
                        disabled={loading || monthOptions.length === 0}
                    >
                        {monthOptions.map(option => (
                            <option key={option} value={option}>{option}</option>
                        ))}
                    </select>
                </div>

                <h2 className={styles.dateRange}>{selectedMonthYear} Salaries</h2>

                {loading && <p className={styles.loadingMessage}>Calculating salaries...</p>}
                {error && <p className={styles.errorMessage}>{error}</p>}
                
                {!loading && salaries.length > 0 && (
                    <div className={styles.salaryList}>
                        {salaries.map((s, index) => (
                            <div key={index} className={styles.salaryEntry}>
                                <div className={styles.entryHeader}>
                                    <span className={styles.employeeName}>{s.employee_name} ({s.e_id})</span>
                                    <span className={styles.role}>{s.role}</span>
                                </div>
                                <div className={styles.entryDetails}>
                                    <div><span className={styles.label}>Base Salary:</span> ${s.baseSalary}</div>
                                    <div><span className={styles.label}>Commission ({selectedMonthYear}):</span> ${s.commission}</div>
                                    <div className={styles.total}><span className={styles.label}>Total Salary:</span> ${s.totalSalary}</div>
                                    {s.note && <div className={styles.note}><span className={styles.label}>Note:</span> {s.note}</div>}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
                {!loading && salaries.length === 0 && !error && (
                    <p className={styles.loadingMessage}>Select a month to view salary data.</p>
                )}
            </div>
        </div>
    );
};

export default ManagerSalaryPage;