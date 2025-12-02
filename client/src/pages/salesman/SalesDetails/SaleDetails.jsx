import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchSaleDetails, resetStatus } from '../../../redux/slices/salesmanSalesSlice';
import styles from './SaleDetails.module.css';

const SaleDetails = () => {
  const { sales_id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { currentItem: sale, status, error } = useSelector((state) => state.salesmanSales);

  useEffect(() => {
    if (sales_id) {
        dispatch(fetchSaleDetails(sales_id));
    }
    return () => { dispatch(resetStatus()); }
  }, [sales_id, dispatch]);

  if (status === 'loading') return <div>Loading...</div>;
  if (status === 'failed') return <div className={styles.errorMessage}>{error}</div>;
  if (!sale) return <div className={styles.errorMessage}>Sale not found.</div>;
  
  const formatDate = (dateString) => new Date(dateString).toLocaleDateString();

  return (
    <div className={styles.formContainer}>
      <h1>Sale Details</h1>
      <div className={styles.formWrapper}>
        <div className={styles.formSection}>
          <h2 className={styles.sectionTitle}>Sale Information</h2>
          <div className={styles.fieldGroup}>
            <div>
              <label className={styles.fieldLabel}>Sale ID</label>
              <input className={styles.fieldInput} type="text" value={sale.sales_id} readOnly />
            </div>
            <div>
              <label className={styles.fieldLabel}>Unique Code</label>
              <input className={styles.fieldInput} type="text" value={sale.unique_code} readOnly />
            </div>
            <div>
              <label className={styles.fieldLabel}>Sale Date</label>
              <input className={styles.fieldInput} type="text" value={formatDate(sale.saledate)} readOnly />
            </div>
            <div>
              <label className={styles.fieldLabel}>Salesman Name</label>
              <input className={styles.fieldInput} type="text" value={sale.salesman_name} readOnly />
            </div>
          </div>
        </div>

        <div className={styles.formSection}>
          <h2 className={styles.sectionTitle}>Customer Information</h2>
          <div className={styles.fieldGroup}>
            <div>
              <label className={styles.fieldLabel}>Customer Name</label>
              <input className={styles.fieldInput} type="text" value={sale.customer_name} readOnly />
            </div>
            <div>
              <label className={styles.fieldLabel}>Phone Number</label>
              <input className={styles.fieldInput} type="text" value={sale.phone_number || 'N/A'} readOnly />
            </div>
             <div>
              <label className={styles.fieldLabel}>Address</label>
              <input className={styles.fieldInput} type="text" value={sale.address || 'N/A'} readOnly />
            </div>
          </div>
        </div>

        <div className={styles.formSection}>
          <h2 className={styles.sectionTitle}>Product Information</h2>
          <div className={styles.fieldGroup}>
            <div>
              <label className={styles.fieldLabel}>Product Name</label>
              <input className={styles.fieldInput} type="text" value={sale.product_name} readOnly />
            </div>
            <div>
              <label className={styles.fieldLabel}>Model Number</label>
              <input className={styles.fieldInput} type="text" value={sale.model_number} readOnly />
            </div>
            <div>
              <label className={styles.fieldLabel}>Company Name</label>
              <input className={styles.fieldInput} type="text" value={sale.company_name} readOnly />
            </div>
          </div>
        </div>

        <div className={styles.formSection}>
          <h2 className={styles.sectionTitle}>Transaction Details</h2>
          <div className={styles.fieldGroup}>
            <div>
              <label className={styles.fieldLabel}>Purchased Price</label>
              {/* Display rounded integer */}
              <input className={styles.fieldInput} type="text" value={`₹${parseFloat(sale.purchased_price).toFixed(0)}`} readOnly />
            </div>
            <div>
              <label className={styles.fieldLabel}>Sold Price</label>
              <input className={styles.fieldInput} type="text" value={`₹${parseFloat(sale.sold_price).toFixed(0)}`} readOnly />
            </div>
            <div>
              <label className={styles.fieldLabel}>Quantity</label>
              <input className={styles.fieldInput} type="text" value={sale.quantity} readOnly />
            </div>
            <div>
              <label className={styles.fieldLabel}>Total Amount</label>
              <input className={styles.fieldInput} type="text" value={`₹${parseFloat(sale.amount).toFixed(0)}`} readOnly />
            </div>
            <div>
              <label className={styles.fieldLabel}>Profit/Loss</label>
              <input className={styles.fieldInput} type="text" value={`₹${parseFloat(sale.profit_or_loss).toFixed(0)}`} readOnly />
            </div>
          </div>
        </div>
        
        <button className={styles.backButton} onClick={() => navigate('/salesman/sales')}>
          Back to Sales
        </button>
      </div>
    </div>
  );
};

export default SaleDetails;