// client/src/pages/owner/CompanyPage.jsx
import React, { useState, useEffect } from 'react';
import api from '../../api/api';
import AddCompany from './Company/AddCompany';
import CompanyDetails from './Company/CompanyDetails';
import styles from './Company/Company.module.css';

const CompanyPage = () => {
    // --- STATE MANAGEMENT ---
    const [allCompanies, setAllCompanies] = useState([]);
    const [filteredCompanies, setFilteredCompanies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // View Switching
    const [viewMode, setViewMode] = useState('list'); // 'list', 'add', 'details'
    const [selectedId, setSelectedId] = useState(null);

    // Filters
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('');

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [rowsInput, setRowsInput] = useState('5');

    // --- FETCH DATA ---
    useEffect(() => {
        fetchCompanies();
    }, []);

    const fetchCompanies = async () => {
        setLoading(true);
        try {
            const res = await api.get('/companies');
            setAllCompanies(res.data);
            setFilteredCompanies(res.data); // Initial sync
            setLoading(false);
        } catch (err) {
            console.error("Error fetching companies:", err);
            setError("Failed to load companies");
            setLoading(false);
        }
    };

    // --- FILTER & SEARCH LOGIC ---
    useEffect(() => {
        let result = allCompanies;

        // Search Filter
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            result = result.filter(comp => 
                (comp.cname && comp.cname.toLowerCase().includes(query)) ||
                (comp.c_id && comp.c_id.toLowerCase().includes(query)) ||
                (comp.email && comp.email.toLowerCase().includes(query)) ||
                (comp.phone && comp.phone.includes(query))
            );
        }

        // Status Filter
        if (statusFilter) {
            result = result.filter(comp => comp.active === statusFilter);
        }

        setFilteredCompanies(result);
        setCurrentPage(1); // Reset page when filters change
    }, [searchQuery, statusFilter, allCompanies]);

    // --- PAGINATION LOGIC ---
    const indexOfLastItem = currentPage * rowsPerPage;
    const indexOfFirstItem = indexOfLastItem - rowsPerPage;
    const currentItems = filteredCompanies.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredCompanies.length / rowsPerPage);

    // --- HANDLERS ---
    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
        }
    };

    const handleRowsInputChange = (e) => {
        setRowsInput(e.target.value);
    };

    const handleRowsInputKeyDown = (e) => {
        if (e.key === 'Enter') {
            const val = parseInt(rowsInput, 10);
            if (!isNaN(val) && val > 0) {
                setRowsPerPage(val);
                setCurrentPage(1);
            } else {
                setRowsInput(String(rowsPerPage));
            }
        }
    };

    const resetFilters = () => {
        setSearchQuery('');
        setStatusFilter('');
        setRowsPerPage(5);
        setRowsInput('5');
        setCurrentPage(1);
    };

    // View Navigation
    const handleAddClick = () => {
        setViewMode('add');
        setSelectedId(null);
    };

    const handleRowClick = (id) => {
        setSelectedId(id);
        setViewMode('details');
    };

    const handleBack = () => {
        setViewMode('list');
        setSelectedId(null);
        fetchCompanies(); // Refresh data when returning to list
    };

    if (loading) return <div className={styles.container}><p>Loading companies...</p></div>;
    if (error) return <div className={styles.container}><p className={styles.errorMessage}>{error}</p></div>;

    return (
        <div className={styles.container}>
            <div className={styles.contentArea}>
                <h1>Company Partners</h1>

                {/* VIEW 1: ADD COMPANY FORM */}
                {viewMode === 'add' && (
                    <>
                        <button className={styles.addButton} onClick={handleBack} style={{marginBottom: '20px'}}>
                            Back to List
                        </button>
                        <AddCompany />
                    </>
                )}

                {/* VIEW 2: COMPANY DETAILS FORM */}
                {viewMode === 'details' && selectedId && (
                    <>
                        <button className={styles.addButton} onClick={handleBack} style={{marginBottom: '20px'}}>
                            Back to List
                        </button>
                        <CompanyDetails id={selectedId} handleback={handleBack} />
                    </>
                )}

                {/* VIEW 3: MAIN LIST (Table + Controls) */}
                {viewMode === 'list' && (
                    <>
                        {/* Top Header: Add Button */}
                        <div className={styles.headerContainer}>
                            <button className={styles.addButton} onClick={handleAddClick}>
                                + Add Company
                            </button>
                        </div>

                        {/* Search & Filter Bar */}
                        <div className={styles.controlsContainer}>
                            <div className={styles.searchGroup}>
                                <input
                                    type="text"
                                    className={styles.searchInput}
                                    placeholder="Search Name, ID, Email..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                            <div className={styles.filterGroup}>
                                <select 
                                    className={styles.filterSelect}
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                >
                                    <option value="">All Status</option>
                                    <option value="active">Active</option>
                                    <option value="inactive">Inactive</option>
                                </select>
                                <button className={styles.resetBtn} onClick={resetFilters}>
                                    Reset
                                </button>
                            </div>
                        </div>

                        {/* Data Table */}
                        <div className={styles.tableWrapper}>
                            <table className={styles.table}>
                                <thead className={styles.thead}>
                                    <tr>
                                        <th className={styles.th}>Company ID</th>
                                        <th className={styles.th}>Name</th>
                                        <th className={styles.th}>Email</th>
                                        <th className={styles.th}>Phone</th>
                                        <th className={styles.th}>Address</th>
                                        <th className={styles.th}>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {currentItems.length > 0 ? (
                                        currentItems.map((company) => (
                                            <tr 
                                                key={company._id} 
                                                className={styles.tr} 
                                                onClick={() => handleRowClick(company.c_id)}
                                            >
                                                <td className={styles.td} data-label="ID">{company.c_id}</td>
                                                <td className={styles.td} data-label="Name">{company.cname}</td>
                                                <td className={styles.td} data-label="Email">{company.email}</td>
                                                <td className={styles.td} data-label="Phone">{company.phone}</td>
                                                <td className={styles.td} data-label="Address">
                                                    {company.address.length > 25 ? company.address.substring(0, 25) + '...' : company.address}
                                                </td>
                                                <td className={styles.td} data-label="Status">
                                                    <span className={`${styles.statusBadge} ${styles[company.active]}`}>
                                                        {company.active}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="6" style={{textAlign: 'center', padding: '20px'}}>
                                                No companies found.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination Footer */}
                        {filteredCompanies.length > 0 && (
                            <div className={styles.paginationContainer}>
                                <div className={styles.rowsPerPage}>
                                    <span>Rows per page:</span>
                                    <input
                                        type="number"
                                        min="1"
                                        max={filteredCompanies.length}
                                        className={styles.rowsInput}
                                        value={rowsInput}
                                        onChange={handleRowsInputChange}
                                        onKeyDown={handleRowsInputKeyDown}
                                    />
                                </div>

                                <div className={styles.paginationInfo}>
                                    Showing {indexOfFirstItem + 1} - {Math.min(indexOfLastItem, filteredCompanies.length)} of {filteredCompanies.length}
                                </div>

                                <div className={styles.paginationControls}>
                                    <button 
                                        className={styles.pageBtn}
                                        onClick={() => handlePageChange(currentPage - 1)}
                                        disabled={currentPage === 1}
                                    >
                                        Previous
                                    </button>
                                    
                                    <span className={styles.pageIndicator}>
                                        Page {currentPage} of {totalPages}
                                    </span>

                                    <button 
                                        className={styles.pageBtn}
                                        onClick={() => handlePageChange(currentPage + 1)}
                                        disabled={currentPage === totalPages}
                                    >
                                        Next
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default CompanyPage;