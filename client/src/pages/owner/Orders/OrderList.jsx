import React, { useState, useEffect } from 'react';
import api from '../../../api/api';

const OrderList = ({ orders, loading, onOrderClick }) => {
    // Filter State
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedBranch, setSelectedBranch] = useState('');
    const [selectedDate, setSelectedDate] = useState('');
    const [filteredOrders, setFilteredOrders] = useState([]);
    
    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [rowsInput, setRowsInput] = useState("5");

    // Helper Data
    const [branches, setBranches] = useState([]);

    useEffect(() => {
        // Load Branches for dropdown
        const fetchBranches = async () => {
            try {
                const res = await api.get('/owner/orders/branches');
                setBranches(res.data);
            } catch (err) {
                console.error("Error loading branches", err);
            }
        };
        fetchBranches();
    }, []);

    // Filter Logic
    useEffect(() => {
        let result = orders;

        // Search (Order ID or Branch Name)
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            result = result.filter(o => 
                (o.order_id && o.order_id.toLowerCase().includes(query)) ||
                (o.branch_name && o.branch_name.toLowerCase().includes(query))
            );
        }

        // Branch Filter
        if (selectedBranch) {
            result = result.filter(o => o.branch_name === selectedBranch);
        }

        // Date Filter
        if (selectedDate) {
            // Compare YYYY-MM-DD
            result = result.filter(o => o.ordered_date && o.ordered_date.startsWith(selectedDate));
        }

        setFilteredOrders(result);
        setCurrentPage(1); // Reset page on filter
    }, [searchQuery, selectedBranch, selectedDate, orders]);

    // Pagination Logic
    const indexOfLast = currentPage * rowsPerPage;
    const indexOfFirst = indexOfLast - rowsPerPage;
    const currentOrders = filteredOrders.slice(indexOfFirst, indexOfLast);
    const totalPages = Math.ceil(filteredOrders.length / rowsPerPage);

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
        setSelectedDate('');
    };

    if (loading) return <div className="content-area">Loading orders...</div>;

    return (
        <div className="content-area">
             <h2>All Orders</h2>

            {/* Filters */}
            <div className="filters-bar">
                <input 
                    type="text" 
                    placeholder="Search Order ID or Branch..." 
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
                        <option key={b._id} value={b.b_name}>{b.b_name}</option>
                    ))}
                </select>
                <input 
                    type="date" 
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="filter-input"
                />
                <button onClick={resetFilters} className="btn-reset">Reset</button>
            </div>

            {/* Table */}
            <div className="table-wrapper">
                <table className="orders-table">
                    <thead>
                        <tr>
                            <th>Order ID</th>
                            <th>Branch</th>
                            <th>Company</th>
                            <th>Product</th>
                            <th>Status</th>
                            <th>Delivery Date</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentOrders.length > 0 ? (
                            currentOrders.map((order) => (
                                <tr key={order._id} onClick={() => onOrderClick(order.order_id)}>
                                    <td>{order.order_id}</td>
                                    <td>{order.branch_name}</td>
                                    <td>{order.company_name}</td>
                                    <td>{order.product_name}</td>
                                    <td>
                                        <span className={`status-badge status-${order.status?.toLowerCase()}`}>
                                            {order.status}
                                        </span>
                                    </td>
                                    <td>
                                        {order.delivery_date ? new Date(order.delivery_date).toLocaleDateString() : 'Not Set'}
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="6" style={{textAlign:'center', padding:'20px'}}>No orders found.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {filteredOrders.length > 0 && (
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

export default OrderList;