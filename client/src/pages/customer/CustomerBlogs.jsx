import React, { useEffect, useState } from 'react';
import api from '../../api/api'; // Ensure this path matches your project structure
import './CustomerBlogs.css'; // We will create this CSS file below

const CustomerBlogs = () => {
    // --- State Management ---
    const [allMessages, setAllMessages] = useState([]);
    const [filteredMessages, setFilteredMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // View State (List or Details)
    const [selectedMessage, setSelectedMessage] = useState(null);

    // Filter States
    const [searchQuery, setSearchQuery] = useState('');

    // Pagination States
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(5);

    // --- Fetch Data ---
    useEffect(() => {
        fetchMessages();
    }, []);

    const fetchMessages = async () => {
        try {
            const response = await api.get('/customer/blogs');
            if (response.data.success) {
                setAllMessages(response.data.messages);
                setFilteredMessages(response.data.messages);
            }
        } catch (error) {
            console.error("Error fetching blogs:", error);
        } finally {
            setLoading(false);
        }
    };

    // --- Filtering Logic ---
    useEffect(() => {
        if (!searchQuery.trim()) {
            setFilteredMessages(allMessages);
        } else {
            const query = searchQuery.toLowerCase();
            const result = allMessages.filter(msg => 
                msg.from.toLowerCase().includes(query) ||
                msg.message.toLowerCase().includes(query) ||
                msg.timestamp.includes(query)
            );
            setFilteredMessages(result);
        }
        setCurrentPage(1); // Reset to page 1 on search
    }, [searchQuery, allMessages]);

    // --- Pagination Logic ---
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentMessages = filteredMessages.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredMessages.length / itemsPerPage);

    const handlePageChange = (pageNumber) => {
        if (pageNumber >= 1 && pageNumber <= totalPages) setCurrentPage(pageNumber);
    };

    // --- RENDER DETAIL VIEW ---
    if (selectedMessage) {
        return (
            <div className="blogs-container">
                <button className="reset-btn" onClick={() => setSelectedMessage(null)} style={{marginBottom: '20px'}}>
                    ← Back to Messages
                </button>
                <div className="blogs-header">
                    <h1 className="blogs-title">Message Details</h1>
                </div>
                <div className="detail-card">
                    <div className="detail-grid">
                        <div className="detail-item full-width">
                            <label>From:</label>
                            <span>{selectedMessage.from}</span>
                        </div>
                        <div className="detail-item full-width">
                            <label>To:</label>
                            <span>{selectedMessage.to}</span>
                        </div>
                        <div className="detail-item full-width">
                            <label>Date Received:</label>
                            <span>{new Date(selectedMessage.timestamp).toLocaleString()}</span>
                        </div>
                        <hr className="divider"/>
                        <div className="detail-item full-width">
                            <label>Message Content:</label>
                            <div className="message-content-box">
                                {selectedMessage.message}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // --- RENDER LIST VIEW ---
    return (
        <div className="blogs-container">
            <div className="blogs-header">
                <h1 className="blogs-title">Updates & Blogs</h1>
            </div>

            {/* Search Bar */}
            <div className="filters-wrapper">
                <div className="search-group" style={{width: '100%'}}>
                    <input
                        type="text"
                        className="blogs-search-input"
                        placeholder="Search by sender or content..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            {/* Table */}
            <div className="blogs-table-wrapper">
                <table className="blogs-table">
                    <thead>
                        <tr>
                            <th>From</th>
                            <th>Preview</th>
                            <th>Date</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                             <tr><td colSpan="4" style={{textAlign: 'center', padding: '20px'}}>Loading updates...</td></tr>
                        ) : currentMessages.length > 0 ? (
                            currentMessages.map((msg) => (
                                <tr key={msg._id} onClick={() => setSelectedMessage(msg)} className="clickable-row">
                                    <td style={{fontWeight: 'bold'}}>{msg.from}</td>
                                    <td>{msg.preview}</td>
                                    <td>{new Date(msg.timestamp).toLocaleDateString()}</td>
                                    <td>
                                        <button className="view-btn">View</button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr><td colSpan="4" style={{textAlign: 'center', padding: '20px'}}>No updates found.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {filteredMessages.length > 0 && (
                <div className="pagination-container">
                    <div className="pagination-controls">
                        <button className="pagination-btn" onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>Previous</button>
                        <span className="page-indicator">Page {currentPage} of {totalPages}</span>
                        <button className="pagination-btn" onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages}>Next</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CustomerBlogs;