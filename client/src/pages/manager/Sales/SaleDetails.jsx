import React, { useState, useEffect } from 'react';
import api from '../../../api/api';
import './ManagerSales.css';
const SaleDetails = ({ saleId, handleBack }) => {
    const [sale, setSale] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchSaleDetails();
    }, [saleId]);

    const fetchSaleDetails = async () => {
        try {
            const res = await api.get(`/manager/sales/${saleId}`);
            setSale(res.data);
            setLoading(false);
        } catch (err) {
            console.error("Error fetching sale details:", err);
            setLoading(false);
        }
    };

    if (loading) return <div className="content-area">Loading sale details...</div>;
    if (!sale) return <div className="content-area">Sale not found.</div>;

    return (
        <div className="content-area">
            <h2>Sale Details</h2>

            <div id="sale-details-container">
                <h3>Sale Information</h3>
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
                        <label>Salesman Name</label>
                        <input type="text" value={sale.salesman_name} readOnly />
                    </div>
                    <div className="form-group">
                        <label>Customer Name</label>
                        <input type="text" value={sale.customer_name} readOnly />
                    </div>
                    <div className="form-group">
                        <label>Branch Name</label>
                        <input type="text" value={sale.branch_name} readOnly />
                    </div>
                </div>

                <h3>Product Information</h3>
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

                <h3>Transaction Details</h3>
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
                        <label>Profit/Loss</label>
                        <input type="text" value={`$${sale.profit_or_loss?.toFixed(2)}`} readOnly />
                    </div>
                    <div className="form-group">
                        <label>Phone Number</label>
                        <input type="text" value={sale.phone_number || 'N/A'} readOnly />
                    </div>
                </div>
            </div>

            <button onClick={handleBack} className="back-link">Back to Sales</button>
        </div>
    );
};

export default SaleDetails;