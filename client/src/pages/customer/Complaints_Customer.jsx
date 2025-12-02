// client/src/pages/customer/Complaints_Customer.jsx
import React, { useState, useEffect } from 'react';
import api from '../../api/api'; // Adjust path
import AddComplaint from './AddComplaint';
import ComplaintDetails from './ComplaintDetails';
import styles from './Complaints.module.css';

const Complaints_Customer = () => {
    const [complaints, setComplaints] = useState([]);
    const [viewState, setViewState] = useState('list'); // 'list', 'add', 'details'
    const [selectedComplaint, setSelectedComplaint] = useState(null);

    useEffect(() => {
        fetchComplaints();
    }, []);

    const fetchComplaints = async () => {
        try {
            const res = await api.get('/customer/complaints');
            setComplaints(res.data);
        } catch (err) {
            console.error("Error fetching complaints:", err);
        }
    };

    const handleAddClick = () => {
        setViewState('add');
        setSelectedComplaint(null);
    };

    const handleBack = () => {
        setViewState('list');
        setSelectedComplaint(null);
        fetchComplaints(); // Refresh data when coming back
    };

    const handleRowClick = (complaint) => {
        setSelectedComplaint(complaint);
        setViewState('details');
    };

    return (
        <div className={styles.container}>
            <div className={styles.contentArea}>
                <h1>My Complaints</h1>

                {/* VIEW: ADD COMPLAINT */}
                {viewState === 'add' && (
                    <>
                        <button className={styles.addButton} onClick={handleBack} style={{marginBottom:'20px'}}>
                            &larr; Back to List
                        </button>
                        <AddComplaint handleBack={handleBack} />
                    </>
                )}

                {/* VIEW: DETAILS */}
                {viewState === 'details' && selectedComplaint && (
                    <>
                        <button className={styles.addButton} onClick={handleBack} style={{marginBottom:'20px'}}>
                            &larr; Back to List
                        </button>
                        <ComplaintDetails data={selectedComplaint} handleBack={handleBack} />
                    </>
                )}

                {/* VIEW: LIST */}
                {viewState === 'list' && (
                    <>
                        <div className={styles.headerContainer}>
                            <button className={styles.addButton} onClick={handleAddClick}>
                                + File New Complaint
                            </button>
                        </div>
                        <div className={styles.tableWrapper}>
                            <table className={styles.table}>
                                <thead className={styles.thead}>
                                    <tr>
                                        <th className={styles.th}>Complaint ID</th>
                                        <th className={styles.th}>Product</th>
                                        <th className={styles.th}>Company</th>
                                        <th className={styles.th}>Date</th>
                                        <th className={styles.th}>Status</th>
                                        <th className={styles.th}>Description</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {complaints.length === 0 ? (
                                        <tr>
                                            <td colSpan="6" className={styles.td} style={{textAlign:'center'}}>
                                                No complaints found.
                                            </td>
                                        </tr>
                                    ) : (
                                        complaints.map((item) => (
                                            <tr key={item._id} className={styles.tr} onClick={() => handleRowClick(item)}>
                                                <td className={styles.td} data-label="Complaint ID">
                                                    <span style={{fontWeight:'bold', color:'#2563eb'}}>{item.complaint_id}</span>
                                                </td>
                                                <td className={styles.td} data-label="Product">{item.product_name}</td>
                                                <td className={styles.td} data-label="Company">{item.company_name}</td>
                                                <td className={styles.td} data-label="Date">
                                                    {new Date(item.complaint_date).toLocaleDateString()}
                                                </td>
                                                <td className={styles.td} data-label="Status">
                                                    <span className={`${styles.statusBadge} ${item.status === 'Open' ? styles.open : styles.closed}`}>
                                                        {item.status}
                                                    </span>
                                                </td>
                                                <td className={styles.td} data-label="Description">
                                                    {item.complaint_info.length > 30 
                                                        ? item.complaint_info.substring(0, 30) + '...' 
                                                        : item.complaint_info}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default Complaints_Customer;