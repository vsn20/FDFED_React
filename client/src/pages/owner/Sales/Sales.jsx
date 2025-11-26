import React, { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import SaleDetails from './SaleDetails';
import './Sales.css';
import api from '../../../api/api';

const OwnerSales = () => {
    // Data States
    const [allSales, setAllSales] = useState([]);
    const [filteredSales, setFilteredSales] = useState([]);
    const [selectedSaleId, setSelectedSaleId] = useState(null);
    
    // Filter States
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedBranch, setSelectedBranch] = useState('');
    const [selectedCompany, setSelectedCompany] = useState('');
    const [selectedProduct, setSelectedProduct] = useState('');

    // Pagination States
    const [currentPage, setCurrentPage] = useState(1);
    const [salesPerPage, setSalesPerPage] = useState(5); // Actual Value used for logic
    const [salesPerPageInput, setSalesPerPageInput] = useState('5'); // Input Value
    
    useEffect(() => {
        fetchSalesData();
    }, []);

    const fetchSalesData = async () => {
        try {
            const response = await api.get('/owner/sales');
            setAllSales(response.data);
            setFilteredSales(response.data);
        } catch (error) {
            console.error("Error fetching sales:", error);
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

        // 1. Filter by Search Query (Searching Everything: ID, Customer, Branch, Product, Company)
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

        // 2. Filter by Branch Dropdown
        if (selectedBranch) {
            result = result.filter(sale => sale.branch_name === selectedBranch);
        }

        // 3. Filter by Company Dropdown
        if (selectedCompany) {
            result = result.filter(sale => sale.company_name === selectedCompany);
        }

        // 4. Filter by Product Dropdown
        if (selectedProduct) {
            result = result.filter(sale => sale.product_name === selectedProduct);
        }
        
        setFilteredSales(result);
        setCurrentPage(1); // Reset to first page whenever filters change
    }, [searchQuery, selectedBranch, selectedCompany, selectedProduct, allSales]);

    // Pagination Calculation
    const indexOfLastSale = currentPage * salesPerPage;
    const indexOfFirstSale = indexOfLastSale - salesPerPage;
    const currentSales = filteredSales.slice(indexOfFirstSale, indexOfLastSale);
    const totalPages = Math.ceil(filteredSales.length / salesPerPage);

    // Handlers
    const handlePageChange = (pageNumber) => {
        if (pageNumber >= 1 && pageNumber <= totalPages) {
            setCurrentPage(pageNumber);
        }
    };

    // Input Change Handler (Just updates the text box)
    const handleRowsInputChange = (e) => {
        setSalesPerPageInput(e.target.value);
    };

    // Enter Key Handler (Actually applies the change)
    const handleRowsInputKeyDown = (e) => {
        if (e.key === 'Enter') {
            const number = parseInt(salesPerPageInput, 10);
            if (!isNaN(number) && number > 0) {
                setSalesPerPage(number);
                setCurrentPage(1);
            } else {
                // Reset input to current valid value if invalid
                setSalesPerPageInput(String(salesPerPage));
            }
        }
    };

    const handleRowClick = (id) => {
        setSelectedSaleId(id);
    };

    const handleBackToTable = () => {
        setSelectedSaleId(null);
    };

    const resetFilters = () => {
        setSearchQuery('');
        setSelectedBranch('');
        setSelectedCompany('');
        setSelectedProduct('');
    };

    if (selectedSaleId) {
        return <SaleDetails saleId={selectedSaleId} onBack={handleBackToTable} />;
    }

    return (
        <div className="sales-container">
            <div className="sales-header">
                <h1 className="sales-title">Sales Overview</h1>
            </div>

            {/* Filters Section */}
            <div className="filters-wrapper">
                <div className="search-group">
                    <input
                        type="text"
                        className="sales-search-input"
                        placeholder="Search by ID, Branch, Product, Company or Customer..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                
                <div className="dropdown-group">
                    <select 
                        value={selectedBranch} 
                        onChange={(e) => setSelectedBranch(e.target.value)}
                        className="filter-select"
                    >
                        <option value="">All Branches</option>
                        {uniqueBranches.map(branch => (
                            <option key={branch} value={branch}>{branch}</option>
                        ))}
                    </select>

                    <select 
                        value={selectedCompany} 
                        onChange={(e) => setSelectedCompany(e.target.value)}
                        className="filter-select"
                    >
                        <option value="">All Companies</option>
                        {uniqueCompanies.map(company => (
                            <option key={company} value={company}>{company}</option>
                        ))}
                    </select>

                    <select 
                        value={selectedProduct} 
                        onChange={(e) => setSelectedProduct(e.target.value)}
                        className="filter-select"
                    >
                        <option value="">All Products</option>
                        {uniqueProducts.map(product => (
                            <option key={product} value={product}>{product}</option>
                        ))}
                    </select>

                    <button className="reset-btn" onClick={resetFilters}>
                        Reset
                    </button>
                </div>
            </div>

            {/* Table Section */}
            <div className="sales-table-wrapper">
                <table className="sales-table">
                    <thead>
                        <tr>
                            <th>Sale ID</th>
                            <th>Branch Name</th>
                            <th>Company</th>
                            <th>Product</th>
                            <th>Amount</th>
                            <th>Profit</th>
                            <th>Sale Date</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentSales.length > 0 ? (
                            currentSales.map((sale) => (
                                <tr 
                                    key={sale.sales_id} 
                                    onClick={() => handleRowClick(sale.sales_id)}
                                    className="clickable-row"
                                >
                                    <td>{sale.sales_id}</td>
                                    <td>{sale.branch_name}</td>
                                    <td>{sale.company_name}</td>
                                    <td>{sale.product_name}</td>
                                    <td className="amount-cell">${sale.amount.toFixed(2)}</td>
                                    <td className={sale.profit_or_loss >= 0 ? "profit-cell" : "loss-cell"}>
                                        ${sale.profit_or_loss.toFixed(2)}
                                    </td>
                                    <td>{new Date(sale.sales_date).toLocaleDateString()}</td>
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
                <div className="pagination-container">
                    <div className="rows-per-page">
                        <span>Rows per page:</span>
                        <input 
                            type="number" 
                            min="1"
                            max={filteredSales.length}
                            value={salesPerPageInput}
                            onChange={handleRowsInputChange}
                            onKeyDown={handleRowsInputKeyDown}
                            className="rows-input"
                            title="Press Enter to apply"
                        />
                    </div>

                    <div className="pagination-info">
                        Showing {indexOfFirstSale + 1} - {Math.min(indexOfLastSale, filteredSales.length)} of {filteredSales.length}
                    </div>

                    <div className="pagination-controls">
                        <button 
                            className="pagination-btn"
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                        >
                            Previous
                        </button>
                        
                        <span className="page-indicator">
                            Page {currentPage} of {totalPages}
                        </span>

                        <button 
                            className="pagination-btn"
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                        >
                            Next
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OwnerSales;