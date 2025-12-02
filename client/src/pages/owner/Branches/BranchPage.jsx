// client/src/pages/owner/Branches/BranchPage.jsx
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchBranches } from '../../../redux/slices/branchSlice';
import AddBranch from './AddBranch';
import BranchDetails from './BranchDetails';
import styles from './Branch.module.css';

const BranchPage = () => {
    const dispatch = useDispatch();
    
    // 1. Get Master Data from Redux
    const { items: allBranches, status } = useSelector((state) => state.branches);

    // 2. UI View State
    const [addBranchMode, setAddBranchMode] = useState(false);
    const [singleBranchId, setSingleBranchId] = useState(null);

    // 3. Filter State
    const [filteredBranches, setFilteredBranches] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    
    // 4. Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(5);
    const [itemsPerPageInput, setItemsPerPageInput] = useState('5');

    // Initial Fetch
    useEffect(() => {
        if (status === 'idle') {
            dispatch(fetchBranches());
        }
    }, [status, dispatch]);

    // Sync Redux data with local filtered state
    useEffect(() => {
        setFilteredBranches(allBranches);
    }, [allBranches]);

    // --- Unified Filter Logic ---
    useEffect(() => {
        let result = allBranches;

        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            result = result.filter(branch => 
                (branch.b_name && branch.b_name.toLowerCase().includes(query)) ||
                (branch.bid && branch.bid.toLowerCase().includes(query)) ||
                (branch.manager_name && branch.manager_name.toLowerCase().includes(query)) ||
                (branch.location && branch.location.toLowerCase().includes(query))
            );
        }

        setFilteredBranches(result);
        setCurrentPage(1); // Reset to page 1 on filter change
    }, [searchQuery, allBranches]);

    // --- Pagination Calculation ---
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredBranches.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredBranches.length / itemsPerPage);

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
        setItemsPerPage(5);
        setItemsPerPageInput('5');
        setCurrentPage(1);
    };

    // Navigation Handlers
    const handleAddBranch = () => {
        setAddBranchMode(true);
        setSingleBranchId(null);
    };

    const handleBack = () => {
        setAddBranchMode(false);
        setSingleBranchId(null);
    };

    const handleRowClick = (bid) => {
        setSingleBranchId(bid);
        setAddBranchMode(false);
    };

    // Loading State
    if (status === 'loading') return <div className={styles.container}><p>Loading branches...</p></div>;
    if (status === 'failed') return <div className={styles.container}><p>Error loading branches.</p></div>;

    return (
        <div className={styles.container}>
            <div className={styles.contentArea}>
                <h1>Our Branches</h1>

                {/* VIEW: ADD OR DETAILS */}
                {addBranchMode && !singleBranchId && (
                    <>
                        <button className={styles.addButton} onClick={handleBack}>Back to List</button>
                        <AddBranch handleBack={handleBack} />
                    </>
                )}

                {singleBranchId && !addBranchMode && (
                    <>
                        <button className={styles.addButton} onClick={handleBack}>Back to List</button>
                        <BranchDetails bid={singleBranchId} handleBack={handleBack} />
                    </>
                )}

                {/* VIEW: MAIN LIST */}
                {!addBranchMode && !singleBranchId && (
                    <>
                        <div className={styles.headerContainer}>
                            <button className={styles.addButton} onClick={handleAddBranch}>+ Add Branch</button>
                        </div>

                        {/* Search Control */}
                        <div className={styles.controlsContainer}>
                            <div className={styles.searchGroup}>
                                <input
                                    type="text"
                                    className={styles.searchInput}
                                    placeholder="Search Branch Name, ID, Manager or Location..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                            
                            <div className={styles.filterGroup}>
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
                                        <th className={styles.th}>Branch ID</th>
                                        <th className={styles.th}>Branch Name</th>
                                        <th className={styles.th}>Manager Name</th>
                                        <th className={styles.th}>Manager Email</th>
                                        <th className={styles.th}>Manager Phone</th>
                                        <th className={styles.th}>Address</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {currentItems.length > 0 ? (
                                        currentItems.map((branch) => (
                                            <tr key={branch._id} className={styles.tr} onClick={() => handleRowClick(branch.bid)}>
                                                <td className={styles.td} data-label="Branch ID">{branch.bid}</td>
                                                <td className={styles.td} data-label="Branch Name">{branch.b_name}</td>
                                                <td className={styles.td} data-label="Manager Name">{branch.manager_name}</td>
                                                <td className={styles.td} data-label="Manager Email">{branch.manager_email}</td>
                                                <td className={styles.td} data-label="Manager Phone">{branch.manager_ph_no}</td>
                                                <td className={styles.td} data-label="Address">{branch.location}</td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="6" style={{textAlign: 'center', padding: '20px'}}>
                                                No branches found matching your search.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination Section */}
                        {filteredBranches.length > 0 && (
                            <div className={styles.paginationContainer}>
                                <div className={styles.rowsPerPage}>
                                    <span>Rows per page:</span>
                                    <input 
                                        type="number" 
                                        min="1"
                                        max={filteredBranches.length}
                                        value={itemsPerPageInput}
                                        onChange={handleRowsInputChange}
                                        onKeyDown={handleRowsInputKeyDown}
                                        className={styles.rowsInput}
                                        title="Press Enter to apply"
                                    />
                                </div>

                                <div className={styles.paginationInfo}>
                                    Showing {indexOfFirstItem + 1} - {Math.min(indexOfLastItem, filteredBranches.length)} of {filteredBranches.length}
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

export default BranchPage;