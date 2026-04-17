import React, { useState, useEffect, useContext } from 'react';
import AuthContext from '../../../context/AuthContext';
import io from 'socket.io-client';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api';
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5001';

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

  // ── UPDATED STYLES: White & Orange theme with strong text contrast ──
  const styles = {
    container: {
      width: '100%',
      padding: '2rem',
      boxSizing: 'border-box',
      backgroundColor: '#fff7f0',      // very light orange tint background
      minHeight: '100vh',
      fontFamily: "'Inter', sans-serif"
    },
    contentArea: {
      backgroundColor: '#ffffff',
      borderRadius: '16px',
      padding: '2rem',
      boxShadow: '0 4px 6px -1px rgba(234,88,12,0.08)',
      minHeight: 'calc(100vh - 4rem)'
    },
    headerContainer: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '2rem',
      borderBottom: '2px solid #ffedd5',
      paddingBottom: '1rem'
    },
    heading: {
      color: '#f5a814',               // deep orange — visible on white
      fontSize: '1.875rem',
      fontWeight: '700',
      margin: 0
    },
    headerButtons: {
      display: 'flex',
      gap: '10px'
    },
    // Active tab button — orange fill
    button: {
      padding: '0.75rem 1.5rem',
      backgroundColor: ' #f5a814',
      color: '#ffffff',
      border: 'none',
      borderRadius: '0.5rem',
      cursor: 'pointer',
      fontWeight: '600',
      fontSize: '0.875rem'
    },
    // Inactive tab button — white with orange border/text
    buttonInactive: {
      padding: '0.75rem 1.5rem',
      backgroundColor: '#ffffff',
      color: ' #f5a814',
      border: '1.5px solid #f5a814',
      borderRadius: '0.5rem',
      cursor: 'pointer',
      fontWeight: '600',
      fontSize: '0.875rem'
    },
    // Compose button — darker orange so it stands out
    composeBtn: {
      padding: '0.75rem 1.5rem',
      backgroundColor: ' #f5a814',
      color: '#ffffff',
      border: 'none',
      borderRadius: '0.5rem',
      cursor: 'pointer',
      fontWeight: '600',
      fontSize: '0.875rem'
    },
    backLink: {
      padding: '0.5rem 1rem',
      border: '1.5px solid #f5a814',
      borderRadius: '0.5rem',
      cursor: 'pointer',
      background: '#ffffff',
      color: ' #f5a814',               // orange text on white
      fontWeight: '600',
      fontSize: '0.875rem'
    },
    // Message list card
    messageItem: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      padding: '1.25rem',
      border: '1px solid #fed7aa',    // light orange border
      borderRadius: '12px',
      marginBottom: '10px',
      cursor: 'pointer',
      backgroundColor: '#ffffff',
      transition: 'background-color 0.2s, transform 0.2s',
    },
    messageItemHover: {
      backgroundColor: '#fff7f0',
    },
    messageSender: {
      fontWeight: '700',
      color: '#1e293b',               // near-black — maximum readability on white
      fontSize: '0.95rem',
      marginBottom: '4px'
    },
    messagePreview: {
      color: '#64748b',               // medium slate — visible on white
      fontSize: '0.875rem'
    },
    messageDate: {
      color: '#f5a814',               // orange date stamp
      fontSize: '0.8rem',
      fontWeight: '500',
      whiteSpace: 'nowrap',
      marginLeft: '1rem'
    },
    // Compose / Details card
    formSection: {
      backgroundColor: '#ffffff',
      border: '1px solid #fed7aa',
      borderRadius: '12px',
      padding: '2rem',
      maxWidth: '800px',
      margin: '0 auto'
    },
    fieldGroup: {
      display: 'grid',
      gap: '1.5rem'
    },
    fieldWrapper: {
      display: 'flex',
      flexDirection: 'column',
      gap: '0.5rem'
    },
    fieldLabel: {
      fontSize: '0.875rem',
      fontWeight: '600',
      color: '#f5a814',               // orange labels — visible on white
    },
    fieldInput: {
      padding: '0.75rem',
      border: '1.5px solid #fed7aa',
      borderRadius: '0.5rem',
      width: '100%',
      boxSizing: 'border-box',
      color: '#1e293b',               // dark text inside inputs
      backgroundColor: '#ffffff',
      fontSize: '0.9rem',
      outline: 'none'
    },
    fieldInputDisabled: {
      padding: '0.75rem',
      border: '1.5px solid #fed7aa',
      borderRadius: '0.5rem',
      width: '100%',
      boxSizing: 'border-box',
      color: '#374151',               // slightly muted but still readable
      backgroundColor: '#fff7f0',    // light orange tint for disabled/read-only
      fontSize: '0.9rem'
    },
    searchInput: {
      padding: '0.75rem 1rem',
      border: '1.5px solid #fed7aa',
      borderRadius: '0.5rem',
      maxWidth: '300px',
      marginBottom: '20px',
      width: '100%',
      boxSizing: 'border-box',
      color: '#1e293b',
      backgroundColor: '#ffffff',
      fontSize: '0.9rem',
      outline: 'none'
    },
    submitBtn: {
      width: '100%',
      padding: '1rem',
      backgroundColor: '#f5a814',
      color: '#ffffff',
      border: 'none',
      borderRadius: '0.5rem',
      cursor: 'pointer',
      marginTop: '2rem',
      fontWeight: '700',
      fontSize: '1rem',
      letterSpacing: '0.02em'
    },
    loadingText: {
      color: '#f5a814',
      fontWeight: '500',
      padding: '1rem 0'
    },
    errorText: {
      color: ' #f5a814',
      fontWeight: '500',
      padding: '1rem 0'
    }
  };

  // --- SOCKET.IO LOGIC ---
  useEffect(() => {
    const socket = io(SOCKET_URL);

    socket.on('connect', () => {
      console.log('Connected to Socket.io');
    });

    socket.on('newMessage', (newMsg) => {
      if (view === 'inbox') {
         if (newMsg.to === 'admin' || (user && newMsg.to === user.emp_id)) {
            setMessages(prev => [newMsg, ...prev]);
         }
      }
      if (view === 'sent') {
         if (user && newMsg.from === user.emp_id) {
            setMessages(prev => [newMsg, ...prev]);
         }
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [view, user]);

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
      const response = await fetch(`${API_BASE_URL}/owner/messages/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-auth-token': token, 'Authorization': `Bearer ${token}` },
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

        {/* ── HEADER ── */}
        <div style={styles.headerContainer}>
          <h1 style={styles.heading}>{view.charAt(0).toUpperCase() + view.slice(1)}</h1>
          {view === 'inbox' || view === 'sent' ? (
            <div style={styles.headerButtons}>
              <button style={view === 'inbox' ? styles.button : styles.buttonInactive} onClick={() => setView('inbox')}>Inbox</button>
              <button style={view === 'sent' ? styles.button : styles.buttonInactive} onClick={() => setView('sent')}>Sent</button>
              <button style={styles.composeBtn} onClick={() => setView('compose')}>+ Compose</button>
            </div>
          ) : (
            <button style={styles.backLink} onClick={() => setView('inbox')}>&larr; Back</button>
          )}
        </div>

        {/* ── INBOX / SENT LIST ── */}
        {(view === 'inbox' || view === 'sent') && (
          <div>
            <input
              type="text"
              style={styles.searchInput}
              placeholder="Search messages..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
            {loading ? (
              <p style={styles.loadingText}>Loading...</p>
            ) : error ? (
              <p style={styles.errorText}>{error}</p>
            ) : messages.length === 0 ? (
              <p style={{ color: '#94a3b8', padding: '1rem 0' }}>No messages found.</p>
            ) : (
              messages.map(msg => (
                <div
                  key={msg._id}
                  style={styles.messageItem}
                  onMouseEnter={e => e.currentTarget.style.backgroundColor = '#fff7f0'}
                  onMouseLeave={e => e.currentTarget.style.backgroundColor = '#ffffff'}
                  onClick={() => { setSelectedMessage(msg); setView('details'); }}
                >
                  <div>
                    <div style={styles.messageSender}>
                      {view === 'inbox'
                        ? `From: ${msg.fromDisplay || msg.from}`
                        : `To: ${msg.toDisplay || msg.to}`}
                    </div>
                    <div style={styles.messagePreview}>
                      {msg.message.substring(0, 100)}...
                    </div>
                  </div>
                  <div style={styles.messageDate}>
                    {new Date(msg.timestamp).toLocaleDateString()}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* ── DETAILS VIEW ── */}
        {view === 'details' && selectedMessage && (
          <div style={styles.formSection}>
            <div style={styles.fieldGroup}>
              <div style={styles.fieldWrapper}>
                <label style={styles.fieldLabel}>From</label>
                <input
                  value={selectedMessage.fromDisplay || selectedMessage.from}
                  style={styles.fieldInputDisabled}
                  disabled
                />
              </div>
              <div style={styles.fieldWrapper}>
                <label style={styles.fieldLabel}>To</label>
                <input
                  value={selectedMessage.toDisplay || selectedMessage.to}
                  style={styles.fieldInputDisabled}
                  disabled
                />
              </div>
              <div style={styles.fieldWrapper}>
                <label style={styles.fieldLabel}>Message</label>
                <textarea
                  value={selectedMessage.message}
                  style={{ ...styles.fieldInputDisabled, minHeight: '150px', resize: 'none' }}
                  disabled
                />
              </div>
            </div>
          </div>
        )}

        {/* ── COMPOSE VIEW ── */}
        {view === 'compose' && (
          <div style={styles.formSection}>
            <form onSubmit={handleSendMessage}>
              <div style={styles.fieldGroup}>

                <div style={styles.fieldWrapper}>
                  <label style={styles.fieldLabel}>Recipient Category</label>
                  <select
                    style={styles.fieldInput}
                    value={composeData.category}
                    onChange={e => setComposeData({ ...composeData, category: e.target.value, to: '', branch_id: '' })}
                  >
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
                    <select
                      style={styles.fieldInput}
                      value={composeData.branch_id}
                      onChange={e => setComposeData({ ...composeData, branch_id: e.target.value })}
                    >
                      <option value="">All Branches</option>
                      {composeOptions.branches.map(b => (
                        <option key={b.bid} value={b.bid}>{b.b_name}</option>
                      ))}
                    </select>
                  </div>
                )}

                {composeData.category === 'specific_company' && (
                  <div style={styles.fieldWrapper}>
                    <label style={styles.fieldLabel}>Select Company</label>
                    <select
                      style={styles.fieldInput}
                      required
                      value={composeData.to}
                      onChange={e => setComposeData({ ...composeData, to: e.target.value })}
                    >
                      <option value="">-- Select --</option>
                      {composeOptions.companies.map(c => (
                        <option key={c.c_id} value={c.c_id}>{c.cname}</option>
                      ))}
                    </select>
                  </div>
                )}

                {composeData.category === 'specific_sales_manager' && (
                  <div style={styles.fieldWrapper}>
                    <label style={styles.fieldLabel}>Select Manager</label>
                    <select
                      style={styles.fieldInput}
                      required
                      value={composeData.to}
                      onChange={e => setComposeData({ ...composeData, to: e.target.value })}
                    >
                      <option value="">-- Select --</option>
                      {composeOptions.salesManagers.map(m => (
                        <option key={m.e_id} value={m.e_id}>{m.f_name} {m.last_name}</option>
                      ))}
                    </select>
                  </div>
                )}

                {composeData.category === 'specific_salesman' && (
                  <div style={styles.fieldWrapper}>
                    <label style={styles.fieldLabel}>Select Salesman</label>
                    <select
                      style={styles.fieldInput}
                      required
                      value={composeData.to}
                      onChange={e => setComposeData({ ...composeData, to: e.target.value })}
                    >
                      <option value="">-- Select --</option>
                      {composeOptions.salesmen.map(s => (
                        <option key={s.e_id} value={s.e_id}>{s.f_name} {s.last_name}</option>
                      ))}
                    </select>
                  </div>
                )}

                <div style={styles.fieldWrapper}>
                  <label style={styles.fieldLabel}>Message</label>
                  <textarea
                    style={{ ...styles.fieldInput, minHeight: '150px', resize: 'vertical' }}
                    required
                    value={composeData.message}
                    onChange={e => setComposeData({ ...composeData, message: e.target.value })}
                  />
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