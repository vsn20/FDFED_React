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

const OwnerMessages = () => {
  const { token, user } = useContext(AuthContext);
  
  const [view, setView] = useState('inbox');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  const [composeOptions, setComposeOptions] = useState({
    companies: [],
    salesManagers: [],
    salesmen: [], 
    branches: []
  });
  
  const [composeData, setComposeData] = useState({
    category: 'all_salesman',
    to: '',
    branch_id: '',
    message: ''
  });

  // Styles (Kept as provided)
  const styles = {
    container: { width: '100%', padding: '2rem', boxSizing: 'border-box', backgroundColor: '#f8fafc', minHeight: '100vh', fontFamily: "'Inter', sans-serif" },
    contentArea: { backgroundColor: '#ffffff', borderRadius: '16px', padding: '2rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', minHeight: 'calc(100vh - 4rem)' },
    headerContainer: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' },
    heading: { color: '#1e293b', fontSize: '1.875rem', fontWeight: '700' },
    headerButtons: { display: 'flex', gap: '10px' },
    button: { padding: '0.75rem 1.5rem', backgroundColor: '#0f172a', color: 'white', border: 'none', borderRadius: '0.5rem', cursor: 'pointer' },
    buttonInactive: { padding: '0.75rem 1.5rem', backgroundColor: '#fff', color: '#64748b', border: '1px solid #cbd5e1', borderRadius: '0.5rem', cursor: 'pointer' },
    composeBtn: { padding: '0.75rem 1.5rem', backgroundColor: '#2ecc71', color: 'white', border: 'none', borderRadius: '0.5rem', cursor: 'pointer' },
    backLink: { padding: '0.5rem 1rem', border: '1px solid #cbd5e1', borderRadius: '0.5rem', cursor: 'pointer', background: 'white' },
    messageItem: { display: 'flex', justifyContent: 'space-between', padding: '1.25rem', border: '1px solid #e2e8f0', borderRadius: '12px', marginBottom: '10px', cursor: 'pointer', transition: 'transform 0.2s' },
    formSection: { backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '2rem', maxWidth: '800px', margin: '0 auto' },
    fieldGroup: { display: 'grid', gap: '1.5rem' },
    fieldWrapper: { display: 'flex', flexDirection: 'column', gap: '0.5rem' },
    fieldLabel: { fontSize: '0.875rem', fontWeight: '600', color: '#475569' },
    fieldInput: { padding: '0.75rem', border: '1px solid #cbd5e1', borderRadius: '0.5rem', width: '100%' },
    submitBtn: { width: '100%', padding: '1rem', backgroundColor: '#0f172a', color: 'white', border: 'none', borderRadius: '0.5rem', cursor: 'pointer', marginTop: '2rem' }
  };

  // --- SOCKET.IO LOGIC ---
  useEffect(() => {
    const socket = io(SOCKET_URL);

    socket.on('connect', () => {
      console.log('Connected to Socket.io');
    });

    socket.on('newMessage', (newMsg) => {
      // 1. INBOX LOGIC
      // If viewing inbox, and message is for Admin OR current user
      if (view === 'inbox') {
         if (newMsg.to === 'admin' || (user && newMsg.to === user.emp_id)) {
            setMessages(prev => [newMsg, ...prev]);
         }
      }
      // 2. SENT LOGIC
      // If viewing sent, and message is FROM current user
      if (view === 'sent') {
         if (user && newMsg.from === user.emp_id) {
            setMessages(prev => [newMsg, ...prev]);
         }
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [view, user]); // Dependencies ensure this updates when user/view changes

  useEffect(() => {
    const timer = setTimeout(() => { setDebouncedSearch(searchTerm); setCurrentPage(1); }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    if (view === 'inbox' || view === 'sent') fetchMessages();
    if (view === 'compose') fetchComposeOptions();
  }, [view, currentPage, debouncedSearch]);

  const fetchMessages = async () => {
    setLoading(true);
    try {
      // FIX: Changed /employees/messages to /owner/messages to match server.js
      const endpoint = view === 'inbox' ? '/owner/messages/inbox' : '/owner/messages/sent';
      const response = await fetch(`${API_BASE_URL}${endpoint}?page=${currentPage}&limit=10&search=${debouncedSearch}`, {
        headers: { 'x-auth-token': token, 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setMessages(data.messages);
        setTotalPages(data.totalPages);
      }
    } catch (err) { setError('Network Error'); } finally { setLoading(false); }
  };

  const fetchComposeOptions = async () => {
    try {
      // FIX: Changed /employees/messages to /owner/messages
      const response = await fetch(`${API_BASE_URL}/owner/messages/options`, {
        headers: { 'x-auth-token': token, 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setComposeOptions({
          companies: data.companies || [],
          salesManagers: data.salesManagers || [],
          salesmen: data.salesmen || [],
          branches: data.branches || []
        });
      }
    } catch (err) { console.error(err); }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    try {
      const csrf = await getCsrfToken();
      // FIX: Changed /employees/messages to /owner/messages
      const response = await fetch(`${API_BASE_URL}/owner/messages/send`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json', 'x-auth-token': token, 'Authorization': `Bearer ${token}`, 'x-csrf-token': csrf },
        body: JSON.stringify(composeData)
      });
      const result = await response.json();
      if (result.success) {
        alert('Message Sent!');
        setView('sent');
        setComposeData({ category: 'all_salesman', to: '', branch_id: '', message: '' });
      } else { alert(result.message); }
    } catch (err) { alert('Failed to send'); }
  };

  return (
    <div style={styles.container}>
      <div style={styles.contentArea}>
        <div style={styles.headerContainer}>
          <h1 style={styles.heading}>{view.charAt(0).toUpperCase() + view.slice(1)}</h1>
          {view === 'inbox' || view === 'sent' ? (
            <div style={styles.headerButtons}>
              <button style={view === 'inbox' ? styles.button : styles.buttonInactive} onClick={() => setView('inbox')}>Inbox</button>
              <button style={view === 'sent' ? styles.button : styles.buttonInactive} onClick={() => setView('sent')}>Sent</button>
              <button style={styles.composeBtn} onClick={() => setView('compose')}>+ Compose</button>
            </div>
          ) : <button style={styles.backLink} onClick={() => setView('inbox')}>&larr; Back</button>}
        </div>

        {(view === 'inbox' || view === 'sent') && (
          <div>
            <input type="text" style={{...styles.fieldInput, maxWidth: '300px', marginBottom: '20px'}} placeholder="Search..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
            {loading ? <p>Loading...</p> : messages.map(msg => (
              <div key={msg._id} style={styles.messageItem} onClick={() => {setSelectedMessage(msg); setView('details');}}>
                <div>
                  {/* Displaying enriched names immediately thanks to controller update */}
                  <div style={{fontWeight: 'bold'}}>{view === 'inbox' ? `From: ${msg.fromDisplay || msg.from}` : `To: ${msg.toDisplay || msg.to}`}</div>
                  <div style={{color: '#64748b'}}>{msg.message.substring(0, 100)}...</div>
                </div>
                <div>{new Date(msg.timestamp).toLocaleDateString()}</div>
              </div>
            ))}
          </div>
        )}

        {/* ... (Details view and Compose view remain largely the same, logic above fixed the data flow) ... */}
        {view === 'details' && selectedMessage && (
          <div style={styles.formSection}>
            <div style={styles.fieldGroup}>
              <div style={styles.fieldWrapper}>
                <label style={styles.fieldLabel}>From</label>
                <input value={selectedMessage.fromDisplay} style={{...styles.fieldInput, background: '#f8fafc'}} disabled />
              </div>
              <div style={styles.fieldWrapper}>
                <label style={styles.fieldLabel}>To</label>
                <input value={selectedMessage.toDisplay} style={{...styles.fieldInput, background: '#f8fafc'}} disabled />
              </div>
              <div style={styles.fieldWrapper}>
                <label style={styles.fieldLabel}>Message</label>
                <textarea value={selectedMessage.message} style={{...styles.fieldInput, background: '#f8fafc', minHeight: '150px'}} disabled />
              </div>
            </div>
          </div>
        )}

        {view === 'compose' && (
          <div style={styles.formSection}>
            <form onSubmit={handleSendMessage}>
              <div style={styles.fieldGroup}>
                <div style={styles.fieldWrapper}>
                  <label style={styles.fieldLabel}>Recipient Category</label>
                  <select style={styles.fieldInput} value={composeData.category} onChange={e => setComposeData({...composeData, category: e.target.value, to: '', branch_id: ''})}>
                    <option value="all_salesman">All Salesmen</option>
                    <option value="all_sales_manager">All Sales Managers</option>
                    <option value="all_companies">All Companies</option>
                    <option value="all_customers">All Customers</option>
                    <option value="specific_company">Specific Company</option>
                    <option value="specific_sales_manager">Specific Sales Manager</option>
                    <option value="specific_salesman">Specific Salesman</option>
                  </select>
                </div>

                {composeData.category === 'all_salesman' && (
                  <div style={styles.fieldWrapper}>
                    <label style={styles.fieldLabel}>Filter by Branch</label>
                    <select style={styles.fieldInput} value={composeData.branch_id} onChange={e => setComposeData({...composeData, branch_id: e.target.value})}>
                      <option value="">All Branches</option>
                      {composeOptions.branches.map(b => <option key={b.bid} value={b.bid}>{b.b_name}</option>)}
                    </select>
                  </div>
                )}

                {composeData.category === 'specific_company' && (
                  <div style={styles.fieldWrapper}>
                    <label style={styles.fieldLabel}>Select Company</label>
                    <select style={styles.fieldInput} required value={composeData.to} onChange={e => setComposeData({...composeData, to: e.target.value})}>
                      <option value="">-- Select --</option>
                      {composeOptions.companies.map(c => <option key={c.c_id} value={c.c_id}>{c.cname}</option>)}
                    </select>
                  </div>
                )}

                {composeData.category === 'specific_sales_manager' && (
                  <div style={styles.fieldWrapper}>
                    <label style={styles.fieldLabel}>Select Manager</label>
                    <select style={styles.fieldInput} required value={composeData.to} onChange={e => setComposeData({...composeData, to: e.target.value})}>
                      <option value="">-- Select --</option>
                      {composeOptions.salesManagers.map(m => <option key={m.e_id} value={m.e_id}>{m.f_name} {m.last_name}</option>)}
                    </select>
                  </div>
                )}

                {composeData.category === 'specific_salesman' && (
                  <div style={styles.fieldWrapper}>
                    <label style={styles.fieldLabel}>Select Salesman</label>
                    <select style={styles.fieldInput} required value={composeData.to} onChange={e => setComposeData({...composeData, to: e.target.value})}>
                      <option value="">-- Select --</option>
                      {composeOptions.salesmen.map(s => <option key={s.e_id} value={s.e_id}>{s.f_name} {s.last_name}</option>)}
                    </select>
                  </div>
                )}

                <div style={styles.fieldWrapper}>
                  <label style={styles.fieldLabel}>Message</label>
                  <textarea style={{...styles.fieldInput, minHeight: '150px'}} required value={composeData.message} onChange={e => setComposeData({...composeData, message: e.target.value})} />
                </div>
              </div>
              <button style={styles.submitBtn} type="submit">Send Message</button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default OwnerMessages;