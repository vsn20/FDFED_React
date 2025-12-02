import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchSales, resetStatus } from '../../../redux/slices/salesmanSalesSlice';
import styles from './SalesList.module.css'; 

const SalesList = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchTerm, setSearchTerm] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const { items, status, error } = useSelector((state) => state.salesmanSales);

  useEffect(() => {
    if (location.state?.successMessage) {
      setSuccessMsg(location.state.successMessage);
      window.history.replaceState({}, document.title);
      const timer = setTimeout(() => setSuccessMsg(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [location]);

  useEffect(() => {
    dispatch(fetchSales());
    return () => { dispatch(resetStatus()); }
  }, [dispatch]);

  const filteredSales = items.filter(sale => 
    sale.sales_id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (status === 'loading') return <div>Loading...</div>;

  return (
    <div className={styles.salesContainer}>
      <div className={styles.header}>
        <h1>Your Sales</h1>
        <Link to="/salesman/sales/add" className={styles.addButton}>Add Sale</Link>
      </div>
      
      {status === 'failed' && <p className={styles.errorMessage}>{error}</p>}
      {successMsg && <p className={styles.successMessage}>{successMsg}</p>}
      
      <div className={styles.searchContainer}>
        <input
          type="text"
          id="searchInput"
          className={styles.searchInput}
          placeholder="Search by Sale ID..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className={styles.tableWrapper}>
        <table className={styles.salesTable}>
          <thead>
            <tr>
              <th>Sale ID</th>
              <th>Product</th>
              <th>Company</th>
              <th>Price</th>
              <th>Profit</th>
              <th>Sale Date</th>
            </tr>
          </thead>
          <tbody>
            {filteredSales.length > 0 ? (
              filteredSales.map(sale => (
                <tr 
                  key={sale.sales_id} 
                  onClick={() => navigate(`/salesman/sales/${sale.sales_id}`)}
                  title="Click to view details"
                >
                  <td data-label="Sale ID">{sale.sales_id}</td>
                  <td data-label="Product">{sale.product_name}</td>
                  <td data-label="Company">{sale.company_name}</td>
                  {/* Using toFixed(0) to ensure Integer Display */}
                  <td data-label="Price">₹{parseFloat(sale.total_amount).toFixed(0)}</td>
                  <td data-label="Profit" style={{ color: sale.profit_or_loss >= 0 ? 'green' : 'red' }}>
                    ₹{parseFloat(sale.profit_or_loss).toFixed(0)}
                  </td>
                  <td data-label="Sale Date">{new Date(sale.saledate).toLocaleDateString()}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6">No sales found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SalesList;