import React, { useState, useEffect } from 'react';
import api from '../../../api/api';
import AddSale from './AddSale';
import SaleDetails from './SaleDetails';
import './ManagerSales.css';

const Manager_Sales = () => {
    const [sales, setSales] = useState([]);
    const [viewMode, setViewMode] = useState('list');
    const [selectedSaleId, setSelectedSaleId] = useState(null);
    
    // Filters State
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredSales, setFilteredSales] = useState([]);
    
    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const [salesPerPage, setSalesPerPage] = useState(5);
    const [rowsInput, setRowsInput] = useState("5");

    useEffect(() => {
        if(viewMode === 'list') {
            fetchSales();
        }
    }, [viewMode]);

    const fetchSales = async () => {
        try {
            const res = await api.get('/manager/sales');
            setSales(res.data);
            setFilteredSales(res.data);
        } catch (err) {
            console.error("Error fetching sales:", err);
        }
    };

    // ------------ FIXED PREFIX SEARCH ------------
    useEffect(() => {
        let result = sales;

        if (searchQuery.trim() !== "") {
            const query = searchQuery.toLowerCase();

            result = sales.filter(s => {
                const id = s.sales_id?.toLowerCase() || "";
                const customer = s.customer_name?.toLowerCase() || "";
                const code = s.unique_code?.toLowerCase() || "";

                return (
                    id.startsWith(query) ||
                    customer.startsWith(query) ||
                    code.startsWith(query)
                );
            });
        }

        setFilteredSales(result);
        setCurrentPage(1);
    }, [searchQuery, sales]);


    // Pagination Logic
    const indexOfLast = currentPage * salesPerPage;
    const indexOfFirst = indexOfLast - salesPerPage;
    const currentSales = filteredSales.slice(indexOfFirst, indexOfLast);
    const totalPages = Math.ceil(filteredSales.length / salesPerPage);

    const handleRowClick = (id) => {
        setSelectedSaleId(id);
        setViewMode('details');
    };

    const handleBack = () => {
        setViewMode('list');
        setSelectedSaleId(null);
    };

    const handleRowsChange = (e) => {
        const val = e.target.value;
        setRowsInput(val);
        if (val !== '' && !isNaN(val) && parseInt(val) > 0) {
            setSalesPerPage(parseInt(val));
            setCurrentPage(1);
        }
    };

    return (
        <div className="manager-sales-container">
            {viewMode === 'list' && (
                <div className="content-area">
                    <div className="header-container">
                        <h2>Sales Management</h2>
                        <button className="back-link" onClick={() => setViewMode('add')}>
                            Add New Sale
                        </button>
                    </div>

                    <div className="form-row">
                        <div className="form-group" style={{flex: 1}}>
                            <input 
                                type="text" 
                                placeholder="Search by ID, Customer Name, or Code..." 
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>

                    <div style={{overflowX: 'auto'}}>
                        <table className="sales-table">
                            <thead>
                                <tr>
                                    <th>Sale ID</th>
                                    <th>Code</th>
                                    <th>Customer</th>
                                    <th>Product</th>
                                    <th>Amount</th>
                                    <th>Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentSales.length > 0 ? (
                                    currentSales.map((sale) => (
                                        <tr key={sale._id} onClick={() => handleRowClick(sale.sales_id)}>
                                            <td>{sale.sales_id}</td>
                                            <td>{sale.unique_code}</td>
                                            <td>{sale.customer_name}</td>
                                            <td>{sale.product_name}</td>
                                            <td>${sale.amount?.toFixed(2)}</td>
                                            <td>{new Date(sale.sales_date).toLocaleDateString()}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr><td colSpan="6" style={{textAlign:'center', padding:'20px'}}>No sales found.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {filteredSales.length > 0 && (
                        <div className="pagination-controls">
                            <div style={{display:'flex', alignItems:'center', gap:'10px'}}>
                                <span>Rows per page:</span>
                                <input 
                                    type="number" 
                                    min="1" 
                                    value={rowsInput} 
                                    onChange={handleRowsChange}
                                    className="rows-input"
                                />
                            </div>

                            <div>
                                <button 
                                    className="back-link" 
                                    style={{padding: '5px 10px', margin: '0 5px'}}
                                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                    disabled={currentPage === 1}
                                >
                                    Previous
                                </button>
                                <span style={{margin: '0 10px'}}>Page {currentPage} of {totalPages}</span>
                                <button 
                                    className="back-link" 
                                    style={{padding: '5px 10px', margin: '0 5px'}}
                                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                    disabled={currentPage === totalPages}
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {viewMode === 'add' && <AddSale handleBack={handleBack} />}
            
            {viewMode === 'details' && selectedSaleId && (
                <SaleDetails saleId={selectedSaleId} handleBack={handleBack} />
            )}
        </div>
    );
};

export default Manager_Sales;
