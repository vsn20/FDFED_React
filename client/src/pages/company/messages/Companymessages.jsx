import React, { useState, useEffect, useContext } from 'react';
import AuthContext from '../../../context/AuthContext';
// IMPORT SOCKET
import io from 'socket.io-client';

const API_BASE_URL = 'http://localhost:5001/api';
const SOCKET_URL = 'http://localhost:5001';

const Companymessages = () => {
  // FIX: Get 'user' from context so we know our own ID (c_id)
  const { token, user } = useContext(AuthContext);

  // --- State ---
  const [view, setView] = useState('inbox');
  const [messages, setMessages] = useState([]);
  const [salesManagers, setSalesManagers] = useState([]);
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
    category: 'admin',
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
    // Connect to backend
    const socket = io(SOCKET_URL);

    socket.on('connect', () => {
      console.log('Company Connected to Socket.io');
    });

    socket.on('newMessage', (newMsg) => {
      // Logic to decide if we should show this message
      
      // 1. INBOX: If message is TO this company OR TO 'all_companies'
      if (view === 'inbox') {
        if (newMsg.to === user?.c_id || newMsg.to === 'all_companies') {
          setMessages(prev => [newMsg, ...prev]);
        }
      }

      // 2. SENT: If message is FROM this company
      if (view === 'sent') {
        if (newMsg.from === user?.c_id) {
          setMessages(prev => [newMsg, ...prev]);
        }
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [view, user]); // Dependencies ensure logic updates if user/view changes

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
  }, [view, currentPage, debouncedSearch]);

  useEffect(() => {
    if (view === 'compose' && salesManagers.length === 0) {
      fetchSalesManagers();
    }
  }, [view]);

  // --- API Calls ---
  const fetchMessages = async () => {
    setLoading(true);
    setError('');
    try {
      const endpoint = view === 'inbox' ? '/company/messages/inbox' : '/company/messages/sent';
      const query = `?page=${currentPage}&limit=10&search=${debouncedSearch}`;
      
      const response = await fetch(`${API_BASE_URL}${endpoint}${query}`, {
        headers: { 'x-auth-token': token, 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      
      if (data.success) {
        setMessages(data.messages);
        setTotalPages(data.totalPages);
      } else { setError('Failed to load messages'); }
    } catch (err) { setError('Network error'); } finally { setLoading(false); }
  };

  const fetchSalesManagers = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/company/messages/sales-managers`, {
        headers: { 'x-auth-token': token, 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) setSalesManagers(data.managers);
    } catch (err) { console.error(err); }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    setSending(true);
    try {
      const response = await fetch(`${API_BASE_URL}/company/messages/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-auth-token': token, 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(composeData)
      });
      const result = await response.json();
      
      if (result.success) {
        alert('Message sent!');
        setComposeData({ category: 'admin', to: '', message: '' });
        setView('sent');
      } else { alert(result.message); }
    } catch (err) { alert('Failed to send message'); } finally { setSending(false); }
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
                    {/* These will now be correct immediately due to backend enrichment fix */}
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
          <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} style={{...styles.btn, ...styles.inactiveBtn, cursor: currentPage === 1 ? 'not-allowed' : 'pointer'}}>Prev</button>
          <span style={{alignSelf:'center'}}>Page {currentPage} of {totalPages}</span>
          <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} style={{...styles.btn, ...styles.inactiveBtn, cursor: currentPage === totalPages ? 'not-allowed' : 'pointer'}}>Next</button>
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
              {view === 'inbox' && 'Inbox'}
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
                <div style={styles.formGroup}>
                  <label style={styles.label}>Recipient Category</label>
                  <select style={styles.select} value={composeData.category} onChange={(e) => setComposeData({...composeData, category: e.target.value, to: ''})}>
                    <option value="admin">Admin</option>
                    <option value="all_sales_manager">All Sales Managers</option>
                    <option value="specific_sales_manager">Specific Sales Manager</option>
                  </select>
                </div>

                {composeData.category === 'specific_sales_manager' && (
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Select Manager</label>
                    <select style={styles.select} value={composeData.to} required onChange={(e) => setComposeData({...composeData, to: e.target.value})}>
                      <option value="">-- Select Manager --</option>
                      {salesManagers.map(mgr => (
                        <option key={mgr.e_id} value={mgr.e_id}>{mgr.e_id} - {mgr.f_name} {mgr.last_name}</option>
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

export default Companymessages;