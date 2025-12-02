import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux'; // Redux Hooks
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

    // ------------ PREFIX SEARCH implementation ------------
    useEffect(() => {
        let result = employees;

        if (searchQuery.trim() !== "") {
            const q = searchQuery.toLowerCase();

            result = employees.filter(e => {
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

        setFilteredEmployees(result);
        setCurrentPage(1); // Reset to first page on search
    }, [searchQuery, employees]); // 'employees' now comes from Redux state


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
                                            <th className={styles.th}>Branch ID</th>
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
                                                <td className={styles.td} data-label="Branch ID">{employee.bid || 'Not Assigned'}</td>
                                                <td className={styles.td} data-label="Status">{employee.status}</td>
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