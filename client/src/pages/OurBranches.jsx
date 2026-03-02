import React, { useState, useEffect } from 'react';
import api from '../api/api';
import styles from './OurBranches.module.css';

const OurBranches = () => {
  const [branches, setBranches] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState('');

  useEffect(() => {
    const fetchBranches = async () => {
      try {
        setError('');
        setLoading(true);
        const res = await api.get('/our-branches');
        setBranches(res.data);
      } catch (err) {
        console.error('Error fetching branches:', err);
        setError('Could not load branches. Please refresh the page.');
      } finally {
        setLoading(false);
      }
    };
    fetchBranches();
  }, []);

  /* ── Loading ── */
  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.loadingSpinner} />
        Loading branches…
      </div>
    );
  }

  /* ── Error ── */
  if (error) {
    return (
      <div className={styles.contentArea}>
        <div className={styles.pageHeader}>
          <div className={styles.overline}>Our Branches</div>
          <h1 className={styles.title}>Our <em>Branches</em></h1>
        </div>
        <div className={styles.errorMessage}>
          <span style={{ fontSize: '2rem' }}>⚠</span>
          {error}
        </div>
      </div>
    );
  }

  /* ── Main ── */
  return (
    <div className={styles.contentArea}>

      {/* Page Header */}
      <div className={styles.pageHeader}>
        <div className={styles.overline}>Electroland Network</div>
        <h1 className={styles.title}>Our <em>Branches</em></h1>
        <p className={styles.titleSub}>
          Find an Electroland location near you — each staffed with experts ready to help.
        </p>
      </div>

      {/* No branches */}
      {branches.length === 0 ? (
        <div className={styles.gridSection}>
        <div className={styles.errorMessage}>
          <span style={{ fontSize: '2rem' }}>🏢</span>
          No active branches available at the moment.
        </div>
        </div>
      ) : (
        <div className={styles.gridSection}>
        <div className={styles.branchesGrid}>
          {branches.map((branch, i) => (
            <div
              key={branch.bid}
              className={styles.branchCard}
              style={{ animationDelay: `${i * 0.08}s` }}
            >
              {/* Card Header */}
              <div className={styles.cardHeader}>
                <div className={styles.cardIconWrap}>🏢</div>
                <div className={styles.cardTitleGroup}>
                  <h3 className={styles.cardTitle}>{branch.b_name}</h3>
                  <span className={styles.cardBadge}>Active Branch</span>
                </div>
              </div>

              {/* Branch Info */}
              <div className={styles.branchInfo}>
                <p className={styles.infoItem}>
                  <span className={styles.infoIcon}>👤</span>
                  <span>Manager:</span>{branch.manager_name}
                </p>
                <p className={styles.infoItem}>
                  <span className={styles.infoIcon}>📧</span>
                  <span>Email:</span>{branch.manager_email}
                </p>
                <p className={styles.infoItem}>
                  <span className={styles.infoIcon}>📞</span>
                  <span>Phone:</span>{branch.manager_ph_no}
                </p>
                <p className={styles.infoItem}>
                  <span className={styles.infoIcon}>📍</span>
                  <span>Location:</span>{branch.location}
                </p>
              </div>
            </div>
          ))}
        </div>
        </div>
      )}

    </div>
  );
};

export default OurBranches;