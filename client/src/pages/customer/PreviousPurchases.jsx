import React, { useEffect, useState, useMemo } from 'react';
import api from '../../api/api';
import './PreviousPurchases.css'; // Make sure this file exists!

const PreviousPurchases = () => {
    // Data States
    const [allSales, setAllSales] = useState([]);
    const [filteredSales, setFilteredSales] = useState([]);
    
    // View State (List or Details)
    const [selectedSale, setSelectedSale] = useState(null);

    // Filter States
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedBranch, setSelectedBranch] = useState('');
    const [selectedCompany, setSelectedCompany] = useState('');
    const [selectedProduct, setSelectedProduct] = useState('');

    // Pagination States
    const [currentPage, setCurrentPage] = useState(1);
    const [salesPerPage, setSalesPerPage] = useState(5);
    const [salesPerPageInput, setSalesPerPageInput] = useState('5');

    useEffect(() => {
        fetchSalesData();
    }, []);

    const fetchSalesData = async () => {
        try {
            const response = await api.get('/customer/previouspurchases');
            setAllSales(response.data);
            setFilteredSales(response.data);
        } catch (error) {
            console.error("Error fetching purchases:", error);
        }
    };

    // Extract Unique Values for Dropdowns
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
                (sale.branch_name && sale.branch_name.toLowerCase().includes(query)) ||
                (sale.product_name && sale.product_name.toLowerCase().includes(query)) ||
                (sale.company_name && sale.company_name.toLowerCase().includes(query))
            );
        }

        // 2. Dropdown Filters
        if (selectedBranch) result = result.filter(sale => sale.branch_name === selectedBranch);
        if (selectedCompany) result = result.filter(sale => sale.company_name === selectedCompany);
        if (selectedProduct) result = result.filter(sale => sale.product_name === selectedProduct);
        
        setFilteredSales(result);
        setCurrentPage(1); 
    }, [searchQuery, selectedBranch, selectedCompany, selectedProduct, allSales]);

    // Pagination Calculation
    const indexOfLastSale = currentPage * salesPerPage;
    const indexOfFirstSale = indexOfLastSale - salesPerPage;
    const currentSales = filteredSales.slice(indexOfFirstSale, indexOfLastSale);
    const totalPages = Math.ceil(filteredSales.length / salesPerPage);

    // Handlers
    const handlePageChange = (pageNumber) => {
        if (pageNumber >= 1 && pageNumber <= totalPages) setCurrentPage(pageNumber);
    };

    const handleRowsInputKeyDown = (e) => {
        if (e.key === 'Enter') {
            const number = parseInt(salesPerPageInput, 10);
            if (!isNaN(number) && number > 0) {
                setSalesPerPage(number);
                setCurrentPage(1);
            } else {
                setSalesPerPageInput(String(salesPerPage));
            }
        }
    };

    const resetFilters = () => {
        setSearchQuery('');
        setSelectedBranch('');
        setSelectedCompany('');
        setSelectedProduct('');
    };

    // --- RENDER DETAIL VIEW ---
    if (selectedSale) {
        return (
            <div className="sales-container">
                <button className="reset-btn" onClick={() => setSelectedSale(null)} style={{marginBottom: '20px'}}>
                    ← Back to List
                </button>
                <div className="sales-header">
                    <h1 className="sales-title">Purchase Details: {selectedSale.sales_id}</h1>
                </div>
                <div className="detail-card">
                    <div className="detail-grid">
                        <div className="detail-item"><label>Product Name:</label><span>{selectedSale.product_name}</span></div>
                        <div className="detail-item"><label>Company:</label><span>{selectedSale.company_name}</span></div>
                        <div className="detail-item"><label>Branch:</label><span>{selectedSale.branch_name}</span></div>
                        <div className="detail-item"><label>Purchase Date:</label><span>{new Date(selectedSale.sales_date).toLocaleDateString()}</span></div>
                        <div className="detail-item"><label>Amount:</label><span>₹{selectedSale.amount}</span></div>
                        <div className="detail-item"><label>Warranty Period:</label><span>{selectedSale.warrantyperiod}</span></div>
                        <div className="detail-item"><label>Installation Status:</label><span>{selectedSale.installation_status}</span></div>
                        <div className="detail-item"><label>Unique Code:</label><span>{selectedSale.unique_code}</span></div>
                    </div>
                </div>
            </div>
        );
    }

    // --- RENDER LIST VIEW ---
    return (
        <div className="sales-container">
            <div className="sales-header">
                <h1 className="sales-title">My Previous Purchases</h1>
            </div>

            {/* Filters */}
            <div className="filters-wrapper">
                <div className="search-group">
                    <input
                        type="text"
                        className="sales-search-input"
                        placeholder="Search purchases..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                
                <div className="dropdown-group">
                    <select value={selectedBranch} onChange={(e) => setSelectedBranch(e.target.value)} className="filter-select">
                        <option value="">All Branches</option>
                        {uniqueBranches.map(branch => <option key={branch} value={branch}>{branch}</option>)}
                    </select>

                    <select value={selectedCompany} onChange={(e) => setSelectedCompany(e.target.value)} className="filter-select">
                        <option value="">All Companies</option>
                        {uniqueCompanies.map(company => <option key={company} value={company}>{company}</option>)}
                    </select>

                    <select value={selectedProduct} onChange={(e) => setSelectedProduct(e.target.value)} className="filter-select">
                        <option value="">All Products</option>
                        {uniqueProducts.map(product => <option key={product} value={product}>{product}</option>)}
                    </select>

                    <button className="reset-btn" onClick={resetFilters}>Reset</button>
                </div>
            </div>

            {/* Table */}
            <div className="sales-table-wrapper">
                <table className="sales-table">
                    <thead>
                        <tr>
                            <th>Sale ID</th>
                            <th>Product Name</th>
                            <th>Company</th>
                            <th>Branch</th>
                            <th>Amount</th>
                            <th>Status</th>
                            <th>Date</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentSales.length > 0 ? (
                            currentSales.map((sale) => (
                                <tr key={sale.sales_id} onClick={() => setSelectedSale(sale)} className="clickable-row">
                                    <td >{sale.sales_id}</td>
                                    <td>{sale.product_name}</td>

                                    <td>{sale.company_name}</td>
                                    <td>{sale.branch_name}</td>
                                    <td className="amount-cell">₹{sale.amount.toLocaleString()}</td>
                                    <td>
                                        <span className={`status-badge ${sale.installation_status === 'Completed' ? 'success' : 'pending'}`}>
                                            {sale.installation_status}
                                        </span>
                                    </td>
                                    <td>{new Date(sale.sales_date).toLocaleDateString()}</td>
                                </tr>
                            ))
                        ) : (
                            <tr><td colSpan="7" style={{textAlign: 'center', padding: '20px'}}>No purchases found.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {filteredSales.length > 0 && (
                <div className="pagination-container">
                    <div className="rows-per-page">
                        <span>Rows per page:</span>
                        <input 
                            type="number" min="1" max={filteredSales.length}
                            value={salesPerPageInput}
                            onChange={(e) => setSalesPerPageInput(e.target.value)}
                            onKeyDown={handleRowsInputKeyDown}
                            className="rows-input"
                        />
                    </div>
                    <div className="pagination-controls">
                        <button className="pagination-btn" onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>Previous</button>
                        <span className="page-indicator">Page {currentPage} of {totalPages}</span>
                        <button className="pagination-btn" onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages}>Next</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PreviousPurchases;