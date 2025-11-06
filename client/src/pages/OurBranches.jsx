import React, { useState, useEffect } from 'react';
import api from '../api/api';
import styles from './OurBranches.module.css'; // Import the CSS module

const OurBranches = () => {
    const [branches, setBranches] = useState([]);
    const [loading, setLoading] = useState(true); // Add loading state
    const [error, setError] = useState('');     // Add error state

    useEffect(() => {
        const fetchBranches = async () => {
            try {
                setError('');
                setLoading(true);
                const res = await api.get('/our-branches');
                setBranches(res.data);
            } catch (err) {
                console.error("Error fetching branches:", err);
                setError("Error loading branches. Please refresh.");
            } finally {
                setLoading(false);
            }
        };
        
        fetchBranches();
    }, []); // <-- FIX: Empty array runs only once on mount

    // Show loading message
    if (loading) {
        return <div className={styles.loading}>Loading branches...</div>;
    }

    // Show error message
    if (error) {
        return (
            <div className={styles.contentArea}>
                <div style={{ textAlign: 'center' }}>
                    <h1 className={styles.title}>Our Branches</h1>
                </div>
                <div className={styles.errorMessage}>{error}</div>
            </div>
        );
    }

    // Show main content
    return (
        <div className={styles.contentArea}>
            {/* Wrapper to center the inline-block title */}
            <div style={{ textAlign: 'center' }}>
                <h1 className={styles.title}>Our Branches</h1>
            </div>

            {/* Handle no branches found */}
            {branches.length === 0 ? (
                <div className={styles.errorMessage}>No active branches available</div>
            ) : (
                <div className={styles.branchesGrid}>
                    {branches.map((branch) => (
                        <div key={branch.bid} className={styles.branchCard}>
                            <h3 className={styles.cardTitle}>{branch.b_name}</h3>
                            <div className={styles.branchInfo}>
                                <p className={styles.infoItem}>
                                    {/* Using inline emoji is cleaner in React */}
                                    👤 <span>Manager:</span> {branch.manager_name}
                                </p>
                                <p className={styles.infoItem}>
                                    📧 <span>Email:</span> {branch.manager_email}
                                </p>
                                <p className={styles.infoItem}>
                                    📞 <span>Phone:</span> {branch.manager_ph_no}
                                </p>
                                <p className={styles.infoItem}>
                                    📍 <span>Location:</span> {branch.location}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default OurBranches;