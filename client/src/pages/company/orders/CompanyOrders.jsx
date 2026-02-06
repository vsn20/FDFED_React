import React, { useState, useEffect, useContext } from 'react';
import AuthContext from '../../../context/AuthContext';

const API_BASE_URL = 'http://localhost:5001/api';

// CSRF Token Helper
let csrfToken = null;
const getCsrfToken = async () => {
  if (!csrfToken) {
    const res = await fetch(`${API_BASE_URL}/csrf-token`, { credentials: 'include' });
    const data = await res.json();
    csrfToken = data.csrfToken;
  }
  return csrfToken;
};

// --- STYLES (Adapted to include Table styles) ---
const styles = {
  container: {
    marginTop: '90px',
    display: 'flex',
    flex: 1,
    gap: '25px',
    padding: '0 20px',
    maxWidth: '100%'
  },
  contentArea: {
    background: '#ffffff',
    borderRadius: '15px',
    padding: '25px',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
    flex: 1,
    minHeight: 'calc(100vh - 90px)',
  },
  heading: {
    color: '#2d3436',
    marginBottom: '20px',
    fontSize: '1.5rem'
  },
  controlsContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
    flexWrap: 'wrap',
    gap: '10px'
  },
  searchInput: {
    padding: '10px',
    border: '1px solid #e6e9f0',
    borderRadius: '5px',
    width: '300px',
    fontSize: '1rem'
  },
  tableContainer: {
    overflowX: 'auto',
    borderRadius: '10px',
    border: '1px solid #e6e9f0'
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    minWidth: '600px'
  },
  th: {
    background: '#2d3436',
    color: 'white',
    padding: '12px 15px',
    textAlign: 'left',
    fontSize: '0.95rem'
  },
  td: {
    padding: '12px 15px',
    borderBottom: '1px solid #e6e9f0',
    color: '#2d3436',
    fontSize: '0.9rem'
  },
  statusBadge: (status) => {
    const colors = {
      pending: '#f39c12',
      accepted: '#3498db',
      shipped: '#9b59b6',
      delivered: '#27ae60',
      rejected: '#e74c3c',
      cancelled: '#7f8c8d'
    };
    return {
      backgroundColor: colors[status.toLowerCase()] || '#95a5a6',
      color: 'white',
      padding: '4px 8px',
      borderRadius: '4px',
      fontSize: '0.8rem',
      textTransform: 'capitalize',
      display: 'inline-block'
    };
  },
  editBtn: {
    padding: '6px 12px',
    backgroundColor: '#2d3436',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '0.85rem'
  },
  disabledBtn: {
    padding: '6px 12px',
    backgroundColor: '#bdc3c7',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'not-allowed',
    fontSize: '0.85rem'
  },
  pagination: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: '20px',
    gap: '15px'
  },
  pageBtn: {
    padding: '8px 16px',
    backgroundColor: '#2d3436',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer'
  },
  // Form specific styles
  formContainer: {
    maxWidth: '600px',
    margin: '0 auto'
  },
  formGroup: {
    marginBottom: '20px'
  },
  label: {
    display: 'block',
    marginBottom: '8px',
    fontWeight: '500',
    color: '#2d3436'
  },
  input: {
    width: '100%',
    padding: '10px',
    border: '1px solid #bdc3c7',
    borderRadius: '5px',
    fontSize: '1rem'
  },
  submitBtn: {
    width: '100%',
    padding: '12px',
    backgroundColor: '#27ae60',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    fontSize: '1.1rem',
    cursor: 'pointer',
    marginTop: '10px'
  },
  backBtn: {
    background: 'none',
    border: 'none',
    color: '#2d3436',
    textDecoration: 'underline',
    cursor: 'pointer',
    fontSize: '1rem',
    marginBottom: '15px'
  },
  message: {
    padding: '10px',
    borderRadius: '5px',
    marginBottom: '15px',
    textAlign: 'center'
  }
};

// --- CHILD COMPONENT: Edit Order Form ---
const EditOrderForm = ({ order, onBack, onUpdateSuccess }) => {
  const { token } = useContext(AuthContext);
  // Initialize date from order or default to empty
  const initialDate = order.delivery_date ? new Date(order.delivery_date).toISOString().split('T')[0] : '';
  
  const [status, setStatus] = useState(order.status);
  const [deliveryDate, setDeliveryDate] = useState(initialDate);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const csrf = await getCsrfToken();
      const response = await fetch(`${API_BASE_URL}/company/orders/${order.order_id}`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token,
          'Authorization': `Bearer ${token}`,
          'x-csrf-token': csrf
        },
        body: JSON.stringify({
          status,
          delivery_date: deliveryDate
        })
      });

      const result = await response.json();

      if (result.success) {
        setSuccess('Order updated successfully!');
        setTimeout(() => {
          onUpdateSuccess(); // Refresh list and go back
        }, 1500);
      } else {
        setError(result.message || 'Update failed');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.formContainer}>
      <button onClick={onBack} style={styles.backBtn}>&larr; Back to Orders List</button>
      <h2 style={{...styles.heading, textAlign: 'center'}}>Edit Order: {order.order_id}</h2>
      
      {error && <div style={{...styles.message, background: '#fadbd8', color: '#721c24'}}>{error}</div>}
      {success && <div style={{...styles.message, background: '#d4edda', color: '#155724'}}>{success}</div>}

      <div style={{background: '#f8f9fa', padding: '15px', borderRadius: '8px', marginBottom: '20px'}}>
        <p><strong>Product:</strong> {order.product_name}</p>
        <p><strong>Branch:</strong> {order.branch_name}</p>
        <p><strong>Quantity:</strong> {order.quantity}</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div style={styles.formGroup}>
          <label style={styles.label}>Order Status</label>
          <select 
            style={styles.input} 
            value={status} 
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="pending">Pending</option>
            <option value="accepted">Accepted</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="rejected">Rejected</option>
          </select>
          <small style={{color: '#7f8c8d'}}>Note: Setting to 'Delivered' or 'Rejected' makes this final.</small>
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>Delivery Date</label>
          <input 
            type="date" 
            style={styles.input}
            value={deliveryDate}
            onChange={(e) => setDeliveryDate(e.target.value)}
            // Required if status is delivered
            required={status === 'delivered'}
          />
        </div>

        <button type="submit" style={styles.submitBtn} disabled={loading}>
          {loading ? 'Updating...' : 'Update Order'}
        </button>
      </form>
    </div>
  );
};


// --- PARENT COMPONENT: Main Orders List ---
const CompanyOrders = () => {
  const { token } = useContext(AuthContext);
  
  // State
  const [view, setView] = useState('list'); // 'list' or 'edit'
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Pagination & Search State
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setCurrentPage(1); // Reset to page 1 on new search
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Fetch Orders
  const fetchOrders = async () => {
    setLoading(true);
    try {
      const query = `?page=${currentPage}&limit=10&search=${debouncedSearch}`;
      const response = await fetch(`${API_BASE_URL}/company/orders${query}`, {
        headers: {
          'x-auth-token': token,
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      
      if (data.success) {
        setOrders(data.orders);
        setTotalPages(data.totalPages);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [currentPage, debouncedSearch]);

  // Handlers
  const handleEditClick = (order) => {
    setSelectedOrder(order);
    setView('edit');
  };

  const handleBack = () => {
    setSelectedOrder(null);
    setView('list');
  };

  const handleUpdateSuccess = () => {
    handleBack();
    fetchOrders(); // Refresh list
  };

  // Render
  return (
    <div style={{ background: '#f5f6fa', minHeight: '100vh' }}>
      <div style={styles.container}>
        <div style={styles.contentArea}>
          
          {view === 'list' ? (
            <>
              <h1 style={styles.heading}>Order Management</h1>
              
              <div style={styles.controlsContainer}>
                <input 
                  type="text" 
                  placeholder="Search by ID, Branch, or Product..." 
                  style={styles.searchInput}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              {loading ? (
                <p>Loading orders...</p>
              ) : error ? (
                <p style={{color: 'red'}}>{error}</p>
              ) : (
                <>
                  <div style={styles.tableContainer}>
                    <table style={styles.table}>
                      <thead>
                        <tr>
                          <th style={styles.th}>Order ID</th>
                          <th style={styles.th}>Branch</th>
                          <th style={styles.th}>Product</th>
                          <th style={styles.th}>Qty</th>
                          <th style={styles.th}>Date</th>
                          <th style={styles.th}>Status</th>
                          <th style={styles.th}>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {orders.length > 0 ? orders.map(order => (
                          <tr key={order.order_id}>
                            <td style={styles.td}>{order.order_id}</td>
                            <td style={styles.td}>{order.branch_name}</td>
                            <td style={styles.td}>{order.product_name}</td>
                            <td style={styles.td}>{order.quantity}</td>
                            <td style={styles.td}>
                              {new Date(order.ordered_date).toLocaleDateString()}
                            </td>
                            <td style={styles.td}>
                              <span style={styles.statusBadge(order.status)}>
                                {order.status}
                              </span>
                            </td>
                            <td style={styles.td}>
                              {/* Condition: Can only edit if NOT Delivered and NOT Rejected */}
                              {['delivered', 'rejected', 'cancelled'].includes(order.status.toLowerCase()) ? (
                                <button style={styles.disabledBtn} disabled>
                                  Locked
                                </button>
                              ) : (
                                <button 
                                  style={styles.editBtn} 
                                  onClick={() => handleEditClick(order)}
                                >
                                  Edit / Update
                                </button>
                              )}
                            </td>
                          </tr>
                        )) : (
                          <tr>
                            <td colSpan="7" style={{...styles.td, textAlign: 'center'}}>No orders found</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination Controls */}
                  {totalPages > 1 && (
                    <div style={styles.pagination}>
                      <button 
                        style={{...styles.pageBtn, background: currentPage === 1 ? '#bdc3c7' : '#2d3436'}}
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage(prev => prev - 1)}
                      >
                        Previous
                      </button>
                      <span>Page {currentPage} of {totalPages}</span>
                      <button 
                        style={{...styles.pageBtn, background: currentPage === totalPages ? '#bdc3c7' : '#2d3436'}}
                        disabled={currentPage === totalPages}
                        onClick={() => setCurrentPage(prev => prev + 1)}
                      >
                        Next
                      </button>
                    </div>
                  )}
                </>
              )}
            </>
          ) : (
            <EditOrderForm 
              order={selectedOrder} 
              onBack={handleBack} 
              onUpdateSuccess={handleUpdateSuccess} 
            />
          )}
          
        </div>
      </div>
    </div>
  );
};

export default CompanyOrders;