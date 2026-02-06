import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../../../api/api';
import './CompanySales.css'; 

const CompanySaleDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [sale, setSale] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [newStatus, setNewStatus] = useState('');

    useEffect(() => {
        const fetchDetails = async () => {
            try {
                // Make Request (using api instance with CSRF handling)
                const res = await api.get(`/company/sales/${id}`);
                
                setSale(res.data.sale);
                setNewStatus(res.data.sale.installation_status || '');
                setLoading(false);
            } catch (err) {
                console.error("Error details:", err);
                setError(err.response?.data?.message || 'Error fetching details');
                setLoading(false);
            }
        };
        fetchDetails();
    }, [id]);

    const handleUpdateStatus = async () => {
        try {
            // Make PUT Request (using api instance with CSRF handling)
            await api.put(`/company/sales/${id}/installation`, 
                { installation_status: newStatus }
            );
            
            alert('Installation status updated successfully!');
            
            // Optional: Reload the specific part of data or the page
            // window.location.reload(); 
        } catch (err) {
            console.error("Update error:", err);
            alert(err.response?.data?.message || 'Failed to update status');
        }
    };

    if (loading) return <div>Loading Details...</div>;
    if (error) return <div className="error">{error}</div>;
    if (!sale) return <div>Sale not found</div>;

    return (
        <div className="details-container">
            <Link to="/company/sales" className="back-link">← Back to Sales</Link>
            <h2>Sale Details: {sale.sales_id}</h2>

            <div className="details-grid">
                {/* Sale Info */}
                <div className="card">
                    <h3>Sale Information</h3>
                    <p><strong>Date:</strong> {new Date(sale.sales_date).toLocaleDateString()}</p>
                    <p><strong>Unique Code:</strong> {sale.unique_code}</p>
                    <p><strong>Branch:</strong> {sale.branch_id?.branch_name || 'N/A'}</p>
                </div>

                {/* Product Info */}
                <div className="card">
                    <h3>Product Information</h3>
                    <p><strong>Product:</strong> {sale.product_id?.prod_name}</p>
                    <p><strong>Model:</strong> {sale.product_id?.model_no}</p>
                    <p><strong>Quantity:</strong> {sale.quantity}</p>
                </div>

                {/* Customer Info */}
                <div className="card">
                    <h3>Customer Information</h3>
                    <p><strong>Name:</strong> {sale.customer_name}</p>
                    <p><strong>Phone:</strong> {sale.phone_number}</p>
                    <p><strong>Address:</strong> {sale.address}</p>
                </div>

                {/* Installation Info */}
                <div className="card">
                    <h3>Installation & Feedback</h3>
                    <p><strong>Required:</strong> {sale.installation}</p>
                    <p><strong>Type:</strong> {sale.installationType || 'N/A'}</p>
                    
                    <div className="status-update-box">
                        <label>Installation Status:</label>
                        <select 
                            value={newStatus} 
                            onChange={(e) => setNewStatus(e.target.value)}
                        >
                            <option value="Pending">Pending</option>
                            <option value="Completed">Completed</option>
                            <option value="">None</option>
                        </select>
                        <button onClick={handleUpdateStatus} className="update-btn">Update</button>
                    </div>

                    <div className="feedback-section">
                        <p><strong>Rating:</strong> {sale.rating ? `${sale.rating} ⭐` : 'Not Rated'}</p>
                        <p><strong>Review:</strong> {sale.review || 'No review yet'}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CompanySaleDetails;