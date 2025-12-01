// src/pages/manager/ManagerInventoryPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import api from '../../../api/api';
import styles from './ManagerInventory.module.css'; // ⬅ using SAME CSS as employees

const ManagerInventoryPage = () => {
    const [fullInventory, setFullInventory] = useState([]);
    const [filteredInventory, setFilteredInventory] = useState([]);
    const [branchName, setBranchName] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchQuery, setSearchQuery] = useState('');

    // PAGINATION
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsInput, setRowsInput] = useState("5");
    const [rowsPerPage, setRowsPerPage] = useState(5);

    const fetchInventory = useCallback(async () => {
        setLoading(true);
        setError('');

        try {
            const res = await api.get('/manager/inventory');
            setFullInventory(res.data.data);
            setFilteredInventory(res.data.data);
            setBranchName(res.data.branchName);
        } catch (err) {
            console.error("Error fetching inventory:", err);
            setError(err.response?.data?.message || 'Failed to fetch inventory.');
            setFullInventory([]);
            setFilteredInventory([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchInventory();
    }, [fetchInventory]);

    // SEARCH FILTER (Product ID, Name, Company)
    useEffect(() => {
        const q = searchQuery.toLowerCase();

        let result = fullInventory.filter(item =>
            item.product_id?.toLowerCase().includes(q) ||
            item.product_name?.toLowerCase().includes(q) ||
            item.company_name?.toLowerCase().includes(q)
        );

        setFilteredInventory(result);
        setCurrentPage(1);
    }, [searchQuery, fullInventory]);

    // PAGINATION CALCULATIONS
    const indexOfLast = currentPage * rowsPerPage;
    const indexOfFirst = indexOfLast - rowsPerPage;
    const currentItems = filteredInventory.slice(indexOfFirst, indexOfLast);
    const totalPages = Math.ceil(filteredInventory.length / rowsPerPage);

    // Handle rows input change
    const handleRowsChange = (e) => {
        const val = e.target.value;
        setRowsInput(val);

        if (val !== '' && !isNaN(val) && parseInt(val) > 0) {
            setRowsPerPage(parseInt(val));
            setCurrentPage(1);
        }
    };

    if (loading) {
        return <div className={styles.loading}>Loading inventory...</div>;
    }

    return (
        <div className={styles.container}>
            <div className={styles.contentArea}>
                <h1>Inventory ({branchName})</h1>

                {error && <div className={styles.errorMessage}>{error}</div>}

                <div>

                    {/* SEARCH BAR */}
                    <div className={styles.searchRow}>
                        <input
                            type="text"
                            placeholder="Search Product ID, Name, Company..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className={styles.searchInput}
                        />
                    </div>

                    {/* TABLE */}
                    <div className={styles.tableWrapper}>
                        <table className={styles.table}>
                            <thead className={styles.thead}>
                                <tr>
                                    <th>Product ID</th>
                                    <th>Product Name</th>
                                    <th>Model No.</th>
                                    <th>Company</th>
                                    <th>Quantity</th>
                                    <th>Last Updated</th>
                                </tr>
                            </thead>

                            <tbody>
                                {currentItems.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className={styles.emptyState}>
                                            No inventory found.
                                        </td>
                                    </tr>
                                ) : (
                                    currentItems.map((item) => (
                                        <tr key={item._id} className={styles.tr}>
                                            <td>{item.product_id}</td>
                                            <td>{item.product_name}</td>
                                            <td>{item.model_no}</td>
                                            <td>{item.company_name}</td>
                                            <td>{item.quantity}</td>
                                            <td>{new Date(item.updatedAt).toLocaleDateString()}</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* PAGINATION CONTROLS */}
                    {filteredInventory.length > 0 && (
                        <div className={styles.paginationControls}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <span>Rows per page:</span>
                                <input
                                    type="number"
                                    min="1"
                                    value={rowsInput}
                                    onChange={handleRowsChange}
                                    className={styles.rowsInput}
                                />
                            </div>

                            <div>
                                <button
                                    className={styles.pageButton}
                                    onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                                    disabled={currentPage === 1}
                                >
                                    Previous
                                </button>

                                <span style={{ margin: '0 10px' }}>
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

                </div>
            </div>
        </div>
    );
};

export default ManagerInventoryPage;
