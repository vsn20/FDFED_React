import React, { useEffect, useState } from 'react';
import api from '../../../api/api';
import styles from './Sales.module.css';

const BackIcon = () => (
  <svg viewBox="0 0 24 24" width="13" height="13" stroke="currentColor" fill="none" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 18 9 12 15 6"/>
  </svg>
);

const SaleDetails = ({ saleId, onBack }) => {
  const [sale, setSale]     = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSaleDetails = async () => {
      try {
        const response = await api.get(`/owner/sales/${saleId}`);
        setSale(response.data);
      } catch (error) {
        console.error('Error fetching sale details:', error);
      } finally {
        setLoading(false);
      }
    };
    if (saleId) fetchSaleDetails();
  }, [saleId]);

  if (loading) return (
    <div className={styles.loadingState}><span className={styles.spinner}/> Loading details…</div>
  );
  if (!sale) return (
    <div className={styles.loadingState}>Sale not found.</div>
  );

  const isProfit = (sale.profit_or_loss || 0) >= 0;

  return (
    <div className={styles.detailViewContainer}>

      {/* Back */}
      <button className={styles.backBtn} onClick={onBack}>
        <BackIcon /> Back to Sales
      </button>

      {/* Hero */}
      <div className={styles.detailHero}>
        <div className={styles.detailHeroTop}>
          <div>
            <div className={styles.detailSaleId}>Sale Record</div>
            <div className={styles.detailTitle}>{sale.product_name}</div>
          </div>
          <div className={styles.detailAmountGroup}>
            <div className={styles.detailAmountLabel}>Total Amount</div>
            <div className={styles.detailAmount}>₹{sale.amount?.toFixed(2)}</div>
            <div>
              <span className={`${styles.detailPnlBadge} ${isProfit ? styles.profit : styles.loss}`}>
                {isProfit ? '▲ Profit' : '▼ Loss'}: ₹{Math.abs(sale.profit_or_loss).toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Sale Info Section */}
      <div className={styles.detailSection}>
        <div className={styles.detailSectionTitle}>Sale Information</div>
        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label>Sale ID</label>
            <input type="text" value={sale.sales_id} readOnly />
          </div>
          <div className={styles.formGroup}>
            <label>Unique Code</label>
            <input type="text" value={sale.unique_code || '—'} readOnly />
          </div>
          <div className={styles.formGroup}>
            <label>Sale Date</label>
            <input type="text" value={new Date(sale.sales_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })} readOnly />
          </div>
          <div className={styles.formGroup}>
            <label>Branch Name</label>
            <input type="text" value={sale.branch_name} readOnly />
          </div>
          <div className={styles.formGroup}>
            <label>Salesman</label>
            <input type="text" value={sale.salesman_name} readOnly />
          </div>
          <div className={styles.formGroup}>
            <label>Customer</label>
            <input type="text" value={sale.customer_name} readOnly />
          </div>
        </div>
      </div>

      {/* Product Section */}
      <div className={styles.detailSection}>
        <div className={styles.detailSectionTitle}>Product Information</div>
        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label>Product Name</label>
            <input type="text" value={sale.product_name} readOnly />
          </div>
          <div className={styles.formGroup}>
            <label>Model Number</label>
            <input type="text" value={sale.model_number} readOnly />
          </div>
          <div className={styles.formGroup}>
            <label>Company</label>
            <input type="text" value={sale.company_name} readOnly />
          </div>
        </div>
      </div>

      {/* Transaction Section */}
      <div className={styles.detailSection}>
        <div className={styles.detailSectionTitle}>Transaction Details</div>
        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label>Purchased Price</label>
            <input type="text" value={`₹${sale.purchased_price?.toFixed(2)}`} readOnly />
          </div>
          <div className={styles.formGroup}>
            <label>Sold Price</label>
            <input type="text" value={`₹${sale.sold_price?.toFixed(2)}`} readOnly />
          </div>
          <div className={styles.formGroup}>
            <label>Quantity</label>
            <input type="text" value={sale.quantity} readOnly />
          </div>
          <div className={styles.formGroup}>
            <label>Total Amount</label>
            <input type="text" value={`₹${sale.amount?.toFixed(2)}`} readOnly />
          </div>
          <div className={styles.formGroup}>
            <label>Profit / Loss</label>
            <input
              type="text"
              value={`₹${sale.profit_or_loss?.toFixed(2)}`}
              readOnly
              className={isProfit ? styles.profitInput : styles.lossInput}
            />
          </div>
        </div>
      </div>

    </div>
  );
};

export default SaleDetails;