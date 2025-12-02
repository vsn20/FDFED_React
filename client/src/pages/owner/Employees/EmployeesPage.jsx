// client/src/pages/owner/Employees/EmployeesPage.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchEmployees } from '../../../redux/slices/employeeSlice';
import { fetchBranches } from '../../../redux/slices/branchSlice';
import AddEmployee from './AddEmployee';
import EmployeeDetails from './EmployeeDetails';
import styles from './Employee.module.css';

const EmployeesPage = () => {
    const dispatch = useDispatch();
    
    // 1. Get Master Data from Redux
    const { items: allEmployees, status: empStatus } = useSelector((state) => state.employees);
    const { items: branches, status: branchStatus } = useSelector((state) => state.branches);

    // 2. UI View State
    const [addEmployeeMode, setAddEmployeeMode] = useState(false);
    const [singleEmployeeId, setSingleEmployeeId] = useState(null);

    // 3. Filter State
    const [filteredEmployees, setFilteredEmployees] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedBranch, setSelectedBranch] = useState('');
    const [selectedRole, setSelectedRole] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('');

    // 4. Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(5); 
    const [itemsPerPageInput, setItemsPerPageInput] = useState('5'); 

    // Initial Fetch on Mount
    useEffect(() => {
        if (empStatus === 'idle') dispatch(fetchEmployees());
        if (branchStatus === 'idle') dispatch(fetchBranches());
    }, [empStatus, branchStatus, dispatch]);

    // Sync Redux data with local filtered state whenever Redux data changes
    useEffect(() => {
        setFilteredEmployees(allEmployees);
    }, [allEmployees]);

    // --- Unified Filter Logic ---
    useEffect(() => {
        let result = allEmployees || [];

        // 1. Search Query
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            result = result.filter(emp => 
                (emp.f_name && emp.f_name.toLowerCase().includes(query)) ||
                (emp.last_name && emp.last_name.toLowerCase().includes(query)) ||
                (emp.e_id && emp.e_id.toLowerCase().includes(query)) ||
                (emp.email && emp.email.toLowerCase().includes(query))
            );
        }

        // 2. Filters
        if (selectedBranch) {
            result = result.filter(emp => emp.bid === selectedBranch);
        }
        if (selectedRole) {
            result = result.filter(emp => emp.role === selectedRole);
        }
        if (selectedStatus) {
            result = result.filter(emp => emp.status === selectedStatus);
        }

        setFilteredEmployees(result);
        setCurrentPage(1); // Reset to page 1
    }, [searchQuery, selectedBranch, selectedRole, selectedStatus, allEmployees]);


    // --- Pagination Calculation ---
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredEmployees.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredEmployees.length / itemsPerPage);

    // --- Handlers ---
    const handlePageChange = (pageNumber) => {
        if (pageNumber >= 1 && pageNumber <= totalPages) {
            setCurrentPage(pageNumber);
        }
    };

    const handleRowsInputChange = (e) => {
        setItemsPerPageInput(e.target.value);
    };

    const handleRowsInputKeyDown = (e) => {
        if (e.key === 'Enter') {
            const number = parseInt(itemsPerPageInput, 10);
            if (!isNaN(number) && number > 0) {
                setItemsPerPage(number);
                setCurrentPage(1);
            } else {
                setItemsPerPageInput(String(itemsPerPage));
            }
        }
    };

    const resetFilters = () => {
        setSearchQuery('');
        setSelectedBranch('');
        setSelectedRole('');
        setSelectedStatus('');
        setItemsPerPage(5);
        setItemsPerPageInput('5');
        setCurrentPage(1);
    };

    // Navigation Handlers
    const handleAddEmployee = () => {
        setAddEmployeeMode(true);
        setSingleEmployeeId(null);
    };

    // FIX: Re-fetch data when returning from Add/Edit form
    const handleBack = () => {
        setAddEmployeeMode(false);
        setSingleEmployeeId(null);
        dispatch(fetchEmployees()); // Force refresh list from server
    };

    const handleRowClick = (e_id) => {
        setSingleEmployeeId(e_id);
        setAddEmployeeMode(false);
    };

    // Loading State
    if (empStatus === 'loading') return <div className={styles.container}><p>Loading employees...</p></div>;
    if (empStatus === 'failed') return <div className={styles.container}><p>Error loading employees.</p></div>;

    return (
        <div className={styles.container}>
            <div className={styles.contentArea}>
                <h1>Employee List</h1>

                {/* VIEW: ADD OR DETAILS */}
                {addEmployeeMode && !singleEmployeeId && (
                    <>
                        <button className={styles.addButton} onClick={handleBack}>Back to List</button>
                        <AddEmployee handleBack={handleBack} />
                    </>
                )}

                {singleEmployeeId && !addEmployeeMode && (
                    <>
                        <button className={styles.addButton} onClick={handleBack}>Back to List</button>
                        <EmployeeDetails e_id={singleEmployeeId} handleBack={handleBack} />
                    </>
                )}

                {/* VIEW: MAIN LIST */}
                {!addEmployeeMode && !singleEmployeeId && (
                    <>
                        <div className={styles.headerContainer}>
                            <button className={styles.addButton} onClick={handleAddEmployee}>+ Add Employee</button>
                        </div>

                        {/* Filters Section */}
                        <div className={styles.controlsContainer}>
                            <div className={styles.searchGroup}>
                                <input
                                    type="text"
                                    className={styles.searchInput}
                                    placeholder="Search ID, Name, Email..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                            
                            <div className={styles.filterGroup}>
                                <select 
                                    className={styles.filterSelect}
                                    value={selectedBranch}
                                    onChange={(e) => setSelectedBranch(e.target.value)}
                                >
                                    <option value="">All Branches</option>
                                    {branches.map(b => (
                                        <option key={b.bid} value={b.bid}>{b.b_name}</option>
                                    ))}
                                </select>

                                <select 
                                    className={styles.filterSelect}
                                    value={selectedRole}
                                    onChange={(e) => setSelectedRole(e.target.value)}
                                >
                                    <option value="">All Roles</option>
                                    <option value="manager">Manager</option>
                                    <option value="salesman">Salesman</option>
                                </select>

                                <select 
                                    className={styles.filterSelect}
                                    value={selectedStatus}
                                    onChange={(e) => setSelectedStatus(e.target.value)}
                                >
                                    <option value="">All Status</option>
                                    <option value="active">Active</option>
                                    <option value="resigned">Resigned</option>
                                    <option value="fired">Fired</option>
                                </select>

                                <button className={styles.resetBtn} onClick={resetFilters}>
                                    Reset
                                </button>
                            </div>
                        </div>

                        {/* Table */}
                        <div className={styles.tableWrapper}>
                            <table className={styles.table}>
                                <thead className={styles.thead}>
                                    <tr>
                                        <th className={styles.th}>Employee ID</th>
                                        <th className={styles.th}>First Name</th>
                                        <th className={styles.th}>Last Name</th>
                                        <th className={styles.th}>Role</th>
                                        <th className={styles.th}>Branch</th>
                                        <th className={styles.th}>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {currentItems.length > 0 ? (
                                        currentItems.map((employee) => (
                                            <tr key={employee._id} className={styles.tr} onClick={() => handleRowClick(employee.e_id)}>
                                                <td className={styles.td} data-label="Employee ID">{employee.e_id}</td>
                                                <td className={styles.td} data-label="First Name">{employee.f_name}</td>
                                                <td className={styles.td} data-label="Last Name">{employee.last_name}</td>
                                                <td className={styles.td} data-label="Role" style={{textTransform: 'capitalize'}}>{employee.role}</td>
                                                <td className={styles.td} data-label="Branch">{employee.bid || <span style={{color:'#999'}}>Not Assigned</span>}</td>
                                                <td className={styles.td} data-label="Status">
                                                    <span className={`${styles.statusBadge} ${styles[employee.status]}`}>
                                                        {employee.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="6" style={{textAlign: 'center', padding: '20px'}}>
                                                No employees found.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination Section */}
                        {filteredEmployees.length > 0 && (
                            <div className={styles.paginationContainer}>
                                <div className={styles.rowsPerPage}>
                                    <span>Rows per page:</span>
                                    <input 
                                        type="number" 
                                        min="1"
                                        max={filteredEmployees.length}
                                        value={itemsPerPageInput}
                                        onChange={handleRowsInputChange}
                                        onKeyDown={handleRowsInputKeyDown}
                                        className={styles.rowsInput}
                                        title="Press Enter to apply"
                                    />
                                </div>

                                <div className={styles.paginationInfo}>
                                    Showing {indexOfFirstItem + 1} - {Math.min(indexOfLastItem, filteredEmployees.length)} of {filteredEmployees.length}
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

export default EmployeesPage;