import React, { useState, useEffect, useCallback } from 'react';
import api from '../../../api/api';
import styles from './Salary.module.css';

const avatarPalette = [
    ['#d97706', '#fbbf24'],
    ['#0d6efd', '#60a5fa'],
    ['#7c3aed', '#a78bfa'],
    ['#059669', '#34d399'],
    ['#dc2626', '#f87171'],
    ['#0891b2', '#22d3ee'],
    ['#db2777', '#f9a8d4'],
    ['#ea580c', '#fb923c'],
];

const getAvatarGradient = (name = '') => {
    const idx = (name.charCodeAt(0) || 0) % avatarPalette.length;
    return `linear-gradient(135deg, ${avatarPalette[idx][0]}, ${avatarPalette[idx][1]})`;
};

const getInitials = (name = '') => {
    const parts = name.trim().split(' ');
    if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    return (parts[0]?.[0] || '?').toUpperCase();
};

const fmt = (val) =>
    Number(val || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 });

const ManagerSalaryPage = () => {
    const [monthOptions, setMonthOptions] = useState([]);
    const [selectedMonthYear, setSelectedMonthYear] = useState('');
    const [salaries, setSalaries] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchMonthOptions = async () => {
            try {
                const res = await api.get('/manager/salary/months');
                const options = res.data.monthYearOptions;
                setMonthOptions(options);
                if (options.length > 0) setSelectedMonthYear(options[options.length - 1]);
            } catch (err) {
                console.error("Error fetching month options:", err);
                setError('Failed to load salary months.');
            }
        };
        fetchMonthOptions();
    }, []);

    const fetchSalaries = useCallback(async () => {
        if (!selectedMonthYear) return;
        setLoading(true);
        setError('');
        setSalaries([]);
        try {
            const res = await api.get(`/manager/salary?monthYear=${selectedMonthYear}`);
            setSalaries(res.data.salaries);
            if (res.data.salaries.length === 0)
                setError(`No calculated salaries found for ${selectedMonthYear}.`);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to calculate salaries for the selected month.');
        } finally {
            setLoading(false);
        }
    }, [selectedMonthYear]);

    useEffect(() => { fetchSalaries(); }, [fetchSalaries]);

    const totalPayroll    = salaries.reduce((a, s) => a + Number(s.totalSalary  || 0), 0);
    const totalCommission = salaries.reduce((a, s) => a + Number(s.commission   || 0), 0);
    const avgSalary       = salaries.length > 0 ? totalPayroll / salaries.length : 0;
    const highestPaid     = salaries.length > 0 ? Math.max(...salaries.map(s => Number(s.totalSalary || 0))) : 0;

    return (
        <div className={styles.pageContainer}>
            <div className={styles.contentArea}>
                <h1 className={styles.title}>Salary Calculation</h1>

                <div className={styles.controls}>
                    <label htmlFor="month-select" className={styles.label}>Pay Month</label>
                    <select
                        id="month-select"
                        className={styles.selectInput}
                        value={selectedMonthYear}
                        onChange={(e) => setSelectedMonthYear(e.target.value)}
                        disabled={loading || monthOptions.length === 0}
                    >
                        {monthOptions.map(opt => (
                            <option key={opt} value={opt}>{opt}</option>
                        ))}
                    </select>
                </div>

                {loading && <p className={styles.loadingMessage}>Calculating salaries…</p>}
                {error   && <p className={styles.errorMessage}>{error}</p>}

                {!loading && salaries.length > 0 && (
                    <>
                        {/* Summary Strip */}
                        <div className={styles.summaryStrip}>
                            <div className={styles.summaryCard}>
                                <div className={styles.summaryIcon}>💰</div>
                                <div>
                                    <div className={styles.summaryValue}>₹{fmt(totalPayroll)}</div>
                                    <div className={styles.summaryLabel}>Total Payroll</div>
                                </div>
                            </div>
                            <div className={styles.summaryCard}>
                                <div className={styles.summaryIcon}>👥</div>
                                <div>
                                    <div className={styles.summaryValue}>{salaries.length}</div>
                                    <div className={styles.summaryLabel}>Employees</div>
                                </div>
                            </div>
                            <div className={styles.summaryCard}>
                                <div className={styles.summaryIcon}>📈</div>
                                <div>
                                    <div className={styles.summaryValue}>₹{fmt(totalCommission)}</div>
                                    <div className={styles.summaryLabel}>Total Commission</div>
                                </div>
                            </div>
                            <div className={styles.summaryCard}>
                                <div className={styles.summaryIcon}>⌀</div>
                                <div>
                                    <div className={styles.summaryValue}>₹{fmt(avgSalary)}</div>
                                    <div className={styles.summaryLabel}>Average Salary</div>
                                </div>
                            </div>
                            <div className={styles.summaryCard}>
                                <div className={styles.summaryIcon}>🏆</div>
                                <div>
                                    <div className={styles.summaryValue}>₹{fmt(highestPaid)}</div>
                                    <div className={styles.summaryLabel}>Highest Paid</div>
                                </div>
                            </div>
                        </div>

                        <h2 className={styles.dateRange}>{selectedMonthYear} — Payslips</h2>

                        <div className={styles.salaryList}>
                            {salaries.map((s, idx) => {
                                const base       = Number(s.baseSalary  || 0);
                                const commission = Number(s.commission  || 0);
                                const total      = Number(s.totalSalary || 0);
                                const basePct    = total > 0 ? (base / total) * 100 : 100;
                                const commPct    = total > 0 ? (commission / total) * 100 : 0;
                                const isTop      = total === highestPaid && highestPaid > 0;

                                return (
                                    <div
                                        key={idx}
                                        className={`${styles.payslipCard} ${isTop ? styles.payslipTop : ''}`}
                                        style={{ animationDelay: `${idx * 0.06}s` }}
                                    >
                                        {/* Left: avatar + identity */}
                                        <div className={styles.payslipLeft}>
                                            <div className={styles.payslipAvatarWrap}>
                                                <div
                                                    className={styles.payslipAvatar}
                                                    style={{ background: getAvatarGradient(s.employee_name) }}
                                                >
                                                    {getInitials(s.employee_name)}
                                                </div>
                                                {isTop && <span className={styles.topBadge}>★</span>}
                                            </div>
                                            <div className={styles.payslipIdentity}>
                                                <div className={styles.payslipName}>{s.employee_name}</div>
                                                <div className={styles.payslipMeta}>
                                                    <span className={styles.payslipId}>#{s.e_id}</span>
                                                    <span className={styles.rolePill}>{s.role}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Center: breakdown + bar */}
                                        <div className={styles.payslipCenter}>
                                            <div className={styles.breakdownRow}>
                                                <div className={styles.breakdownItem}>
                                                    <span className={styles.breakdownLabel}>Base Salary</span>
                                                    <span className={styles.breakdownValue}>₹{fmt(base)}</span>
                                                </div>
                                                <div className={styles.breakdownDivider} />
                                                <div className={styles.breakdownItem}>
                                                    <span className={styles.breakdownLabel}>Commission</span>
                                                    <span className={`${styles.breakdownValue} ${commission > 0 ? styles.commissionValue : ''}`}>
                                                        + ₹{fmt(commission)}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Proportion bar */}
                                            <div className={styles.propBarWrap}>
                                                <div className={styles.propBarTrack}>
                                                    <div
                                                        className={styles.propBarBase}
                                                        style={{ width: `${basePct}%` }}
                                                    />
                                                    {commPct > 0 && (
                                                        <div
                                                            className={styles.propBarComm}
                                                            style={{ width: `${commPct}%` }}
                                                        />
                                                    )}
                                                </div>
                                                <div className={styles.propBarLabels}>
                                                    <span>Base {basePct.toFixed(0)}%</span>
                                                    {commPct > 0 && <span>Commission {commPct.toFixed(0)}%</span>}
                                                </div>
                                            </div>

                                            {s.note && (
                                                <div className={styles.payslipNote}>⚠ {s.note}</div>
                                            )}
                                        </div>

                                        {/* Right: net pay stamp */}
                                        <div className={styles.payslipRight}>
                                            <div className={styles.totalLabel}>NET PAY</div>
                                            <div className={styles.totalAmount}>₹{fmt(total)}</div>
                                            <div className={styles.totalMonth}>{selectedMonthYear}</div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </>
                )}

                {!loading && salaries.length === 0 && !error && (
                    <div className={styles.emptyState}>
                        <div className={styles.emptyIcon}>📋</div>
                        <p>Select a month above to view payslips.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ManagerSalaryPage;