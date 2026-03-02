import React, { useState, useEffect, useCallback } from 'react';
import api from '../../../api/api';
import styles from './Salary.module.css'; // Using the Midnight Ledger module CSS

const avatarPalette = [
    ['#d97706', '#fbbf24'], ['#0d6efd', '#60a5fa'],
    ['#7c3aed', '#a78bfa'], ['#059669', '#34d399'],
    ['#dc2626', '#f87171'], ['#0891b2', '#22d3ee'],
    ['#db2777', '#f9a8d4'], ['#ea580c', '#fb923c'],
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

const fmt = (val) => Number(val || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 });

const SalaryList = () => {
    const [monthOptions, setMonthOptions] = useState([]);
    const [selectedMonth, setSelectedMonth] = useState('');
    const [salaries, setSalaries] = useState([]);
    const [filteredSalaries, setFilteredSalaries] = useState([]);
    const [branches, setBranches] = useState([]);
    const [selectedBranch, setSelectedBranch] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(false);

    // Initialize Options
    useEffect(() => {
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const currentDate = new Date();
        const options = [];
        for (let i = 0; i <= 6; i++) {
            const d = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
            options.push(`${monthNames[d.getMonth()]}-${d.getFullYear()}`);
        }
        setMonthOptions(options);
        if (options.length > 0) setSelectedMonth(options[0]);

        const fetchBranches = async () => {
            try {
                const res = await api.get('/owner/salaries/branches');
                setBranches(res.data);
            } catch (err) { console.error("Error fetching branches:", err); }
        };
        fetchBranches();
    }, []);

    const fetchSalaries = useCallback(async () => {
        if (!selectedMonth) return;
        setLoading(true);
        try {
            const res = await api.get(`/owner/salaries?monthYear=${selectedMonth}`);
            setSalaries(res.data.salaries);
        } catch (err) { console.error("Error fetching salaries:", err); }
        finally { setLoading(false); }
    }, [selectedMonth]);

    useEffect(() => { fetchSalaries(); }, [fetchSalaries]);

    // Filter Logic
    useEffect(() => {
        let result = salaries;
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            result = result.filter(s => s.eid.toLowerCase().includes(q) || s.ename.toLowerCase().includes(q));
        }
        if (selectedBranch) {
            result = result.filter(s => s.branch_id === selectedBranch || s.branch_name === selectedBranch);
        }
        setFilteredSalaries(result);
    }, [searchQuery, selectedBranch, salaries]);

    // Stats Calculations
    const totalPayroll = filteredSalaries.reduce((a, s) => a + Number(s.total || 0), 0);
    const totalComm = filteredSalaries.reduce((a, s) => a + Number(s.commission || 0), 0);
    const highestPaid = filteredSalaries.length > 0 ? Math.max(...filteredSalaries.map(s => Number(s.total || 0))) : 0;

    return (
        <div className={styles.contentArea}>
            <h1 className={styles.title}>Admin Salary Overview</h1>

            {/* Filters Row */}
            <div className={styles.controls}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label className={styles.label}>Month</label>
                    <select 
                        className={styles.selectInput} 
                        value={selectedMonth} 
                        onChange={(e) => setSelectedMonth(e.target.value)}
                    >
                        {monthOptions.map(opt => <option key={opt} value={opt}>{opt.replace('-', ' ')}</option>)}
                    </select>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
                    <label className={styles.label}>Search Employee</label>
                    <input 
                        type="text" 
                        className={styles.selectInput} 
                        style={{ width: '100%' }}
                        placeholder="ID or Name..." 
                        value={searchQuery} 
                        onChange={(e) => setSearchQuery(e.target.value)} 
                    />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label className={styles.label}>Branch</label>
                    <select 
                        className={styles.selectInput} 
                        value={selectedBranch} 
                        onChange={(e) => setSelectedBranch(e.target.value)}
                    >
                        <option value="">All Branches</option>
                        {branches.map(b => <option key={b._id} value={b.bid}>{b.b_name}</option>)}
                    </select>
                </div>
            </div>

            {loading ? (
                <p className={styles.loadingMessage}>Retrieving payroll data...</p>
            ) : (
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
                                <div className={styles.summaryValue}>{filteredSalaries.length}</div>
                                <div className={styles.summaryLabel}>Staff Count</div>
                            </div>
                        </div>
                        <div className={styles.summaryCard}>
                            <div className={styles.summaryIcon}>📈</div>
                            <div>
                                <div className={styles.summaryValue}>₹{fmt(totalComm)}</div>
                                <div className={styles.summaryLabel}>Total Comm.</div>
                            </div>
                        </div>
                        <div className={styles.summaryCard}>
                            <div className={styles.summaryIcon}>🏆</div>
                            <div>
                                <div className={styles.summaryValue}>₹{fmt(highestPaid)}</div>
                                <div className={styles.summaryLabel}>Highest Pay</div>
                            </div>
                        </div>
                    </div>

                    <h2 className={styles.dateRange}>{selectedMonth.replace('-', ' ')} — Detailed Payslips</h2>

                    <div className={styles.salaryList}>
                        {filteredSalaries.map((s, idx) => {
                            const isTop = Number(s.total) === highestPaid && highestPaid > 0;
                            const basePct = s.total > 0 ? (s.salary / s.total) * 100 : 100;
                            const commPct = s.total > 0 ? (s.commission / s.total) * 100 : 0;

                            return (
                                <div key={s.eid} className={`${styles.payslipCard} ${isTop ? styles.payslipTop : ''}`}>
                                    <div className={styles.payslipLeft}>
                                        <div className={styles.payslipAvatarWrap}>
                                            <div className={styles.payslipAvatar} style={{ background: getAvatarGradient(s.ename) }}>
                                                {getInitials(s.ename)}
                                            </div>
                                            {isTop && <span className={styles.topBadge}>★</span>}
                                        </div>
                                        <div className={styles.payslipIdentity}>
                                            <div className={styles.payslipName}>{s.ename}</div>
                                            <div className={styles.payslipMeta}>
                                                <span className={styles.payslipId}>#{s.eid}</span>
                                                <span className={styles.rolePill}>{s.role}</span>
                                            </div>
                                            <div style={{fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '4px'}}>
                                                📍 {s.branch_name}
                                            </div>
                                        </div>
                                    </div>

                                    <div className={styles.payslipCenter}>
                                        <div className={styles.breakdownRow}>
                                            <div className={styles.breakdownItem}>
                                                <span className={styles.breakdownLabel}>Base</span>
                                                <span className={styles.breakdownValue}>₹{fmt(s.salary)}</span>
                                            </div>
                                            <div className={styles.breakdownDivider} />
                                            <div className={styles.breakdownItem}>
                                                <span className={styles.breakdownLabel}>Comm.</span>
                                                <span className={`${styles.breakdownValue} ${s.commission > 0 ? styles.commissionValue : ''}`}>
                                                    + ₹{fmt(s.commission)}
                                                </span>
                                            </div>
                                        </div>
                                        <div className={styles.propBarWrap}>
                                            <div className={styles.propBarTrack}>
                                                <div className={styles.propBarBase} style={{ width: `${basePct}%` }} />
                                                {commPct > 0 && <div className={styles.propBarComm} style={{ width: `${commPct}%` }} />}
                                            </div>
                                        </div>
                                        {s.note && <div className={styles.payslipNote}>{s.note}</div>}
                                    </div>

                                    <div className={styles.payslipRight}>
                                        <div className={styles.totalLabel}>NET PAY</div>
                                        <div className={styles.totalAmount}>₹{fmt(s.total)}</div>
                                        <div className={styles.totalMonth}>{selectedMonth}</div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </>
            )}
        </div>
    );
};

export default SalaryList;