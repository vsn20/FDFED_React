// src/pages/manager/ManagerMessages.jsx
import React, { useState, useEffect, useContext } from 'react';
import AuthContext from '../../../context/AuthContext';
import io from 'socket.io-client';
import styles from './ManagerMessages.module.css';

const API_BASE_URL = 'http://localhost:5001/api';
const SOCKET_URL = 'http://localhost:5001';

const ManagerMessages = () => {
  const { token, user } = useContext(AuthContext);
  const myUserId = user?.id || user?.emp_id || user?.e_id;

  // --- State ---
  const [view, setView] = useState('inbox'); // 'inbox' | 'sent' | 'compose' | 'details'
  const [messages, setMessages] = useState([]);

  // Recipient data for Compose
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

  // Compose form
  const [composeData, setComposeData] = useState({
    category: 'specific_salesman',
    to: '',
    message: ''
  });
  const [sending, setSending] = useState(false);

  // --- Socket.IO ---
  useEffect(() => {
    const socket = io(SOCKET_URL);

    socket.on('connect', () => {
      console.log(`Manager (${myUserId}) Connected to Socket.io`);
    });

    socket.on('newMessage', (newMsg) => {
      if (view === 'inbox' && (newMsg.to === myUserId || newMsg.to === 'all_sales_manager')) {
        setMessages(prev => [newMsg, ...prev]);
      }
      if (view === 'sent' && newMsg.from === myUserId) {
        setMessages(prev => [newMsg, ...prev]);
      }
    });

    return () => socket.disconnect();
  }, [view, myUserId]);

  // --- Debounce search ---
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setCurrentPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // --- Fetch on view / page / search change ---
  useEffect(() => {
    if (view === 'inbox' || view === 'sent') fetchMessages();
    if (view === 'compose' && availableCompanies.length === 0 && branchSalesmen.length === 0) {
      fetchRecipients();
    }
  }, [view, currentPage, debouncedSearch]);

  // --- API calls ---
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
    } catch {
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
      const response = await fetch(`${API_BASE_URL}/manager/messages/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token,
          'Authorization': `Bearer ${token}`
        },
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
    } catch {
      alert('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const handleRowClick = (msg) => { setSelectedMessage(msg); setView('details'); };

  const handleBack = () => {
    if (view === 'details') {
      setView(selectedMessage?.fromDisplay === 'You' ? 'sent' : 'inbox');
      setSelectedMessage(null);
    } else if (view === 'compose') {
      setView('inbox');
    }
  };

  // --- Heading label ---
  const headingText = {
    inbox: 'Manager Inbox',
    sent: 'Sent Messages',
    compose: 'Compose Message',
    details: 'Message Details'
  }[view];

  // --- Render helpers ---
  const renderTable = () => (
    <>
      <div className={styles.searchContainer}>
        <input
          type="text"
          placeholder={view === 'inbox' ? 'Search sender or message…' : 'Search message…'}
          className={styles.searchInput}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.th}>{view === 'inbox' ? 'From' : 'To'}</th>
              <th className={styles.th}>Message Preview</th>
              <th className={styles.th}>Date</th>
            </tr>
          </thead>
          <tbody>
            {messages.length > 0 ? (
              messages.map(msg => (
                <tr key={msg._id} onClick={() => handleRowClick(msg)}>
                  <td className={styles.td}>
                    {view === 'inbox' ? msg.fromDisplay : msg.toDisplay}
                  </td>
                  <td className={styles.td}>
                    {msg.message.length > 60 ? msg.message.substring(0, 60) + '…' : msg.message}
                  </td>
                  <td className={styles.td}>
                    {new Date(msg.timestamp).toLocaleDateString()}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="3" className={`${styles.td} ${styles.emptyState}`}>
                  No messages found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className={styles.pagination}>
          <button
            className={styles.pageButton}
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            Prev
          </button>
          <span>Page {currentPage} of {totalPages}</span>
          <button
            className={styles.pageButton}
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </div>
      )}
    </>
  );

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.contentArea}>

        {/* ── HEADER ── */}
        <div className={styles.header}>
          <h1 className={styles.heading}>{headingText}</h1>

          {view !== 'details' && view !== 'compose' && (
            <div className={styles.navButtons}>
              <button
                className={`${styles.btn} ${view === 'inbox' ? styles.activeBtn : styles.inactiveBtn}`}
                onClick={() => { setView('inbox'); setCurrentPage(1); }}
              >
                Inbox
              </button>
              <button
                className={`${styles.btn} ${view === 'sent' ? styles.activeBtn : styles.inactiveBtn}`}
                onClick={() => { setView('sent'); setCurrentPage(1); }}
              >
                Sent
              </button>
              <button className={styles.composeBtn} onClick={() => setView('compose')}>
                + Compose
              </button>
            </div>
          )}
        </div>

        {/* ── STATUS ── */}
        {error && <p className={styles.errorText}>{error}</p>}
        {loading && <p className={styles.loadingText}>Loading…</p>}

        {/* ── INBOX / SENT TABLE ── */}
        {(view === 'inbox' || view === 'sent') && !loading && renderTable()}

        {/* ── MESSAGE DETAIL ── */}
        {view === 'details' && selectedMessage && (
          <div>
            <button onClick={handleBack} className={styles.backBtn}>← Back</button>
            <div className={styles.detailCard}>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>From</span>
                <span className={styles.detailValue}>{selectedMessage.fromDisplay}</span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>To</span>
                <span className={styles.detailValue}>{selectedMessage.toDisplay}</span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Date</span>
                <span className={styles.detailValue}>{new Date(selectedMessage.timestamp).toLocaleString()}</span>
              </div>
              <hr className={styles.detailDivider} />
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Message</span>
                <div className={styles.messageBody}>{selectedMessage.message}</div>
              </div>
            </div>
          </div>
        )}

        {/* ── COMPOSE ── */}
        {view === 'compose' && (
          <div className={styles.composeWrapper}>
            <button onClick={handleBack} className={styles.backBtn}>← Back to Inbox</button>
            <form onSubmit={handleSendMessage}>

              {/* 1. Category */}
              <div className={styles.formGroup}>
                <label className={styles.fieldLabel}>Recipient Category</label>
                <select
                  className={styles.selectField}
                  value={composeData.category}
                  onChange={(e) => setComposeData({ ...composeData, category: e.target.value, to: '' })}
                >
                  <option value="specific_salesman">Specific Salesman (My Branch)</option>
                  <option value="all_companies">All Companies</option>
                  <option value="specific_company">Specific Company</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              {/* 2. Specific salesman */}
              {composeData.category === 'specific_salesman' && (
                <div className={styles.formGroup}>
                  <label className={styles.fieldLabel}>Select Salesman</label>
                  <select
                    className={styles.selectField}
                    value={composeData.to}
                    required
                    onChange={(e) => setComposeData({ ...composeData, to: e.target.value })}
                  >
                    <option value="">— Select Salesman —</option>
                    {branchSalesmen.length > 0 ? (
                      branchSalesmen.map(emp => (
                        <option key={emp.e_id} value={emp.e_id}>
                          {emp.e_id} — {emp.f_name} {emp.last_name}
                        </option>
                      ))
                    ) : (
                      <option disabled>No salesmen found in your branch</option>
                    )}
                  </select>
                </div>
              )}

              {/* 3. Specific company */}
              {composeData.category === 'specific_company' && (
                <div className={styles.formGroup}>
                  <label className={styles.fieldLabel}>Select Company</label>
                  <select
                    className={styles.selectField}
                    value={composeData.to}
                    required
                    onChange={(e) => setComposeData({ ...composeData, to: e.target.value })}
                  >
                    <option value="">— Select Company —</option>
                    {availableCompanies.map(comp => (
                      <option key={comp.c_id} value={comp.c_id}>
                        {comp.c_id} — {comp.cname}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* 4. Message body */}
              <div className={styles.formGroup}>
                <label className={styles.fieldLabel}>Message</label>
                <textarea
                  className={styles.textareaField}
                  placeholder="Type your message here…"
                  required
                  value={composeData.message}
                  onChange={(e) => setComposeData({ ...composeData, message: e.target.value })}
                />
              </div>

              <button type="submit" className={styles.sendButton} disabled={sending}>
                {sending ? 'Sending…' : 'Send Message'}
              </button>
            </form>
          </div>
        )}

      </div>
    </div>
  );
};

export default ManagerMessages;