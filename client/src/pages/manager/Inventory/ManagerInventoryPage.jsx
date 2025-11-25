// src/pages/manager/ManagerInventoryPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import api from '../../../api/api';
import styles from './ManagerInventory.module.css'; 

const ManagerInventoryPage = () => {
    const [fullInventory, setFullInventory] = useState([]);
    const [filteredInventory, setFilteredInventory] = useState([]);
    const [branchName, setBranchName] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    const fetchInventory = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            // API call to the new manager inventory endpoint
            const res = await api.get('/manager/inventory'); 
            setFullInventory(res.data.data);
            setFilteredInventory(res.data.data); // Initialize filtered list
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

    // Filtering logic based on searchTerm
    useEffect(() => {
        const lowerCaseSearch = searchTerm.toLowerCase();
        
        if (!fullInventory || fullInventory.length === 0) {
            setFilteredInventory([]);
            return;
        }

        // Filter based on Product ID or Product Name
        const filtered = fullInventory.filter(item => 
            (item.product_id && item.product_id.toLowerCase().startsWith(lowerCaseSearch)) ||
            (item.product_name && item.product_name.toLowerCase().startsWith(lowerCaseSearch))
        );

        setFilteredInventory(filtered);
    }, [searchTerm, fullInventory]);

    if (loading) {
        return <div className={styles.loading}>Loading inventory...</div>;
    }

    return (
        <div className={styles.container}>
            <div className={styles.contentArea}>
                <h1>Inventory({branchName})</h1>

                {error && <div className={styles.errorMessage}>{error}</div>}

                <div>                    
                    <div className={styles.filterBar}>
                        <input
                            type="text"
                            id="searchInventory"
                            placeholder="Search by Product ID or Name..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className={styles.searchInput}
                        />
                    </div>

                    <div className={styles.tableWrapper}>
                        <table className={styles.table}>
                            <thead className={styles.thead}>
                                <tr>
                                    <th className={styles.th}>Product ID</th>
                                    <th className={styles.th}>Product Name</th>
                                    <th className={styles.th}>Model No.</th>
                                    <th className={styles.th}>Company</th>
                                    <th className={styles.th}>Quantity</th>
                                    <th className={styles.th}>Last Updated</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredInventory.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className={styles.emptyState}>
                                            No inventory records found for this branch or matching your search.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredInventory.map((item) => (
                                        <tr key={item._id} className={styles.tr}>
                                            <td className={styles.td} data-label="Product ID">{item.product_id}</td>
                                            <td className={styles.td} data-label="Product Name">{item.product_name}</td>
                                            <td className={styles.td} data-label="Model No.">{item.model_no}</td>
                                            <td className={styles.td} data-label="Company">{item.company_name}</td>
                                            <td className={styles.td} data-label="Quantity">{item.quantity}</td>
                                            <td className={styles.td} data-label="Last Updated">
                                                {new Date(item.updatedAt).toLocaleDateString()}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ManagerInventoryPage;