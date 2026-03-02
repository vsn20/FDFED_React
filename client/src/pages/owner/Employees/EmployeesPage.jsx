import React, { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchEmployees } from '../../../redux/slices/employeeSlice';
import { fetchBranches } from '../../../redux/slices/branchSlice';
import AddEmployee from './AddEmployee';
import EmployeeDetails from './EmployeeDetails';
import styles from './Employee.module.css';

/* ── Icons ── */
const IconSearch = () => (
  <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
);
const IconReset = () => (
  <svg viewBox="0 0 24 24" width="12" height="12" stroke="currentColor" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 102.13-9.36L1 10"/>
  </svg>
);
const IconChevL = () => (
  <svg viewBox="0 0 24 24" width="12" height="12" stroke="currentColor" fill="none" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 18 9 12 15 6"/>
  </svg>
);
const IconChevR = () => (
  <svg viewBox="0 0 24 24" width="12" height="12" stroke="currentColor" fill="none" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6"/>
  </svg>
);
const IconPlus = () => (
  <svg viewBox="0 0 24 24" width="13" height="13" stroke="currentColor" fill="none" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
);

/* ── Initials helper ── */
const getInitials = (first = '', last = '') =>
  `${first[0] || ''}${last[0] || ''}`.toUpperCase();

const EmployeesPage = () => {
  const dispatch = useDispatch();
  const { items: allEmployees, status: empStatus }  = useSelector(s => s.employees);
  const { items: branches,     status: branchStatus } = useSelector(s => s.branches);

  const [addMode,        setAddMode]        = useState(false);
  const [selectedEmpId,  setSelectedEmpId]  = useState(null);

  const [searchQuery,     setSearchQuery]     = useState('');
  const [selectedBranch,  setSelectedBranch]  = useState('');
  const [selectedRole,    setSelectedRole]    = useState('');
  const [selectedStatus,  setSelectedStatus]  = useState('');

  const [currentPage,         setCurrentPage]         = useState(1);
  const [itemsPerPage,        setItemsPerPage]        = useState(12);
  const [itemsPerPageInput,   setItemsPerPageInput]   = useState('12');

  useEffect(() => {
    if (empStatus    === 'idle') dispatch(fetchEmployees());
    if (branchStatus === 'idle') dispatch(fetchBranches());
  }, [empStatus, branchStatus, dispatch]);

  const filtered = useMemo(() => {
    let r = allEmployees || [];
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      r = r.filter(e =>
        e.f_name?.toLowerCase().includes(q)    ||
        e.last_name?.toLowerCase().includes(q) ||
        e.e_id?.toLowerCase().includes(q)      ||
        e.email?.toLowerCase().includes(q)
      );
    }
    if (selectedBranch) r = r.filter(e => e.bid    === selectedBranch);
    if (selectedRole)   r = r.filter(e => e.role   === selectedRole);
    if (selectedStatus) r = r.filter(e => e.status === selectedStatus);
    return r;
  }, [searchQuery, selectedBranch, selectedRole, selectedStatus, allEmployees]);

  useEffect(() => { setCurrentPage(1); }, [searchQuery, selectedBranch, selectedRole, selectedStatus]);

  const totalPages    = Math.max(1, Math.ceil(filtered.length / itemsPerPage));
  const safePage      = Math.min(currentPage, totalPages);
  const indexFirst    = (safePage - 1) * itemsPerPage;
  const currentItems  = filtered.slice(indexFirst, indexFirst + itemsPerPage);

  /* Stats */
  const activeCount   = allEmployees.filter(e => e.status === 'active').length;
  const managerCount  = allEmployees.filter(e => e.role   === 'manager').length;
  const unassigned    = allEmployees.filter(e => !e.bid).length;

  const handleRowsKeyDown = (e) => {
    if (e.key === 'Enter') {
      const n = parseInt(itemsPerPageInput, 10);
      if (!isNaN(n) && n > 0) { setItemsPerPage(n); setCurrentPage(1); }
      else setItemsPerPageInput(String(itemsPerPage));
    }
  };
  const resetFilters = () => {
    setSearchQuery(''); setSelectedBranch(''); setSelectedRole(''); setSelectedStatus('');
    setItemsPerPage(12); setItemsPerPageInput('12'); setCurrentPage(1);
  };
  const handleBack = () => {
    setAddMode(false); setSelectedEmpId(null);
    dispatch(fetchEmployees());
  };

  if (empStatus === 'loading') return (
    <div className={styles.loadingState}><span className={styles.spinner}/> Loading employees…</div>
  );
  if (empStatus === 'failed') return (
    <div className={styles.loadingState}>Failed to load employees.</div>
  );

  /* ── Sub-views ── */
  if (addMode) return <AddEmployee handleBack={handleBack} />;
  if (selectedEmpId) return <EmployeeDetails e_id={selectedEmpId} handleBack={handleBack} />;

  return (
    <div className={styles.container}>

      {/* Header */}
      <div className={styles.pageHeader}>
        <div>
          <div className={styles.pageOverline}>Workforce Management</div>
          <h1 className={styles.pageTitle}>Employee <em>Directory</em></h1>
          <p className={styles.pageSub}>
            {filtered.length === allEmployees.length
              ? `${allEmployees.length} employees across all branches`
              : `${filtered.length} of ${allEmployees.length} employees`}
          </p>
        </div>
        <div style={{ display:'flex', gap:'12px', alignItems:'center', flexWrap:'wrap' }}>
          <div className={styles.totalBadge}>
            <span className={styles.totalBadgeNum}>{allEmployees.length}</span>
            Total Staff
          </div>
          <button className={styles.addButton} onClick={() => setAddMode(true)}>
            <IconPlus /> Add Employee
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className={styles.statsStrip}>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>👥</div>
          <div className={styles.statValue}>{allEmployees.length}</div>
          <div className={styles.statLabel}>Total Employees</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>✅</div>
          <div className={styles.statValue}>{activeCount}</div>
          <div className={styles.statLabel}>Active</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>🎯</div>
          <div className={styles.statValue}>{managerCount}</div>
          <div className={styles.statLabel}>Managers</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>📌</div>
          <div className={styles.statValue}>{unassigned}</div>
          <div className={styles.statLabel}>Unassigned</div>
        </div>
      </div>

      {/* Filters */}
      <div className={styles.filterPanel}>
        <div className={styles.searchWrap}>
          <span className={styles.searchIcon}><IconSearch /></span>
          <input
            className={styles.searchInput}
            type="text"
            placeholder="Search name, ID, email…"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>
        <select className={styles.filterSelect} value={selectedBranch} onChange={e => setSelectedBranch(e.target.value)}>
          <option value="">All Branches</option>
          {branches.map(b => <option key={b.bid} value={b.bid}>{b.b_name}</option>)}
        </select>
        <select className={styles.filterSelect} value={selectedRole} onChange={e => setSelectedRole(e.target.value)}>
          <option value="">All Roles</option>
          <option value="manager">Manager</option>
          <option value="salesman">Salesman</option>
        </select>
        <select className={styles.filterSelect} value={selectedStatus} onChange={e => setSelectedStatus(e.target.value)}>
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="resigned">Resigned</option>
          <option value="fired">Fired</option>
        </select>
        <button className={styles.resetBtn} onClick={resetFilters}><IconReset /> Reset</button>
      </div>

      {/* Results count */}
      <div className={styles.resultsBar}>
        <span className={styles.resultsCount}>
          Showing <strong>{indexFirst + 1}–{Math.min(indexFirst + itemsPerPage, filtered.length)}</strong> of <strong>{filtered.length}</strong> employees
        </span>
      </div>

      {/* Card Grid */}
      <div className={styles.cardGrid}>
        {currentItems.length > 0 ? currentItems.map((emp) => (
          <div
            key={emp._id}
            className={styles.employeeCard}
            onClick={() => setSelectedEmpId(emp.e_id)}
          >
            <div className={styles.cardContent}>
              {/* Avatar row */}
              <div className={styles.cardAvatarRow}>
                <div className={styles.cardAvatar}>
                  {getInitials(emp.f_name, emp.last_name)}
                </div>
                <div className={styles.cardAvatarMeta}>
                  <span className={styles.cardEmpId}>{emp.e_id}</span>
                  <div className={styles.cardName}>{emp.f_name} {emp.last_name}</div>
                </div>
              </div>

              {/* Badges */}
              <div className={styles.cardBadgeRow}>
                <span className={styles.roleBadge} style={{ textTransform:'capitalize' }}>
                  {emp.role}
                </span>
                <span className={`${styles.statusBadge} ${styles[emp.status]}`}>
                  {emp.status}
                </span>
              </div>

              {/* Meta rows */}
              <div className={styles.cardMeta}>
                <div className={styles.cardMetaRow}>
                  <span className={styles.cardMetaIcon}>🌐</span>
                  <span className={styles.cardMetaKey}>Branch</span>
                  <span className={`${styles.cardMetaVal} ${!emp.bid ? styles.unassigned : ''}`}>
                    {emp.bid || 'Not Assigned'}
                  </span>
                </div>
                <div className={styles.cardMetaRow}>
                  <span className={styles.cardMetaIcon}>✉️</span>
                  <span className={styles.cardMetaKey}>Email</span>
                  <span className={styles.cardMetaVal}>{emp.email}</span>
                </div>
                <div className={styles.cardMetaRow}>
                  <span className={styles.cardMetaIcon}>📞</span>
                  <span className={styles.cardMetaKey}>Phone</span>
                  <span className={`${styles.cardMetaVal} ${!emp.phone_no ? styles.unassigned : ''}`}>
                    {emp.phone_no || '—'}
                  </span>
                </div>
              </div>
            </div>

            {/* Card footer */}
            <div className={styles.cardFooter}>
              <div>
                <div className={styles.cardSalaryLabel}>Monthly Salary</div>
                <div className={styles.cardSalary}>₹{Number(emp.base_salary).toLocaleString('en-IN')}</div>
              </div>
              <span className={styles.cardEditHint}>Edit →</span>
            </div>
          </div>
        )) : (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>👥</div>
            <div className={styles.emptyTitle}>No employees found</div>
            <div className={styles.emptySub}>Try adjusting your search or filters</div>
          </div>
        )}
      </div>

      {/* Pagination */}
      {filtered.length > 0 && (
        <div className={styles.paginationContainer}>
          <div className={styles.rowsPerPage}>
            <span>Cards per page</span>
            <input
              type="number" min="1"
              className={styles.rowsInput}
              value={itemsPerPageInput}
              onChange={e => setItemsPerPageInput(e.target.value)}
              onKeyDown={handleRowsKeyDown}
              title="Press Enter to apply"
            />
          </div>
          <span className={styles.paginationInfo}>
            <strong>{indexFirst + 1}–{Math.min(indexFirst + itemsPerPage, filtered.length)}</strong> of <strong>{filtered.length}</strong>
          </span>
          <div className={styles.paginationControls}>
            <button className={styles.pageBtn} onClick={() => setCurrentPage(p => Math.max(p-1,1))} disabled={safePage===1}>
              <IconChevL/> Prev
            </button>
            <span className={styles.pageIndicator}>{safePage} / {totalPages}</span>
            <button className={styles.pageBtn} onClick={() => setCurrentPage(p => Math.min(p+1,totalPages))} disabled={safePage===totalPages}>
              Next <IconChevR/>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeesPage;