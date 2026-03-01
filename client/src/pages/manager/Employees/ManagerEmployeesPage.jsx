import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
    fetchEmployeesStart,
    fetchEmployeesSuccess,
    fetchEmployeesFailure
} from '../../../redux/slices/managerEmployeeSlice';
import AuthContext from '../../../context/AuthContext';
import api from '../../../api/api';
import ManagerAddEmployee from './ManagerAddEmployee';
import styles from './Details.module.css';

const ManagerEmployeesPage = () => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const employees = useSelector(state => state.managerEmployees.list);
    const loading = useSelector(state => state.managerEmployees.loading);
    const error = useSelector(state => state.managerEmployees.error);

    const [manager, setManager] = useState(null);
    const [addSalesman, setAddSalesman] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [filteredEmployees, setFilteredEmployees] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [employeesPerPage, setEmployeesPerPage] = useState(9);
    const [rowsInput, setRowsInput] = useState("9");
    const [sortBy, setSortBy] = useState("default");
    const [sortOrder, setSortOrder] = useState("desc");

    useEffect(() => {
        if (!addSalesman) {
            fetchEmployees();
            fetchManagerProfile();
        }
    }, [addSalesman]);

    const fetchEmployees = async () => {
        dispatch(fetchEmployeesStart());
        try {
            const res = await api.get('/manager/employees');
            dispatch(fetchEmployeesSuccess(res.data));
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Failed to fetch employees';
            dispatch(fetchEmployeesFailure(errorMessage));
        }
    };

    const fetchManagerProfile = async () => {
        try {
            const res = await api.get('/manager/employees/me');
            setManager(res.data);
        } catch (err) {
            console.error("Error fetching manager profile:", err);
        }
    };

    useEffect(() => {
        let result = [...employees];

        if (searchQuery.trim() !== "") {
            const q = searchQuery.toLowerCase();
            result = result.filter(e => {
                const id = e.e_id?.toString().toLowerCase() || "";
                const fName = e.f_name?.toLowerCase() || "";
                const lName = e.last_name?.toLowerCase() || "";
                return id.startsWith(q) || fName.startsWith(q) || lName.startsWith(q);
            });
        }

        if (sortBy !== "default") {
            result.sort((a, b) => {
                let valA, valB;
                switch (sortBy) {
                    case "monthlySalesCount":
                        valA = a.monthlySalesCount || 0;
                        valB = b.monthlySalesCount || 0;
                        break;
                    case "base_salary":
                        valA = a.base_salary || 0;
                        valB = b.base_salary || 0;
                        break;
                    case "monthlyRevenue":
                        valA = a.monthlyRevenue || 0;
                        valB = b.monthlyRevenue || 0;
                        break;
                    case "name":
                        valA = (a.f_name || "").toLowerCase();
                        valB = (b.f_name || "").toLowerCase();
                        return sortOrder === "asc" ? valA.localeCompare(valB) : valB.localeCompare(valA);
                    default:
                        return 0;
                }
                return sortOrder === "asc" ? valA - valB : valB - valA;
            });
        }

        setFilteredEmployees(result);
        setCurrentPage(1);
    }, [searchQuery, employees, sortBy, sortOrder]);

    const last = currentPage * employeesPerPage;
    const first = last - employeesPerPage;
    const currentEmployees = filteredEmployees.slice(first, last);
    const totalPages = Math.ceil(filteredEmployees.length / employeesPerPage);

    const handleAddSalesman = () => setAddSalesman(true);
    const handleBackFromAdd = () => setAddSalesman(false);
    const handleRowClick = (e_id) => navigate(`/manager/employees/${e_id}`);

    const handleRowsChange = (e) => {
        const val = e.target.value;
        setRowsInput(val);
        if (val !== "" && !isNaN(val) && parseInt(val) > 0) {
            setEmployeesPerPage(parseInt(val));
            setCurrentPage(1);
        }
    };

    // Helper: generate initials avatar color from name
    const avatarColor = (name = '') => {
        const colors = [
            ['#d97706', '#fbbf24'],
            ['#0d6efd', '#60a5fa'],
            ['#7c3aed', '#a78bfa'],
            ['#059669', '#34d399'],
            ['#dc2626', '#f87171'],
            ['#0891b2', '#22d3ee'],
        ];
        const idx = (name.charCodeAt(0) || 0) % colors.length;
        return colors[idx];
    };

    if (!user || user.role !== 'manager') {
        return (
            <div className={styles.container}>
                <div className={styles.contentArea}>
                    <h1>Access Denied</h1>
                </div>
            </div>
        );
    }

    // Summary stats
    const totalActive = employees.filter(e => e.status === 'active').length;
    const totalSales = employees.reduce((s, e) => s + (e.monthlySalesCount || 0), 0);
    const totalRevenue = employees.reduce((s, e) => s + (e.monthlyRevenue || 0), 0);

    return (
        <div className={styles.container}>
            <div className={styles.contentArea}>
                <h1>Team Overview · Branch {manager?.bid || '—'}</h1>

                {addSalesman && (
                    <ManagerAddEmployee handleBack={handleBackFromAdd} manager={manager} />
                )}

                {!addSalesman && (
                    <>
                        {/* ── STATS STRIP ── */}
                        <div className={styles.statsStrip}>
                            <div className={styles.statCard}>
                                <span className={styles.statIcon}>👥</span>
                                <div>
                                    <div className={styles.statValue}>{employees.length}</div>
                                    <div className={styles.statLabel}>Total Employees</div>
                                </div>
                            </div>
                            <div className={styles.statCard}>
                                <span className={styles.statIcon}>✅</span>
                                <div>
                                    <div className={styles.statValue}>{totalActive}</div>
                                    <div className={styles.statLabel}>Active</div>
                                </div>
                            </div>
                            <div className={styles.statCard}>
                                <span className={styles.statIcon}>📈</span>
                                <div>
                                    <div className={styles.statValue}>{totalSales}</div>
                                    <div className={styles.statLabel}>Sales This Month</div>
                                </div>
                            </div>
                            <div className={styles.statCard}>
                                <span className={styles.statIcon}>💰</span>
                                <div>
                                    <div className={styles.statValue}>₹{(totalRevenue || 0).toLocaleString()}</div>
                                    <div className={styles.statLabel}>Monthly Revenue</div>
                                </div>
                            </div>
                        </div>

                        {/* ── TOOLBAR ── */}
                        <div className={styles.toolbar}>
                            <div className={styles.searchWrap}>
                                <svg className={styles.searchIcon} viewBox="0 0 24 24" fill="none">
                                    <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2"/>
                                    <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                                </svg>
                                <input
                                    type="text"
                                    placeholder="Search by ID, first or last name…"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className={styles.searchInputNew}
                                />
                            </div>

                            <div className={styles.sortControls}>
                                <label className={styles.sortLabel}>Sort by</label>
                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                    className={styles.sortSelect}
                                >
                                    <option value="default">Default</option>
                                    <option value="monthlySalesCount">Sales This Month</option>
                                    <option value="base_salary">Base Salary</option>
                                    <option value="monthlyRevenue">Monthly Revenue</option>
                                    <option value="name">Name</option>
                                </select>
                                <button
                                    className={styles.sortOrderBtn}
                                    onClick={() => setSortOrder(prev => prev === "asc" ? "desc" : "asc")}
                                >
                                    {sortOrder === "asc" ? "↑ Asc" : "↓ Desc"}
                                </button>
                            </div>

                            <button className={styles.addButton} onClick={handleAddSalesman}>
                                <span>＋</span> Add Salesman
                            </button>
                        </div>

                        {loading && (
                            <div className={styles.loadingGrid}>
                                {[...Array(6)].map((_, i) => (
                                    <div key={i} className={styles.skeletonCard} style={{ animationDelay: `${i * 0.07}s` }} />
                                ))}
                            </div>
                        )}
                        {error && <p className={styles.errorMessage}>{error}</p>}

                        {/* ── CARD GRID ── */}
                        {!loading && !error && (
                            <>
                                {filteredEmployees.length === 0 ? (
                                    <div className={styles.emptyState}>
                                        <div className={styles.emptyIcon}>🔍</div>
                                        <p>No employees match your search.</p>
                                    </div>
                                ) : (
                                    <div className={styles.cardGrid}>
                                        {currentEmployees.map((employee, idx) => {
                                            const [c1, c2] = avatarColor(employee.f_name);
                                            const initials = `${employee.f_name?.[0] || ''}${employee.last_name?.[0] || ''}`.toUpperCase();
                                            const statusClass =
                                                employee.status === 'active' ? styles.statusActive :
                                                employee.status === 'fired' ? styles.statusFired :
                                                styles.statusResigned;

                                            return (
                                                <div
                                                    key={employee.e_id}
                                                    className={styles.empCard}
                                                    style={{ animationDelay: `${idx * 0.05}s` }}
                                                    onClick={() => handleRowClick(employee.e_id)}
                                                >
                                                    {/* Top accent bar color keyed to status */}
                                                    <div className={styles.cardAccent} style={{
                                                        background: employee.status === 'active'
                                                            ? 'linear-gradient(90deg, #059669, #34d399)'
                                                            : employee.status === 'fired'
                                                            ? 'linear-gradient(90deg, #dc2626, #f87171)'
                                                            : 'linear-gradient(90deg, #d97706, #fbbf24)'
                                                    }} />

                                                    <div className={styles.cardHeader}>
                                                        <div
                                                            className={styles.avatar}
                                                            style={{ background: `linear-gradient(135deg, ${c1}, ${c2})` }}
                                                        >
                                                            {initials}
                                                        </div>
                                                        <div className={styles.cardMeta}>
                                                            <div className={styles.cardName}>
                                                                {employee.f_name} {employee.last_name}
                                                            </div>
                                                            <div className={styles.cardRole}>{employee.role}</div>
                                                        </div>
                                                        <span className={statusClass}>{employee.status}</span>
                                                    </div>

                                                    <div className={styles.cardId}>
                                                        <span className={styles.cardIdLabel}>ID</span>
                                                        <span className={styles.cardIdValue}>#{employee.e_id}</span>
                                                    </div>

                                                    <div className={styles.cardStats}>
                                                        <div className={styles.cardStat}>
                                                            <div className={styles.cardStatVal}>
                                                                <span className={employee.monthlySalesCount > 0 ? styles.salesBadge : styles.zeroSalesBadge}>
                                                                    {employee.monthlySalesCount || 0}
                                                                </span>
                                                            </div>
                                                            <div className={styles.cardStatLabel}>Sales / Month</div>
                                                        </div>
                                                        <div className={styles.cardStatDivider} />
                                                        <div className={styles.cardStat}>
                                                            <div className={styles.cardStatVal}>
                                                                ₹{(employee.base_salary || 0).toLocaleString()}
                                                            </div>
                                                            <div className={styles.cardStatLabel}>Base Salary</div>
                                                        </div>
                                                    </div>

                                                    <div className={styles.cardFooter}>
                                                        <span className={styles.viewDetails}>View Details →</span>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}

                                {/* ── PAGINATION ── */}
                                {filteredEmployees.length > 0 && (
                                    <div className={styles.paginationControls}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <span>Cards per page:</span>
                                            <input
                                                type="number"
                                                min="1"
                                                value={rowsInput}
                                                onChange={handleRowsChange}
                                                className={styles.rowsInput}
                                            />
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center' }}>
                                            <button
                                                className={styles.pageButton}
                                                onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                                                disabled={currentPage === 1}
                                            >← Prev</button>
                                            <span style={{ margin: "0 14px", fontWeight: 600, color: 'var(--text-secondary)' }}>
                                                {currentPage} / {totalPages}
                                            </span>
                                            <button
                                                className={styles.pageButton}
                                                onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                                                disabled={currentPage === totalPages}
                                            >Next →</button>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default ManagerEmployeesPage;