import React, { useState, useEffect, useContext } from 'react';
import AuthContext from '../../../context/AuthContext'; 
import io from 'socket.io-client';

const API_BASE_URL = 'http://localhost:5001/api';
const SOCKET_URL = 'http://localhost:5001';

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

const ManagerMessages = () => {
  const { token, user } = useContext(AuthContext);
  
  // FIX: Based on your log, your user object uses 'id', not 'emp_id'
  // Logged in user object: { id: 'naman', role: 'manager', name: 'Sai Naman' }
  const myUserId = user?.id || user?.emp_id || user?.e_id;

  // --- State ---
  const [view, setView] = useState('inbox'); // 'inbox', 'sent', 'compose', 'details'
  const [messages, setMessages] = useState([]);
  
  // Recipient Data for Compose
  const [availableCompanies, setAvailableCompanies] = useState([]);
  const [branchSalesmen, setBranchSalesmen] = useState([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedMessage, setSelectedMessage] = useState(null);

  // Pagination & Search
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Compose Form State
  const [composeData, setComposeData] = useState({
    category: 'specific_salesman', 
    to: '',
    message: ''
  });
  const [sending, setSending] = useState(false);

  // --- Styles ---
  const styles = {
    container: { marginTop: '90px', display: 'flex', flex: 1, gap: '25px', padding: '0 20px', maxWidth: '100%' },
    contentArea: { background: '#ffffff', borderRadius: '15px', padding: '25px', boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)', flex: 1, minHeight: 'calc(100vh - 90px)', display: 'flex', flexDirection: 'column' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '15px' },
    heading: { color: '#2d3436', fontSize: '1.5rem', margin: 0 },
    navButtons: { display: 'flex', gap: '10px' },
    btn: { padding: '8px 16px', border: 'none', borderRadius: '5px', cursor: 'pointer', fontSize: '0.9rem', transition: 'background 0.3s' },
    activeBtn: { backgroundColor: '#2d3436', color: 'white' },
    inactiveBtn: { backgroundColor: '#dfe6e9', color: '#2d3436' },
    searchContainer: { marginBottom: '20px' },
    input: { padding: '10px', border: '1px solid #e6e9f0', borderRadius: '5px', fontSize: '0.9rem', width: '100%', maxWidth: '300px' },
    tableWrapper: { overflowX: 'auto', borderRadius: '10px', border: '1px solid #e6e9f0' },
    table: { width: '100%', borderCollapse: 'collapse', minWidth: '600px' },
    th: { background: '#2d3436', color: 'white', padding: '12px', textAlign: 'left', fontSize: '0.9rem' },
    td: { padding: '12px', borderBottom: '1px solid #e6e9f0', fontSize: '0.9rem', color: '#2d3436', cursor: 'pointer' },
    detailCard: { background: '#f8f9fa', padding: '20px', borderRadius: '10px', border: '1px solid #e6e9f0' },
    detailRow: { marginBottom: '15px' },
    label: { fontWeight: 'bold', display: 'block', marginBottom: '5px', color: '#636e72' },
    value: { color: '#2d3436', lineHeight: '1.5', whiteSpace: 'pre-wrap' },
    backBtn: { background: 'none', border: 'none', color: '#2d3436', textDecoration: 'underline', cursor: 'pointer', fontSize: '1rem', marginBottom: '15px', padding: 0 },
    formGroup: { marginBottom: '20px' },
    select: { width: '100%', padding: '10px', border: '1px solid #e6e9f0', borderRadius: '5px', backgroundColor: '#fff', fontSize: '0.9rem' },
    textarea: { width: '100%', padding: '10px', border: '1px solid #e6e9f0', borderRadius: '5px', fontSize: '0.9rem', minHeight: '150px', resize: 'vertical' },
    submitBtn: { backgroundColor: '#2d3436', color: 'white', padding: '12px 24px', border: 'none', borderRadius: '5px', cursor: 'pointer', fontSize: '1rem' },
    pagination: { display: 'flex', justifyContent: 'center', gap: '10px', marginTop: '20px' }
  };

  // --- SOCKET.IO CONNECTION ---
  useEffect(() => {
    const socket = io(SOCKET_URL);

    socket.on('connect', () => {
      console.log(`Manager (${myUserId}) Connected to Socket.io`);
    });

    socket.on('newMessage', (newMsg) => {
      console.log("Socket received:", newMsg);

      // 1. INBOX: Show if addressed to ME or 'all_sales_manager'
      if (view === 'inbox') {
        if (newMsg.to === myUserId || newMsg.to === 'all_sales_manager') {
          setMessages(prev => [newMsg, ...prev]);
        }
      }

      // 2. SENT: Show if sent by ME
      if (view === 'sent') {
        if (newMsg.from === myUserId) {
          setMessages(prev => [newMsg, ...prev]);
        }
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [view, myUserId]);

  // --- Effects ---
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setCurrentPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    if (view === 'inbox' || view === 'sent') {
      fetchMessages();
    }
    // Fetch compose data if switching to compose
    if (view === 'compose' && (availableCompanies.length === 0 || branchSalesmen.length === 0)) {
      fetchRecipients();
    }
  }, [view, currentPage, debouncedSearch]);

  // --- API Calls ---
  const fetchMessages = async () => {
    setLoading(true);
    setError('');
    try {
      const endpoint = view === 'inbox' ? '/manager/messages/inbox' : '/manager/messages/sent';
      const query = `?page=${currentPage}&limit=10&search=${debouncedSearch}`;
      
      const response = await fetch(`${API_BASE_URL}${endpoint}${query}`, {
        headers: { 'x-auth-token': token, 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      
      if (data.success) {
        setMessages(data.messages);
        setTotalPages(data.totalPages);
      } else { 
        setError('Failed to load messages'); 
      }
    } catch (err) { 
      setError('Network error'); 
    } finally { 
      setLoading(false); 
    }
  };

  const fetchRecipients = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/manager/messages/recipients`, {
        headers: { 'x-auth-token': token, 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      
      if (data.success) {
        // Accessing data.data because your controller returns { success: true, data: { ... } }
        setAvailableCompanies(data.data.companies || []);
        setBranchSalesmen(data.data.branchSalesmen || []);
      }
    } catch (err) { 
      console.error(err); 
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    setSending(true);
    try {
      const csrf = await getCsrfToken();
      const response = await fetch(`${API_BASE_URL}/manager/messages/send`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json', 'x-auth-token': token, 'Authorization': `Bearer ${token}`, 'x-csrf-token': csrf },
        body: JSON.stringify(composeData)
      });
      const result = await response.json();
      
      if (result.success) {
        alert('Message sent!');
        setComposeData({ category: 'specific_salesman', to: '', message: '' });
        setView('sent');
      } else { 
        alert(result.message); 
      }
    } catch (err) { 
      alert('Failed to send message'); 
    } finally { 
      setSending(false); 
    }
  };

  const handleRowClick = (msg) => { setSelectedMessage(msg); setView('details'); };

  const handleBack = () => {
    if (view === 'details') {
      if (selectedMessage.fromDisplay === 'You') setView('sent');
      else setView('inbox');
      setSelectedMessage(null);
    } else if (view === 'compose') { setView('inbox'); }
  };

  // --- Render Helpers ---
  const renderTable = () => (
    <>
      <div style={styles.searchContainer}>
        <input
          type="text"
          placeholder={view === 'inbox' ? "Search sender or message..." : "Search message..."}
          style={styles.input}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      <div style={styles.tableWrapper}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>{view === 'inbox' ? 'From' : 'To'}</th>
              <th style={styles.th}>Message Preview</th>
              <th style={styles.th}>Date</th>
            </tr>
          </thead>
          <tbody>
            {messages.length > 0 ? (
              messages.map(msg => (
                <tr 
                  key={msg._id} 
                  onClick={() => handleRowClick(msg)}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f1f2f6'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <td style={styles.td}>
                    {view === 'inbox' ? msg.fromDisplay : msg.toDisplay}
                  </td>
                  <td style={styles.td}>
                    {msg.message.length > 50 ? msg.message.substring(0, 50) + '...' : msg.message}
                  </td>
                  <td style={styles.td}>
                    {new Date(msg.timestamp).toLocaleDateString()}
                  </td>
                </tr>
              ))
            ) : (
              <tr><td colSpan="3" style={{...styles.td, textAlign: 'center'}}>No messages found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
      {totalPages > 1 && (
        <div style={styles.pagination}>
          <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} style={{...styles.btn, ...styles.inactiveBtn}}>Prev</button>
          <span>Page {currentPage} of {totalPages}</span>
          <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} style={{...styles.btn, ...styles.inactiveBtn}}>Next</button>
        </div>
      )}
    </>
  );

  return (
    <div style={{ background: '#f5f6fa', minHeight: '100vh' }}>
      <div style={styles.container}>
        <div style={styles.contentArea}>
          <div style={styles.header}>
            <h1 style={styles.heading}>
              {view === 'inbox' && 'Manager Inbox'}
              {view === 'sent' && 'Sent Messages'}
              {view === 'compose' && 'Compose Message'}
              {view === 'details' && 'Message Details'}
            </h1>
            {view !== 'details' && view !== 'compose' && (
              <div style={styles.navButtons}>
                <button onClick={() => { setView('inbox'); setCurrentPage(1); }} style={{...styles.btn, ...(view === 'inbox' ? styles.activeBtn : styles.inactiveBtn)}}>Inbox</button>
                <button onClick={() => { setView('sent'); setCurrentPage(1); }} style={{...styles.btn, ...(view === 'sent' ? styles.activeBtn : styles.inactiveBtn)}}>Sent</button>
                <button onClick={() => setView('compose')} style={{...styles.btn, backgroundColor: '#0984e3', color: 'white'}}>Compose</button>
              </div>
            )}
          </div>

          {error && <p style={{color: 'red'}}>{error}</p>}
          {loading && <p>Loading...</p>}

          {(view === 'inbox' || view === 'sent') && !loading && renderTable()}

          {view === 'details' && selectedMessage && (
            <div>
              <button onClick={handleBack} style={styles.backBtn}>&larr; Back</button>
              <div style={styles.detailCard}>
                <div style={styles.detailRow}><span style={styles.label}>From:</span><span style={styles.value}>{selectedMessage.fromDisplay}</span></div>
                <div style={styles.detailRow}><span style={styles.label}>To:</span><span style={styles.value}>{selectedMessage.toDisplay}</span></div>
                <div style={styles.detailRow}><span style={styles.label}>Date:</span><span style={styles.value}>{new Date(selectedMessage.timestamp).toLocaleString()}</span></div>
                <hr style={{margin: '15px 0', border: '0', borderTop: '1px solid #dfe6e9'}} />
                <div style={styles.detailRow}><span style={styles.label}>Message:</span><div style={styles.value}>{selectedMessage.message}</div></div>
              </div>
            </div>
          )}

          {view === 'compose' && (
            <div style={{ maxWidth: '600px' }}>
              <button onClick={handleBack} style={styles.backBtn}>&larr; Back to Inbox</button>
              <form onSubmit={handleSendMessage}>
                
                {/* 1. Category Selection */}
                <div style={styles.formGroup}>
                  <label style={styles.label}>Recipient Category</label>
                  <select style={styles.select} value={composeData.category} onChange={(e) => setComposeData({...composeData, category: e.target.value, to: ''})}>
                    <option value="specific_salesman">Specific Salesman (My Branch)</option>
                    <option value="all_companies">All Companies</option>
                    <option value="specific_company">Specific Company</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>

                {/* 2. Specific Salesman Dropdown */}
                {composeData.category === 'specific_salesman' && (
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Select Salesman</label>
                    <select style={styles.select} value={composeData.to} required onChange={(e) => setComposeData({...composeData, to: e.target.value})}>
                      <option value="">-- Select Salesman --</option>
                      {branchSalesmen.length > 0 ? (
                        branchSalesmen.map(emp => (
                          <option key={emp.e_id} value={emp.e_id}>{emp.e_id} - {emp.f_name} {emp.last_name}</option>
                        ))
                      ) : (
                        <option disabled>No salesmen found in your branch</option>
                      )}
                    </select>
                  </div>
                )}

                {/* 3. Specific Company Dropdown */}
                {composeData.category === 'specific_company' && (
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Select Company</label>
                    <select style={styles.select} value={composeData.to} required onChange={(e) => setComposeData({...composeData, to: e.target.value})}>
                      <option value="">-- Select Company --</option>
                      {availableCompanies.map(comp => (
                        <option key={comp.c_id} value={comp.c_id}>{comp.c_id} - {comp.cname}</option>
                      ))}
                    </select>
                  </div>
                )}

                <div style={styles.formGroup}>
                  <label style={styles.label}>Message</label>
                  <textarea style={styles.textarea} placeholder="Type your message here..." required value={composeData.message} onChange={(e) => setComposeData({...composeData, message: e.target.value})}></textarea>
                </div>

                <button type="submit" style={styles.submitBtn} disabled={sending}>{sending ? 'Sending...' : 'Send Message'}</button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManagerMessages;