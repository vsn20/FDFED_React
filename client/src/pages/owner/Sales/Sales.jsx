import React, { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchSales } from '../../../redux/slices/saleSlice';
import SaleDetails from './SaleDetails';
import styles from './Sales.module.css';

const OwnerSales = () => {
    const dispatch = useDispatch();

    // 1. Get Data from Redux
    const { items: allSales, status } = useSelector((state) => state.sales);

    // 2. UI View State
    const [selectedSaleId, setSelectedSaleId] = useState(null);

    // 3. Filter State
    const [filteredSales, setFilteredSales] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedBranch, setSelectedBranch] = useState('');
    const [selectedCompany, setSelectedCompany] = useState('');
    const [selectedProduct, setSelectedProduct] = useState('');

    // 4. Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(5);
    const [itemsPerPageInput, setItemsPerPageInput] = useState('5');

    // Initial Fetch
    useEffect(() => {
        if (status === 'idle') {
            dispatch(fetchSales());
        }
    }, [status, dispatch]);

    // Sync Redux data with local state
    useEffect(() => {
        setFilteredSales(allSales);
    }, [allSales]);

    // Extract Unique Values for Dropdowns (Memoized)
    const uniqueBranches = useMemo(() => {
        return [...new Set(allSales.map(item => item.branch_name))].filter(Boolean).sort();
    }, [allSales]);

    const uniqueCompanies = useMemo(() => {
        return [...new Set(allSales.map(item => item.company_name))].filter(Boolean).sort();
    }, [allSales]);

    const uniqueProducts = useMemo(() => {
        return [...new Set(allSales.map(item => item.product_name))].filter(Boolean).sort();
    }, [allSales]);

    // Unified Filter Logic
    useEffect(() => {
        let result = allSales;

        // 1. Search Query
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            result = result.filter(sale => 
                (sale.sales_id && sale.sales_id.toLowerCase().includes(query)) ||
                (sale.customer_name && sale.customer_name.toLowerCase().includes(query)) ||
                (sale.branch_name && sale.branch_name.toLowerCase().includes(query)) ||
                (sale.product_name && sale.product_name.toLowerCase().includes(query)) ||
                (sale.company_name && sale.company_name.toLowerCase().includes(query))
            );
        }

        // 2. Branch Filter
        if (selectedBranch) {
            result = result.filter(sale => sale.branch_name === selectedBranch);
        }

        // 3. Company Filter
        if (selectedCompany) {
            result = result.filter(sale => sale.company_name === selectedCompany);
        }

        // 4. Product Filter
        if (selectedProduct) {
            result = result.filter(sale => sale.product_name === selectedProduct);
        }
        
        setFilteredSales(result);
        setCurrentPage(1); // Reset to first page whenever filters change
    }, [searchQuery, selectedBranch, selectedCompany, selectedProduct, allSales]);

    // Pagination Calculation
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredSales.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredSales.length / itemsPerPage);

    // Handlers
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
        setSelectedCompany('');
        setSelectedProduct('');
        setItemsPerPage(5);
        setItemsPerPageInput('5');
        setCurrentPage(1);
    };

    const handleRowClick = (id) => {
        setSelectedSaleId(id);
    };

    const handleBackToTable = () => {
        setSelectedSaleId(null);
    };

    if (status === 'loading') return <div className={styles.container}><p>Loading sales data...</p></div>;
    if (status === 'failed') return <div className={styles.container}><p>Error loading sales data.</p></div>;

    if (selectedSaleId) {
        return <SaleDetails saleId={selectedSaleId} onBack={handleBackToTable} />;
    }

    return (
        <div className={styles.container}>
            <div className={styles.contentArea}>
                <h1 className='page-header'>Sales Overview</h1>

                {/* Filters Section */}
                <div className={styles.controlsContainer}>
                    <div className={styles.searchGroup}>
                        <input
                            type="text"
                            className={styles.searchInput}
                            placeholder="Search by ID, Branch, Product, Company or Customer..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    
                    <div className={styles.filterGroup}>
                        <select 
                            value={selectedBranch} 
                            onChange={(e) => setSelectedBranch(e.target.value)}
                            className={styles.filterSelect}
                        >
                            <option value="">All Branches</option>
                            {uniqueBranches.map(branch => (
                                <option key={branch} value={branch}>{branch}</option>
                            ))}
                        </select>

                        <select 
                            value={selectedCompany} 
                            onChange={(e) => setSelectedCompany(e.target.value)}
                            className={styles.filterSelect}
                        >
                            <option value="">All Companies</option>
                            {uniqueCompanies.map(company => (
                                <option key={company} value={company}>{company}</option>
                            ))}
                        </select>

                        <select 
                            value={selectedProduct} 
                            onChange={(e) => setSelectedProduct(e.target.value)}
                            className={styles.filterSelect}
                        >
                            <option value="">All Products</option>
                            {uniqueProducts.map(product => (
                                <option key={product} value={product}>{product}</option>
                            ))}
                        </select>

                        <button className={styles.resetBtn} onClick={resetFilters}>
                            Reset
                        </button>
                    </div>
                </div>

                {/* Table Section */}
                <div className={styles.tableWrapper}>
                    <table className={styles.table}>
                        <thead className={styles.thead}>
                            <tr>
                                <th className={styles.th}>Sale ID</th>
                                <th className={styles.th}>Branch Name</th>
                                <th className={styles.th}>Company</th>
                                <th className={styles.th}>Product</th>
                                <th className={styles.th}>Amount</th>
                                <th className={styles.th}>Profit</th>
                                <th className={styles.th}>Sale Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentItems.length > 0 ? (
                                currentItems.map((sale) => (
                                    <tr 
                                        key={sale.sales_id} 
                                        onClick={() => handleRowClick(sale.sales_id)}
                                        className={styles.tr}
                                    >
                                        <td className={styles.td} data-label="Sale ID">{sale.sales_id}</td>
                                        <td className={styles.td} data-label="Branch">{sale.branch_name}</td>
                                        <td className={styles.td} data-label="Company">{sale.company_name}</td>
                                        <td className={styles.td} data-label="Product">{sale.product_name}</td>
                                        <td className={`${styles.td} ${styles.amountCell}`} data-label="Amount">
                                            ${sale.amount.toFixed(2)}
                                        </td>
                                        <td className={`${styles.td} ${sale.profit_or_loss >= 0 ? styles.profitCell : styles.lossCell}`} data-label="Profit">
                                            ${sale.profit_or_loss.toFixed(2)}
                                        </td>
                                        <td className={styles.td} data-label="Date">
                                            {new Date(sale.sales_date).toLocaleDateString()}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="7" style={{textAlign: 'center', padding: '20px'}}>
                                        No sales found matching criteria.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Controls */}
                {filteredSales.length > 0 && (
                    <div className={styles.paginationContainer}>
                        <div className={styles.rowsPerPage}>
                            <span>Rows per page:</span>
                            <input 
                                type="number" 
                                min="1"
                                max={filteredSales.length}
                                value={itemsPerPageInput}
                                onChange={handleRowsInputChange}
                                onKeyDown={handleRowsInputKeyDown}
                                className={styles.rowsInput}
                                title="Press Enter to apply"
                            />
                        </div>

                        <div className={styles.paginationInfo}>
                            Showing {indexOfFirstItem + 1} - {Math.min(indexOfLastItem, filteredSales.length)} of {filteredSales.length}
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
            </div>
        </div>
    );
};

export default OwnerSales;