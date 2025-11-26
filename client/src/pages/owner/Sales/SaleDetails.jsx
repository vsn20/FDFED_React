import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './Sales.css';
import api from '../../../api/api';

const SaleDetails = ({ saleId, onBack }) => {
    const [sale, setSale] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSaleDetails = async () => {
            try {
                // Ensure the endpoint matches your server setup
                const response = await api.get(`/owner/sales/${saleId}`);
                setSale(response.data);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching sale details:", error);
                setLoading(false);
            }
        };

        if (saleId) fetchSaleDetails();
    }, [saleId]);

    if (loading) return <div>Loading details...</div>;
    if (!sale) return <div>Sale not found</div>;

    return (
        <div className="detail-view-container">
            <button className="back-btn" onClick={onBack}>
                ← Back to Sales
            </button>
            
            <h2 className="sales-title">Sale Details: {sale.sales_id}</h2>

            <div className="detail-section">
                <h3 className="detail-section-title">Sale Information</h3>
                <div className="form-row">
                    <div className="form-group">
                        <label>Sale ID</label>
                        <input type="text" value={sale.sales_id} readOnly />
                    </div>
                    <div className="form-group">
                        <label>Unique Code</label>
                        <input type="text" value={sale.unique_code} readOnly />
                    </div>
                    <div className="form-group">
                        <label>Sale Date</label>
                        <input type="text" value={new Date(sale.sales_date).toLocaleDateString()} readOnly />
                    </div>
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label>Branch Name</label>
                        <input type="text" value={sale.branch_name} readOnly />
                    </div>
                    <div className="form-group">
                        <label>Salesman Name</label>
                        <input type="text" value={sale.salesman_name} readOnly />
                    </div>
                    <div className="form-group">
                        <label>Customer Name</label>
                        <input type="text" value={sale.customer_name} readOnly />
                    </div>
                </div>

                <h3 className="detail-section-title">Product Information</h3>
                <div className="form-row">
                    <div className="form-group">
                        <label>Product Name</label>
                        <input type="text" value={sale.product_name} readOnly />
                    </div>
                    <div className="form-group">
                        <label>Model Number</label>
                        <input type="text" value={sale.model_number} readOnly />
                    </div>
                    <div className="form-group">
                        <label>Company Name</label>
                        <input type="text" value={sale.company_name} readOnly />
                    </div>
                </div>

                <h3 className="detail-section-title">Transaction Details</h3>
                <div className="form-row">
                    <div className="form-group">
                        <label>Purchased Price</label>
                        <input type="text" value={`$${sale.purchased_price?.toFixed(2)}`} readOnly />
                    </div>
                    <div className="form-group">
                        <label>Sold Price</label>
                        <input type="text" value={`$${sale.sold_price?.toFixed(2)}`} readOnly />
                    </div>
                    <div className="form-group">
                        <label>Quantity</label>
                        <input type="text" value={sale.quantity} readOnly />
                    </div>
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label>Total Amount</label>
                        <input type="text" value={`$${sale.amount?.toFixed(2)}`} readOnly />
                    </div>
                    <div className="form-group">
                        <label>Profit/Loss</label>
                        <input 
                            type="text" 
                            value={`$${sale.profit_or_loss?.toFixed(2)}`} 
                            style={{ color: sale.profit_or_loss >= 0 ? '#27ae60' : '#c0392b', fontWeight: 'bold' }}
                            readOnly 
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SaleDetails;