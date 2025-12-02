import React, { useState, useEffect } from 'react';
import api from '../../../api/api';

const InventoryList = () => {
    // Data State
    const [inventory, setInventory] = useState([]);
    const [branches, setBranches] = useState([]);
    const [loading, setLoading] = useState(true);

    // Filter State
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedBranch, setSelectedBranch] = useState('');
    const [filteredInventory, setFilteredInventory] = useState([]);

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [rowsInput, setRowsInput] = useState("5");

    // Fetch Data on Mount
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [invRes, branchRes] = await Promise.all([
                    api.get('/owner/inventory'),
                    api.get('/owner/inventory/branches')
                ]);
                setInventory(invRes.data);
                setFilteredInventory(invRes.data);
                setBranches(branchRes.data);
                setLoading(false);
            } catch (err) {
                console.error("Error fetching inventory data:", err);
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    // Filter Logic
    useEffect(() => {
        let result = inventory;

        // 1. Text Search (Matches multiple columns like the EJS version)
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            result = result.filter(item => 
                (item.branch_id && item.branch_id.toLowerCase().includes(query)) ||
                (item.branch_name && item.branch_name.toLowerCase().includes(query)) ||
                (item.product_id && item.product_id.toLowerCase().includes(query)) ||
                (item.product_name && item.product_name.toLowerCase().includes(query)) ||
                (item.company_name && item.company_name.toLowerCase().includes(query)) ||
                (item.model_no && item.model_no.toLowerCase().includes(query))
            );
        }

        // 2. Branch Dropdown Filter
        if (selectedBranch) {
            result = result.filter(item => item.branch_id === selectedBranch);
        }

        setFilteredInventory(result);
        setCurrentPage(1); // Reset to first page on filter change
    }, [searchQuery, selectedBranch, inventory]);

    // Pagination Logic
    const indexOfLast = currentPage * rowsPerPage;
    const indexOfFirst = indexOfLast - rowsPerPage;
    const currentItems = filteredInventory.slice(indexOfFirst, indexOfLast);
    const totalPages = Math.ceil(filteredInventory.length / rowsPerPage);

    const handleRowsChange = (e) => {
        const val = e.target.value;
        setRowsInput(val);
        if (val !== '' && !isNaN(val) && parseInt(val) > 0) {
            setRowsPerPage(parseInt(val));
            setCurrentPage(1);
        }
    };

    const resetFilters = () => {
        setSearchQuery('');
        setSelectedBranch('');
    };

    if (loading) return <div className="content-area">Loading inventory...</div>;

    return (
        <div className="content-area">
          
                <h2>Inventory</h2>
            {/* Filters */}
            <div className="filters-bar">
                <input 
                    type="text" 
                    placeholder="Search by Branch, Product, Company or Model..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="filter-input"
                />
                <select 
                    value={selectedBranch} 
                    onChange={(e) => setSelectedBranch(e.target.value)}
                    className="filter-input"
                >
                    <option value="">All Branches</option>
                    {branches.map(b => (
                        <option key={b._id} value={b.bid}>{b.b_name} ({b.bid})</option>
                    ))}
                </select>
                <button onClick={resetFilters} className="btn-reset">Reset</button>
            </div>

            {/* Table */}
            <div className="table-wrapper">
                <table className="inventory-table">
                    <thead>
                        <tr>
                            <th>Branch ID</th>
                            <th>Branch Name</th>
                            <th>Product ID</th>
                            <th>Product Name</th>
                            <th>Company Name</th>
                            <th>Model No</th>
                            <th>Quantity</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentItems.length > 0 ? (
                            currentItems.map((item, index) => (
                                <tr key={item._id || index}>
                                    <td>{item.branch_id}</td>
                                    <td>{item.branch_name}</td>
                                    <td>{item.product_id}</td>
                                    <td>{item.product_name}</td>
                                    <td>{item.company_name}</td>
                                    <td>{item.model_no}</td>
                                    <td style={{fontWeight:'bold'}}>{item.quantity}</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="7" style={{textAlign:'center', padding:'20px'}}>
                                    No inventory found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {filteredInventory.length > 0 && (
                <div className="pagination-controls">
                    <div style={{display:'flex', alignItems:'center', gap:'10px', color:'#636e72', fontSize:'0.9rem'}}>
                        <span>Rows per page:</span>
                        <input 
                            type="number" 
                            min="1" 
                            value={rowsInput} 
                            onChange={handleRowsChange}
                            className="rows-input"
                        />
                    </div>
                    
                    <div style={{display:'flex', alignItems:'center'}}>
                        <button 
                            className="btn-page"
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                        >
                            Previous
                        </button>
                        <span style={{margin:'0 15px', fontSize:'0.9rem', color:'#2d3436'}}>
                            Page {currentPage} of {totalPages}
                        </span>
                        <button 
                            className="btn-page"
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
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

export default InventoryList;