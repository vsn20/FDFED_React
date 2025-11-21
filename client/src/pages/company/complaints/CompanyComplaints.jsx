import React, { useState, useEffect, useContext } from 'react';
import AuthContext from '../../../context/AuthContext';

const API_BASE_URL = 'http://localhost:5001/api';

const CompanyComplaints = () => {
  const { token } = useContext(AuthContext);

  // State
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingId, setUpdatingId] = useState(null); // To track which row is updating

  // Pagination & Search State
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Styles
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
      marginBottom: '20px',
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
      minWidth: '800px'
    },
    th: {
      background: '#2d3436',
      color: 'white',
      padding: '12px 15px',
      textAlign: 'left',
      fontSize: '0.95rem',
      whiteSpace: 'nowrap'
    },
    td: {
      padding: '12px 15px',
      borderBottom: '1px solid #e6e9f0',
      color: '#2d3436',
      fontSize: '0.9rem',
      verticalAlign: 'top' // Align text to top for long descriptions
    },
    // Specific style for long text
    longTextCell: {
      padding: '12px 15px',
      borderBottom: '1px solid #e6e9f0',
      color: '#2d3436',
      fontSize: '0.9rem',
      verticalAlign: 'top',
      maxWidth: '300px',       // Limit width
      wordWrap: 'break-word',  // Force wrapping
      whiteSpace: 'normal'     // Allow multiple lines
    },
    select: {
      padding: '6px',
      borderRadius: '4px',
      border: '1px solid #bdc3c7',
      backgroundColor: '#f8f9fa',
      cursor: 'pointer'
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
    disabledBtn: {
      padding: '8px 16px',
      backgroundColor: '#bdc3c7',
      color: 'white',
      border: 'none',
      borderRadius: '5px',
      cursor: 'not-allowed'
    }
  };

  // Debounce Search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setCurrentPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Fetch Data
  const fetchComplaints = async () => {
    setLoading(true);
    try {
      const query = `?page=${currentPage}&limit=10&search=${debouncedSearch}`;
      const response = await fetch(`${API_BASE_URL}/company/complaints${query}`, {
        headers: {
          'x-auth-token': token,
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      
      if (data.success) {
        setComplaints(data.complaints);
        setTotalPages(data.totalPages);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Failed to fetch complaints');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, [currentPage, debouncedSearch]);

  // Handle Status Update
  const handleStatusChange = async (complaintId, newStatus) => {
    setUpdatingId(complaintId);
    try {
      const response = await fetch(`${API_BASE_URL}/company/complaints/${complaintId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token,
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      const result = await response.json();
      if (result.success) {
        // Update local state to reflect change without refetching
        setComplaints(prev => prev.map(c => 
          c.complaint_id === complaintId ? { ...c, status: newStatus } : c
        ));
      } else {
        alert('Failed to update status: ' + result.message);
      }
    } catch (err) {
      console.error(err);
      alert('Network error updating status');
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div style={{ background: '#f5f6fa', minHeight: '100vh' }}>
      <div style={styles.container}>
        <div style={styles.contentArea}>
          <h1 style={styles.heading}>Customer Complaints</h1>

          <div style={styles.controlsContainer}>
            <input 
              type="text" 
              placeholder="Search ID, Product, or Status..." 
              style={styles.searchInput}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {loading && complaints.length === 0 ? (
            <p>Loading complaints...</p>
          ) : error ? (
            <p style={{ color: 'red' }}>{error}</p>
          ) : (
            <>
              <div style={styles.tableContainer}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>Complaint ID</th>
                      <th style={styles.th}>Product ID</th>
                      <th style={styles.th}>Sale ID</th>
                      <th style={styles.th}>Complaint Info</th>
                      <th style={styles.th}>Date</th>
                      <th style={styles.th}>Phone</th>
                      <th style={styles.th}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {complaints.length > 0 ? complaints.map(complaint => (
                      <tr key={complaint.complaint_id} style={{ background: '#fff' }}>
                        <td style={styles.td}>{complaint.complaint_id}</td>
                        <td style={styles.td}>{complaint.product_id}</td>
                        <td style={styles.td}>{complaint.sale_id}</td>
                        
                        {/* Special styling for long text */}
                        <td style={styles.longTextCell}>
                          {complaint.complaint_info}
                        </td>
                        
                        <td style={styles.td}>
                          {new Date(complaint.complaint_date).toLocaleDateString()}
                        </td>
                        <td style={styles.td}>{complaint.phone_number}</td>
                        <td style={styles.td}>
                          <select 
                            style={styles.select}
                            value={complaint.status}
                            disabled={updatingId === complaint.complaint_id}
                            onChange={(e) => handleStatusChange(complaint.complaint_id, e.target.value)}
                          >
                            <option value="Open">Open</option>
                            <option value="Closed">Closed</option>
                          </select>
                          {updatingId === complaint.complaint_id && <span style={{fontSize: '0.8rem', marginLeft: '5px'}}>...</span>}
                        </td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan="7" style={{...styles.td, textAlign: 'center'}}>No complaints found.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div style={styles.pagination}>
                  <button 
                    style={currentPage === 1 ? styles.disabledBtn : styles.pageBtn}
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(prev => prev - 1)}
                  >
                    Previous
                  </button>
                  <span>Page {currentPage} of {totalPages}</span>
                  <button 
                    style={currentPage === totalPages ? styles.disabledBtn : styles.pageBtn}
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(prev => prev + 1)}
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CompanyComplaints;