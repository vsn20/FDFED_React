import React, { useState, useEffect } from 'react';
import api from '../../../api/api'; // Adjust path to your axios instance
import styles from './Inventory.module.css';

const Inventory = () => {
    const [stocks, setStocks] = useState([]);
    const [filteredStocks, setFilteredStocks] = useState([]);
    const [branchInfo, setBranchInfo] = useState({ id: '', name: '' });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchInventory = async () => {
            try {
                const response = await api.get('/salesman/inventory');
                if (response.data.success) {
                    setStocks(response.data.stocks);
                    setFilteredStocks(response.data.stocks);
                    setBranchInfo({
                        id: response.data.branchId,
                        name: response.data.branchName
                    });
                }
            } catch (err) {
                console.error("Error fetching inventory:", err);
                setError(err.response?.data?.message || "Failed to load inventory data.");
            } finally {
                setLoading(false);
            }
        };

        fetchInventory();
    }, []);

    // Handle Search Logic
    useEffect(() => {
        const lowerTerm = searchTerm.toLowerCase();
        const filtered = stocks.filter(stock => 
            stock.pname.toLowerCase().includes(lowerTerm) || 
            stock.pid.toLowerCase().includes(lowerTerm) ||
            stock.modelno.toLowerCase().includes(lowerTerm)
        );
        setFilteredStocks(filtered);
    }, [searchTerm, stocks]);

    if (loading) return <div className={styles.loading}>Loading Inventory...</div>;

    return (
        <div className={styles.container}>
            <div className={styles.contentArea}>
                
                {/* Header Section */}
                <div className={styles.headerContainer}>
                    <h1>Inventory</h1>
                    <div className={styles.searchContainer}>
                        <input 
                            type="text" 
                            placeholder="Search by Product Name, ID or Model..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {/* Error Message */}
                {error && <div className={styles.errorMessage}>{error}</div>}

                {/* Branch Info Box */}
                <div className={styles.branchInfo}>
                    <div className={styles.infoGroup}>
                        <span className={styles.infoLabel}>Branch ID</span>
                        <span className={styles.infoValue}>{branchInfo.id}</span>
                    </div>
                    <div className={styles.infoGroup}>
                        <span className={styles.infoLabel}>Branch Name</span>
                        <span className={styles.infoValue}>{branchInfo.name}</span>
                    </div>
                </div>

                {/* Table Section */}
                <div className={styles.tableWrapper}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>Product ID</th>
                                <th>Product Name</th>
                                <th>Company</th>
                                <th>Model No</th>
                                <th>Quantity</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredStocks.length > 0 ? (
                                filteredStocks.map((stock) => (
                                    <tr key={stock._id}>
                                        <td>{stock.pid}</td>
                                        <td>{stock.pname}</td>
                                        <td>{stock.cname}</td>
                                        <td>{stock.modelno}</td>
                                        <td>{stock.quantity}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className={styles.noData}>
                                        No products found matching your search.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

            </div>
        </div>
    );
};

export default Inventory;