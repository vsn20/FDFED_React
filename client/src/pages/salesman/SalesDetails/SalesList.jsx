import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import api from '../../../api/api'; 
import styles from './SalesList.module.css'; 

const SalesList = () => {
  const [sales, setSales] = useState([]);
  const [filteredSales, setFilteredSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (location.state?.successMessage) {
      setSuccess(location.state.successMessage);
      window.history.replaceState({}, document.title);
      
      const timer = setTimeout(() => setSuccess(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [location]);

  useEffect(() => {
    const fetchSales = async () => {
      try {
        setLoading(true);
        const res = await api.get('/salesman/sales');
        setSales(res.data);
        setFilteredSales(res.data);
        setError('');
      } catch (err) {
        console.error("Error fetching sales:", err);
        setError(err.response?.data?.message || "Failed to load sales data");
      } finally {
        setLoading(false);
      }
    };
    fetchSales();
  }, []);

  useEffect(() => {
    const filter = searchTerm.toLowerCase();
    const filtered = sales.filter(sale => 
      sale.sales_id.toLowerCase().includes(filter)
    );
    setFilteredSales(filtered);
  }, [searchTerm, sales]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className={styles.salesContainer}>
      <div className={styles.header}>
        <h1>Your Sales</h1>
        <Link to="/salesman/sales/add" className={styles.addButton}>Add Sale</Link>
      </div>
      
      {error && <p className={styles.errorMessage}>{error}</p>}
      {success && <p className={styles.successMessage}>{success}</p>}
      
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
                  <td data-label="Price">${parseFloat(sale.total_amount).toFixed(2)}</td>
                  <td data-label="Profit" style={{ color: sale.profit_or_loss >= 0 ? 'green' : 'red' }}>
                    ${parseFloat(sale.profit_or_loss).toFixed(2)}
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