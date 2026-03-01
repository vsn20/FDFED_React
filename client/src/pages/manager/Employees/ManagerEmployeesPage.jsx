import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux'; // Redux Hooks updated 
import {
    fetchEmployeesStart,
    fetchEmployeesSuccess,
    fetchEmployeesFailure
} from '../../../redux/slices/managerEmployeeSlice'; // Redux Actions
import AuthContext from '../../../context/AuthContext';
import api from '../../../api/api';
import ManagerAddEmployee from './ManagerAddEmployee';
import styles from './Details.module.css';

const ManagerEmployeesPage = () => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const dispatch = useDispatch(); // Initialize dispatch

    // REDUX STATE
    const employees = useSelector(state => state.managerEmployees.list); // Get employee list from Redux
    const loading = useSelector(state => state.managerEmployees.loading); // Get loading state
    const error = useSelector(state => state.managerEmployees.error); // Get error state

    // LOCAL STATES
    const [manager, setManager] = useState(null);
    const [addSalesman, setAddSalesman] = useState(false);
    // NEW STATES for Search and Pagination
    const [searchQuery, setSearchQuery] = useState("");
    const [filteredEmployees, setFilteredEmployees] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [employeesPerPage, setEmployeesPerPage] = useState(5);
    const [rowsInput, setRowsInput] = useState("5");
    // SORTING STATE
    const [sortBy, setSortBy] = useState("default");
    const [sortOrder, setSortOrder] = useState("desc");

    useEffect(() => {
        if (!addSalesman) {
            fetchEmployees();
            fetchManagerProfile();
        }
    }, [addSalesman]); // Re-fetch when exiting the add form

    // MODIFIED: Use Redux for state management
    const fetchEmployees = async () => {
        dispatch(fetchEmployeesStart()); // NEW: Dispatch start action
        try {
            const res = await api.get('/manager/employees');
            dispatch(fetchEmployeesSuccess(res.data)); // NEW: Dispatch success action
        } catch (err) {
            // Updated error handling to match slice payload
            const errorMessage = err.response?.data?.message || 'Failed to fetch employees';
            dispatch(fetchEmployeesFailure(errorMessage)); // NEW: Dispatch failure action
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

    // ------------ PREFIX SEARCH + SORTING implementation ------------
    useEffect(() => {
        let result = [...employees];

        if (searchQuery.trim() !== "") {
            const q = searchQuery.toLowerCase();

            result = result.filter(e => {
                const id = e.e_id?.toString().toLowerCase() || "";
                const fName = e.f_name?.toLowerCase() || "";
                const lName = e.last_name?.toLowerCase() || "";

                return (
                    id.startsWith(q) ||
                    fName.startsWith(q) ||
                    lName.startsWith(q)
                );
            });
        }

        // Apply sorting
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
        setCurrentPage(1); // Reset to first page on search
    }, [searchQuery, employees, sortBy, sortOrder]); // 'employees' now comes from Redux state


    // ---------- PAGINATION calculations ----------
    const last = currentPage * employeesPerPage;
    const first = last - employeesPerPage;
    const currentEmployees = filteredEmployees.slice(first, last);
    const totalPages = Math.ceil(filteredEmployees.length / employeesPerPage);


    const handleAddSalesman = () => {
        setAddSalesman(true);
    };

    const handleBackFromAdd = () => {
        setAddSalesman(false);
        // fetchEmployees is triggered by the useEffect now, which depends on addSalesman state change
    };

    const handleRowClick = (e_id) => {
        navigate(`/manager/employees/${e_id}`);
    };

    const handleRowsChange = (e) => {
        const val = e.target.value;
        setRowsInput(val);
        if (val !== "" && !isNaN(val) && parseInt(val) > 0) {
            setEmployeesPerPage(parseInt(val));
            setCurrentPage(1);
        }
    };
    
    // Check user role for access
    if (!user || user.role !== 'manager') {
        return (
            <div className={styles.container}>
                <div className={styles.contentArea}>
                    <h1>Access Denied</h1>
                </div>
            </div>
        );
    }

    // REMOVED: Local loading and error state logic

    return (
        <div className={styles.container}>
            <div className={styles.contentArea}>
                <h1>All Salesmen in Your Branch ({manager?.bid || 'Not Assigned'})</h1>
                
                {/* Add Salesman Form */}
                {addSalesman && (
                    // ManagerAddEmployee will need access to dispatch (passed implicitly through props)
                    <ManagerAddEmployee handleBack={handleBackFromAdd} manager={manager} />
                )}

                {/* Salesmen Table */}
                {!addSalesman && (
                    <>
                        <div className={styles.headerContainer}>
                            <button className={styles.addButton} onClick={handleAddSalesman}>Add Salesman</button>
                        </div>

                        {/* SEARCH INPUT */}
                        <input
                            type="text"
                            placeholder="Search Employee ID, First Name, Last Name..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            style={{ marginBottom: "10px", padding: "8px", width: "50%" }}
                        />

                        {/* SORT CONTROLS */}
                        <div className={styles.sortControls}>
                            <label className={styles.sortLabel}>Sort by:</label>
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
                                title={sortOrder === "asc" ? "Ascending" : "Descending"}
                            >
                                {sortOrder === "asc" ? "↑ Asc" : "↓ Desc"}
                            </button>
                        </div>

                        {/* NEW: Use Redux loading/error */}
                        {loading && <p>Loading employees...</p>}
                        {error && <p className={styles.errorMessage}>{error}</p>}

                        {/* Use Redux loading/error */}
                        {!loading && !error && (
                            <div className={styles.tableWrapper}>
                                <table className={styles.table}>
                                    <thead className={styles.thead}>
                                        <tr>
                                            <th className={styles.th}>Employee ID</th>
                                            <th className={styles.th}>First Name</th>
                                            <th className={styles.th}>Last Name</th>
                                            <th className={styles.th}>Role</th>
                                            <th className={styles.th}>Sales This Month</th>
                                            <th className={styles.th}>Base Salary</th>
                                            <th className={styles.th}>Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {currentEmployees.map((employee) => (
                                            <tr 
                                                key={employee.e_id} // Use e_id as key, assuming it's unique
                                                className={styles.tr} 
                                                onClick={() => handleRowClick(employee.e_id)}
                                            >
                                                <td className={styles.td} data-label="Employee ID">{employee.e_id}</td>
                                                <td className={styles.td} data-label="First Name">{employee.f_name}</td>
                                                <td className={styles.td} data-label="Last Name">{employee.last_name}</td>
                                                <td className={styles.td} data-label="Role">{employee.role}</td>
                                                <td className={styles.td} data-label="Sales This Month">
                                                    <span className={employee.monthlySalesCount > 0 ? styles.salesBadge : styles.zeroSalesBadge}>
                                                        {employee.monthlySalesCount || 0}
                                                    </span>
                                                </td>
                                                <td className={styles.td} data-label="Base Salary">₹{(employee.base_salary || 0).toLocaleString()}</td>
                                                <td className={styles.td} data-label="Status">
                                                    <span className={
                                                        employee.status === 'active' ? styles.statusActive :
                                                        employee.status === 'fired' ? styles.statusFired :
                                                        styles.statusResigned
                                                    }>
                                                        {employee.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                {filteredEmployees.length === 0 && <p>No salesmen found matching your criteria.</p>}
                            </div>
                        )}
                        
                        {/* PAGINATION CONTROLS */}
                        {filteredEmployees.length > 0 && (
                            <div className={styles.paginationControls}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    Rows per page:
                                    <input
                                        type="number"
                                        min="1"
                                        value={rowsInput}
                                        onChange={handleRowsChange}
                                        style={{ width: "60px", marginLeft: "10px" }}
                                    />
                                </div>

                                <div>
                                    <button 
                                        className={styles.pageButton} 
                                        onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} 
                                        disabled={currentPage === 1}
                                    >
                                        Prev
                                    </button>

                                    <span style={{ margin: "0 12px" }}>
                                        Page {currentPage} of {totalPages}
                                    </span>

                                    <button 
                                        className={styles.pageButton} 
                                        onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))} 
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

export default ManagerEmployeesPage;