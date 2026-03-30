import React, { useState, useEffect } from 'react';
import api from '../../../api/api';
import './ManagerSales.css';

const SaleDetails = ({ saleId, handleBack }) => {
    const [sale, setSale]     = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => { fetchSaleDetails(); }, [saleId]);

    const fetchSaleDetails = async () => {
        try {
            const res = await api.get(`/manager/sales/${saleId}`);
            setSale(res.data);
        } catch (err) {
            console.error("Error fetching sale details:", err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return (
        <div className="content-area">
            <div className="sale-detail-loading">Loading sale details…</div>
        </div>
    );

    if (!sale) return (
        <div className="content-area">
            <div className="sale-detail-loading">Sale not found.</div>
        </div>
    );

    const profit      = Number(sale.profit_or_loss || 0);
    const isProfitable = profit >= 0;
    const totalAmount  = Number(sale.amount || (sale.sold_price * sale.quantity) || 0);

    return (
        <div className="content-area">
            {/* Receipt card */}
            <div className="receipt-card">

                {/* Receipt header — dark strip */}
                <div className="receipt-header">
                    <div className="receipt-header-left">
                        <div className="receipt-sale-id">{sale.sales_id}</div>
                        <div className="receipt-header-sub">
                            {new Date(sale.sales_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}
                            {sale.unique_code && <span className="receipt-code-badge">{sale.unique_code}</span>}
                        </div>
                    </div>
                    <div className="receipt-total-block">
                        <div className="receipt-total-label">TOTAL AMOUNT</div>
                        <div className="receipt-total-value">
                            ₹{totalAmount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                        </div>
                        <div className={`receipt-pl-badge ${isProfitable ? 'receipt-pl-pos' : 'receipt-pl-neg'}`}>
                            {isProfitable ? '▲' : '▼'} P/L: ₹{Math.abs(profit).toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                        </div>
                    </div>
                </div>

                {/* Receipt body */}
                <div className="receipt-body">

                    {/* Parties row */}
                    <div className="receipt-parties">
                        <div className="receipt-party">
                            <div className="receipt-party-role">SOLD BY</div>
                            <div className="receipt-party-name">{sale.salesman_name}</div>
                            <div className="receipt-party-sub">{sale.branch_name}</div>
                        </div>
                        <div className="receipt-party-arrow">→</div>
                        <div className="receipt-party">
                            <div className="receipt-party-role">SOLD TO</div>
                            <div className="receipt-party-name">{sale.customer_name}</div>
                            <div className="receipt-party-sub">
                                {sale.phone_number && <span>{sale.phone_number}</span>}
                            </div>
                        </div>
                    </div>

                    <div className="receipt-divider-dashed" />

                    {/* Product section */}
                    <div className="receipt-section-label">PRODUCT</div>
                    <div className="receipt-product-block">
                        <div className="receipt-product-header">
                            <div className="receipt-product-name">{sale.product_name}</div>
                            <div className="receipt-product-meta">
                                {sale.company_name && <span className="receipt-company-tag">{sale.company_name}</span>}
                                {sale.model_number && <span className="receipt-model-tag">Model: {sale.model_number}</span>}
                            </div>
                        </div>

                        {/* Pricing breakdown table */}
                        <div className="receipt-pricing-grid">
                            <div className="receipt-pricing-row">
                                <span className="receipt-pricing-label">Purchased Price</span>
                                <span className="receipt-pricing-value">₹{Number(sale.purchased_price || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
                            </div>
                            <div className="receipt-pricing-row">
                                <span className="receipt-pricing-label">Sold Price (per unit)</span>
                                <span className="receipt-pricing-value">₹{Number(sale.sold_price || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
                            </div>
                            <div className="receipt-pricing-row">
                                <span className="receipt-pricing-label">Quantity</span>
                                <span className="receipt-pricing-value">{sale.quantity} unit{sale.quantity !== 1 ? 's' : ''}</span>
                            </div>
                            <div className="receipt-pricing-row receipt-pricing-total">
                                <span className="receipt-pricing-label">Total Amount</span>
                                <span className="receipt-pricing-value">₹{totalAmount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
                            </div>
                            <div className={`receipt-pricing-row ${isProfitable ? 'receipt-pl-row-pos' : 'receipt-pl-row-neg'}`}>
                                <span className="receipt-pricing-label">Profit / Loss</span>
                                <span className="receipt-pricing-value">
                                    {isProfitable ? '+' : '-'} ₹{Math.abs(profit).toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Profit bar */}
                    {Number(sale.purchased_price) > 0 && Number(sale.sold_price) > 0 && (
                        <div className="receipt-margin-bar-wrap">
                            <div className="receipt-margin-label">
                                <span>Cost</span>
                                <span>Margin: {(((sale.sold_price - sale.purchased_price) / sale.purchased_price) * 100).toFixed(1)}%</span>
                                <span>Revenue</span>
                            </div>
                            <div className="receipt-margin-track">
                                <div
                                    className={`receipt-margin-fill ${isProfitable ? 'receipt-margin-pos' : 'receipt-margin-neg'}`}
                                    style={{
                                        width: `${Math.min(100, (sale.purchased_price / sale.sold_price) * 100)}%`
                                    }}
                                />
                            </div>
                        </div>
                    )}

                    <div className="receipt-divider-dashed" />

                    {/* Metadata row */}
                    <div className="receipt-meta-grid">
                        <div className="receipt-meta-item">
                            <div className="receipt-meta-label">Payment Method</div>
                            <div className="receipt-meta-value">{(sale.payment_method || 'cash').toUpperCase()}</div>
                        </div>
                        <div className="receipt-meta-item">
                            <div className="receipt-meta-label">Payment Status</div>
                            <div className="receipt-meta-value">{(sale.payment_status || 'paid').toUpperCase()}</div>
                        </div>
                        <div className="receipt-meta-item">
                            <div className="receipt-meta-label">Branch</div>
                            <div className="receipt-meta-value">{sale.branch_name || '—'}</div>
                        </div>
                        {sale.phone_number && (
                            <div className="receipt-meta-item">
                                <div className="receipt-meta-label">Phone</div>
                                <div className="receipt-meta-value">{sale.phone_number}</div>
                            </div>
                        )}
                        {sale.customer_email && (
                            <div className="receipt-meta-item">
                                <div className="receipt-meta-label">Email</div>
                                <div className="receipt-meta-value">{sale.customer_email}</div>
                            </div>
                        )}
                        {sale.address && (
                            <div className="receipt-meta-item">
                                <div className="receipt-meta-label">Address</div>
                                <div className="receipt-meta-value">{sale.address}</div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Receipt footer */}
                <div className="receipt-footer">
                    <button className="back-link" onClick={handleBack}>← Back to Sales</button>
                </div>
            </div>
        </div>
    );
};

export default SaleDetails;