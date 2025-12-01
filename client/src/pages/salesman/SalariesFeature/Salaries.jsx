import React, { useState, useEffect } from 'react';
import api from '../../../api/api'; // Path remains 3 levels up
import styles from './Salaries.module.css';

const Salaries = () => {
  const [salaryData, setSalaryData] = useState(null);
  const [options, setOptions] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchSalary = async (monthYear = '') => {
    try {
      setLoading(true);
      // Construct URL query
      const url = monthYear 
        ? `/salesman/salaries?monthYear=${monthYear}` 
        : '/salesman/salaries';
        
      const res = await api.get(url);
      
      if (res.data.success) {
        setSalaryData(res.data.data);
        setOptions(res.data.monthYearOptions);
        
        // Update selected month if provided or returned by API
        if (monthYear) {
             setSelectedMonth(monthYear);
        } else if (res.data.selectedMonthYear) {
            setSelectedMonth(res.data.selectedMonthYear);
        }
        setError('');
      }
    } catch (err) {
      console.error("Error fetching salary:", err);
      setError(err.response?.data?.message || "Failed to load salary data");
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchSalary();
  }, []);

  const handleGenerate = () => {
    if (selectedMonth) {
      fetchSalary(selectedMonth);
    }
  };

  if (loading && !salaryData) {
    return <div style={{ padding: '20px', textAlign: 'center' }}>Loading...</div>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.contentArea}>
        <div className={styles.header}>
            <h1>Salary Details</h1>
            {error && <p className={styles.errorMessage}>{error}</p>}
        </div>

        <div className={styles.controlsContainer}>
            <div className={styles.dateTitle}>
                {selectedMonth.replace('-', ' ')} Salary
            </div>
            <div className={styles.controls}>
                <select 
                    className={styles.selectInput}
                    value={selectedMonth} 
                    onChange={(e) => setSelectedMonth(e.target.value)}
                >
                    {options.map(opt => (
                        <option key={opt} value={opt}>
                            {opt.replace('-', ' ')}
                        </option>
                    ))}
                </select>
                <button className={styles.generateBtn} onClick={handleGenerate}>
                    Generate
                </button>
            </div>
        </div>

        {salaryData ? (
             <div className={styles.salaryCard}>
                <div className={styles.salaryRow}>
                    <span className={styles.label}>Employee Name:</span>
                    <span className={styles.value}>{salaryData.employee_name}</span>
                </div>
                <div className={styles.salaryRow}>
                    <span className={styles.label}>Base Salary:</span>
                    <span className={styles.value}>${salaryData.base_salary.toFixed(2)}</span>
                </div>
                <div className={styles.salaryRow}>
                    <span className={styles.label}>Commission:</span>
                    <span className={styles.value}>${salaryData.commission.toFixed(2)}</span>
                </div>
                <div className={styles.divider}></div>
                <div className={`${styles.salaryRow} ${styles.totalRow}`}>
                    <span className={styles.label}>Total Salary:</span>
                    <span className={styles.value}>${salaryData.total_salary.toFixed(2)}</span>
                </div>
                
                {salaryData.note && (
                    <div className={styles.note}>
                        Note: {salaryData.note}
                    </div>
                )}
             </div>
        ) : (
            <p style={{ textAlign: 'center', marginTop: '20px' }}>No salary data available.</p>
        )}
      </div>
    </div>
  );
};

export default Salaries;