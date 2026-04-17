import React, { useState, useEffect, useContext } from 'react';
import api from '../../../api/api';
import io from 'socket.io-client';
import AuthContext from '../../../context/AuthContext';
import styles from './SalesmanMessages.module.css';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5001';

const SalesmanMessages = () => {
    const { user } = useContext(AuthContext);

    const [view, setView] = useState('inbox');
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [selectedMessage, setSelectedMessage] = useState(null);

    const [manager, setManager] = useState(null);
    const [composeMsg, setComposeMsg] = useState('');
    const [sending, setSending] = useState(false);

    const [myEmpId, setMyEmpId] = useState('');
    const [myBranchId, setMyBranchId] = useState('');

    // --- 1. Socket ---
    useEffect(() => {
        const socket = io(SOCKET_URL);

        socket.on('newMessage', (newMsg) => {
            if (view === 'inbox' && myEmpId) {
                const isForMe = newMsg.to === myEmpId;
                const isBroadcast = newMsg.to === 'all_salesman' && newMsg.branch_id === myBranchId;
                if (isForMe || isBroadcast) setMessages(prev => [newMsg, ...prev]);
            }
            if (view === 'sent' && myEmpId) {
                if (newMsg.from === myEmpId) setMessages(prev => [newMsg, ...prev]);
            }
        });

        return () => socket.disconnect();
    }, [view, myEmpId, myBranchId]);

    // --- 2. Fetching ---
    useEffect(() => {
        if (view === 'inbox') fetchInbox();
        if (view === 'sent') fetchSent();
        if (view === 'compose') fetchManagerDetails();
    }, [view]);

    const fetchInbox = async () => {
        setLoading(true);
        setError('');
        try {
            const res = await api.get('/salesman/messages/inbox');
            if (res.data.success) {
                setMessages(res.data.messages);
                setMyEmpId(res.data.meta.emp_id);
                setMyBranchId(res.data.meta.branch_id);
            }
        } catch (err) {
            setError("Failed to load inbox.");
        } finally { setLoading(false); }
    };

    const fetchSent = async () => {
        setLoading(true);
        setError('');
        try {
            const res = await api.get('/salesman/messages/sent');
            if (res.data.success) setMessages(res.data.messages);
        } catch (err) { setError("Failed to load sent messages."); }
        finally { setLoading(false); }
    };

    const fetchManagerDetails = async () => {
        setError('');
        try {
            const res = await api.get('/salesman/messages/manager');
            if (res.data.success) setManager(res.data.manager);
        } catch (err) { setError("Could not find branch manager."); }
    };

    // --- 3. Actions ---
    const handleSendMessage = async (e) => {
        e.preventDefault();
        setSending(true);
        try {
            const res = await api.post('/salesman/messages/send', {
                to: manager.e_id,
                message: composeMsg
            });
            if (res.data.success) {
                alert('Message Sent!');
                setComposeMsg('');
                setView('sent');
            }
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to send');
        } finally { setSending(false); }
    };

    // --- 4. Detail View ---
    if (view === 'details' && selectedMessage) {
        return (
            <div className={styles.container}>
                <div className={styles.contentArea}>
                    <button className={styles.backBtn} onClick={() => setView('inbox')}>← Back</button>
                    <h2 style={{ fontFamily: "'Playfair Display', serif", marginBottom: 4 }}>Message Details</h2>
                    <div className={styles.detailBox}>
                        <p><strong>From:</strong> {selectedMessage.fromDisplay}</p>
                        <p><strong>To:</strong> {selectedMessage.toDisplay}</p>
                        <p><strong>Date:</strong> {new Date(selectedMessage.timestamp).toLocaleString()}</p>
                        <hr />
                        <p className={styles.detailBody}>{selectedMessage.message}</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <div className={styles.contentArea}>
                {/* Header */}
                <div className={styles.headerContainer}>
                    <h1>Salesman Messages</h1>
                    <div className={styles.navButtons}>
                        <button
                            className={`${styles.navBtn} ${view === 'inbox' ? styles.navBtnActive : ''}`}
                            onClick={() => setView('inbox')}
                        >
                            Inbox
                        </button>
                        <button
                            className={`${styles.navBtn} ${view === 'sent' ? styles.navBtnActive : ''}`}
                            onClick={() => setView('sent')}
                        >
                            Sent
                        </button>
                        <button
                            className={`${styles.navBtn} ${styles.navBtnCompose}`}
                            onClick={() => setView('compose')}
                        >
                            Compose
                        </button>
                    </div>
                </div>

                {error && <div className={styles.errorMessage}>{error}</div>}
                {loading && <div className={styles.loading}>Loading...</div>}

                {/* Compose */}
                {view === 'compose' && (
                    <div className={styles.composeWrapper}>
                        <h3>Compose Message</h3>
                        {manager ? (
                            <form onSubmit={handleSendMessage}>
                                <div className={styles.formGroup}>
                                    <label>To (Branch Manager)</label>
                                    <input
                                        type="text"
                                        value={`${manager.e_id} — ${manager.name}`}
                                        readOnly
                                        className={styles.formInput}
                                    />
                                </div>
                                <div className={styles.formGroup}>
                                    <label>Message</label>
                                    <textarea
                                        required
                                        value={composeMsg}
                                        onChange={e => setComposeMsg(e.target.value)}
                                        className={`${styles.formInput} ${styles.textarea}`}
                                        placeholder="Write your message here..."
                                    />
                                </div>
                                <button type="submit" className={styles.submitBtn} disabled={sending}>
                                    {sending ? 'Sending...' : 'Send Message'}
                                </button>
                            </form>
                        ) : (
                            <p style={{ color: '#888' }}>Loading manager details or no manager assigned.</p>
                        )}
                    </div>
                )}

                {/* Inbox / Sent Table */}
                {(view === 'inbox' || view === 'sent') && !loading && (
                    <div className={styles.tableWrapper}>
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th>{view === 'inbox' ? 'From' : 'To'}</th>
                                    <th>Message</th>
                                    <th>Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {messages.length > 0 ? messages.map(msg => (
                                    <tr
                                        key={msg._id}
                                        onClick={() => { setSelectedMessage(msg); setView('details'); }}
                                    >
                                        <td>{view === 'inbox' ? msg.fromDisplay : msg.toDisplay}</td>
                                        <td>
                                            {msg.message.length > 60
                                                ? msg.message.substring(0, 60) + '…'
                                                : msg.message}
                                        </td>
                                        <td>{new Date(msg.timestamp).toLocaleDateString()}</td>
                                    </tr>
                                )) : (
                                    <tr className={styles.noData}>
                                        <td colSpan="3">No messages found.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SalesmanMessages;