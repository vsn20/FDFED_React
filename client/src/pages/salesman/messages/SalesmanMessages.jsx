import React, { useState, useEffect, useContext } from 'react';
import api from '../../../api/api'; // Adjust path based on folder structure
import io from 'socket.io-client';
import AuthContext from '../../../context/AuthContext'; // Assuming you have this
import styles from './SalesmanMessages.module.css'; // You can reuse Inventory.module.css or create this

const SOCKET_URL = 'http://localhost:5001'; // Your backend URL

const SalesmanMessages = () => {
    // Context for user info (optional, used if available)
    const { user } = useContext(AuthContext);

    // State
    const [view, setView] = useState('inbox'); // 'inbox', 'sent', 'compose', 'details'
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [selectedMessage, setSelectedMessage] = useState(null);

    // Compose State
    const [manager, setManager] = useState(null); // The branch manager
    const [composeMsg, setComposeMsg] = useState('');
    const [sending, setSending] = useState(false);

    // Metadata for Socket filtering
    const [myEmpId, setMyEmpId] = useState('');
    const [myBranchId, setMyBranchId] = useState('');

    // --- 1. Socket Connection ---
    useEffect(() => {
        const socket = io(SOCKET_URL);

        socket.on('newMessage', (newMsg) => {
            // Logic to determine if this message belongs in our current view
            
            // INBOX: If to ME or to ALL SALESMEN in MY BRANCH
            if (view === 'inbox' && myEmpId) {
                const isForMe = newMsg.to === myEmpId;
                const isBroadcast = newMsg.to === 'all_salesman' && newMsg.branch_id === myBranchId;
                
                if (isForMe || isBroadcast) {
                    setMessages(prev => [newMsg, ...prev]);
                }
            }

            // SENT: If sent BY me
            if (view === 'sent' && myEmpId) {
                if (newMsg.from === myEmpId) {
                    setMessages(prev => [newMsg, ...prev]);
                }
            }
        });

        return () => socket.disconnect();
    }, [view, myEmpId, myBranchId]);

    // --- 2. Data Fetching ---
    useEffect(() => {
        if (view === 'inbox') fetchInbox();
        if (view === 'sent') fetchSent();
        if (view === 'compose') fetchManagerDetails();
    }, [view]);

    const fetchInbox = async () => {
        setLoading(true);
        try {
            const res = await api.get('/salesman/messages/inbox');
            if (res.data.success) {
                setMessages(res.data.messages);
                // Store IDs for socket filtering
                setMyEmpId(res.data.meta.emp_id);
                setMyBranchId(res.data.meta.branch_id);
            }
        } catch (err) {
            console.error(err);
            setError("Failed to load inbox.");
        } finally { setLoading(false); }
    };

    const fetchSent = async () => {
        setLoading(true);
        try {
            const res = await api.get('/salesman/messages/sent');
            if (res.data.success) setMessages(res.data.messages);
        } catch (err) { setError("Failed to load sent messages."); } 
        finally { setLoading(false); }
    };

    const fetchManagerDetails = async () => {
        try {
            const res = await api.get('/salesman/messages/manager');
            if (res.data.success) {
                setManager(res.data.manager);
            }
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

    // --- Styles (Inline for quick setup, move to CSS module preferably) ---
    const s = {
        container: { padding: '20px', background: '#fff', borderRadius: '10px', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' },
        header: { display: 'flex', justifyContent: 'space-between', marginBottom: '20px' },
        navBtn: { padding: '8px 15px', marginRight: '10px', cursor: 'pointer', border: 'none', borderRadius: '5px', background: '#333', color: '#fff' },
        activeBtn: { background: '#555' },
        table: { width: '100%', borderCollapse: 'collapse' },
        th: { background: '#333', color: '#fff', padding: '10px', textAlign: 'left' },
        td: { padding: '10px', borderBottom: '1px solid #eee', cursor: 'pointer' },
        form: { maxWidth: '500px' },
        input: { width: '100%', padding: '10px', marginBottom: '15px', borderRadius: '5px', border: '1px solid #ddd', background: '#f9f9f9' },
        detailBox: { background: '#f8f9fa', padding: '20px', borderRadius: '10px', border: '1px solid #eee' }
    };

    // --- 4. Rendering ---
    
    // View: Details
    if (view === 'details' && selectedMessage) {
        return (
            <div style={s.container}>
                <button onClick={() => setView('inbox')} style={s.navBtn}>← Back</button>
                <h2>Message Details</h2>
                <div style={s.detailBox}>
                    <p><strong>From:</strong> {selectedMessage.fromDisplay}</p>
                    <p><strong>To:</strong> {selectedMessage.toDisplay}</p>
                    <p><strong>Date:</strong> {new Date(selectedMessage.timestamp).toLocaleString()}</p>
                    <hr />
                    <p style={{whiteSpace: 'pre-wrap'}}>{selectedMessage.message}</p>
                </div>
            </div>
        );
    }

    return (
        <div style={s.container}>
            {/* Header Navigation */}
            <div style={s.header}>
                <h1>Salesman Messages</h1>
                <div>
                    <button onClick={() => setView('inbox')} style={{...s.navBtn, ...(view==='inbox'?s.activeBtn:{})}}>Inbox</button>
                    <button onClick={() => setView('sent')} style={{...s.navBtn, ...(view==='sent'?s.activeBtn:{})}}>Sent</button>
                    <button onClick={() => setView('compose')} style={{...s.navBtn, background: '#0984e3'}}>Compose</button>
                </div>
            </div>

            {error && <p style={{color: 'red'}}>{error}</p>}
            {loading && <p>Loading...</p>}

            {/* View: Compose */}
            {view === 'compose' && (
                <div style={s.form}>
                    <h3>Compose Message</h3>
                    {manager ? (
                        <form onSubmit={handleSendMessage}>
                            <label>To (Branch Manager):</label>
                            <input type="text" value={`${manager.e_id} - ${manager.name}`} readOnly style={s.input}/>
                            
                            <label>Message:</label>
                            <textarea 
                                required 
                                value={composeMsg} 
                                onChange={e => setComposeMsg(e.target.value)} 
                                style={{...s.input, minHeight: '150px'}}
                                placeholder="Write your message here..."
                            ></textarea>
                            
                            <button type="submit" style={{...s.navBtn, width: '100%'}} disabled={sending}>
                                {sending ? 'Sending...' : 'Send Message'}
                            </button>
                        </form>
                    ) : (
                        <p>Loading Manager details or No Manager assigned.</p>
                    )}
                </div>
            )}

            {/* View: Inbox & Sent Table */}
            {(view === 'inbox' || view === 'sent') && (
                <div style={{overflowX: 'auto'}}>
                    <table style={s.table}>
                        <thead>
                            <tr>
                                <th style={s.th}>{view === 'inbox' ? 'From' : 'To'}</th>
                                <th style={s.th}>Message</th>
                                <th style={s.th}>Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {messages.length > 0 ? messages.map(msg => (
                                <tr key={msg._id} onClick={() => { setSelectedMessage(msg); setView('details'); }} style={{cursor: 'pointer'}}>
                                    <td style={s.td}>{view === 'inbox' ? msg.fromDisplay : msg.toDisplay}</td>
                                    <td style={s.td}>
                                        {msg.message.length > 50 ? msg.message.substring(0, 50) + '...' : msg.message}
                                    </td>
                                    <td style={s.td}>{new Date(msg.timestamp).toLocaleDateString()}</td>
                                </tr>
                            )) : (
                                <tr><td colSpan="3" style={{...s.td, textAlign: 'center'}}>No messages found.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default SalesmanMessages;