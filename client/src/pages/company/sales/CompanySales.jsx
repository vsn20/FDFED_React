import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './CompanySales.css';

const CompanySales = () => {
    const [sales, setSales] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchSales();
    }, []);

    const fetchSales = async () => {
        try {
            // 1. GET THE TOKEN
            const token = localStorage.getItem('token'); 

            // 2. ATTACH IT TO THE REQUEST
            const config = {
                headers: {
                    'Authorization': `Bearer ${token}`, // <--- THIS IS CRITICAL
                    'Content-Type': 'application/json'
                },
                withCredentials: true
            };

            // 3. SEND REQUEST
            const res = await axios.get('http://localhost:5001/api/company/sales', config);
            
            setSales(res.data.sales);
            setLoading(false);
        } catch (err) {
            // ... error handling
        }
    };

    // Client-side filtering
    const filteredSales = sales.filter(sale => 
        sale.sales_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sale.product_id?.prod_name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return <div className="loading">Loading Sales...</div>;
    if (error) return <div className="error-message">{error}</div>;

    return (
        <div className="company-sales-container">
            <div className="header-section">
                <h1>Sales Management</h1>
                <input 
                    type="text" 
                    placeholder="Search by Sale ID or Product Name..." 
                    className="search-input"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            <div className="table-responsive">
                <table className="sales-table">
                    <thead>
                        <tr>
                            <th>Sale ID</th>
                            <th>Branch Name</th>
                            <th>Product Name</th>
                            <th>Model No</th>
                            <th>Date</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredSales.length > 0 ? (
                            filteredSales.map((sale) => (
                                <tr key={sale.sales_id}>
                                    <td>{sale.sales_id}</td>
                                    <td>{sale.branch_id?.branch_name || 'N/A'}</td>
                                    <td>{sale.product_id?.prod_name || 'N/A'}</td>
                                    <td>{sale.product_id?.model_no || 'N/A'}</td>
                                    <td>{new Date(sale.sales_date).toLocaleDateString()}</td>
                                    <td>
                                        <Link to={`/company/sales/${sale.sales_id}`} className="view-btn">
                                            View Details
                                        </Link>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="6" className="text-center">No sales found</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default CompanySales;