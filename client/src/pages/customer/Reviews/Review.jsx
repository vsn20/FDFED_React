// client/src/pages/customer/Reviews/Reviews.jsx
import React, { useState, useEffect } from 'react';
import api from '../../../api/api'; // Adjust based on your folder structure
import styles from './Reviews.module.css';

const Reviews = () => {
    const [sales, setSales] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedSale, setSelectedSale] = useState(null); // For modal
    const [rating, setRating] = useState(0);
    const [reviewText, setReviewText] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchReviews();
    }, []);

    const fetchReviews = async () => {
        try {
            const res = await api.get('/customer/reviews');
            setSales(res.data);
            setLoading(false);
        } catch (err) {
            console.error("Error fetching reviews:", err);
            setLoading(false);
        }
    };

    const openModal = (sale) => {
        setSelectedSale(sale);
        // Pre-fill if editing
        setRating(sale.rating || 0);
        setReviewText(sale.review || '');
    };

    const closeModal = () => {
        setSelectedSale(null);
        setRating(0);
        setReviewText('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (rating === 0) {
            alert("Please select a star rating");
            return;
        }
        if (!reviewText.trim()) {
            alert("Please write a review");
            return;
        }

        setSubmitting(true);
        try {
            await api.post('/customer/reviews', {
                sale_id: selectedSale.sale_id,
                rating,
                review: reviewText
            });
            
            closeModal();
            fetchReviews(); // Refresh list to show updated review
            alert("Review submitted successfully!");
        } catch (err) {
            console.error("Error submitting review:", err);
            alert("Failed to submit review");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div style={{padding:'20px', textAlign:'center'}}>Loading reviews...</div>;

    return (
        <div className={styles.container}>
            <div className={styles.contentArea}>
                <div className={styles.header}>
                    <h2>My Product Reviews</h2>
                    <p style={{color:'#64748b'}}>Rate and review your purchased products.</p>
                </div>

                {sales.length === 0 ? (
                    <p style={{textAlign:'center', padding:'40px', color:'#64748b'}}>
                        No purchases found to review.
                    </p>
                ) : (
                    <div className={styles.grid}>
                        {sales.map((sale) => (
                            <div key={sale._id} className={styles.card}>
                                <div className={styles.cardHeader}>
                                    <div>
                                        <div className={styles.productName}>{sale.product_name}</div>
                                        <div className={styles.saleId}>ID: {sale.sale_id}</div>
                                        <div className={styles.saleId} style={{fontSize:'0.8rem', marginTop:'2px'}}>
                                            {sale.company_name}
                                        </div>
                                    </div>
                                    <span className={`${styles.statusBadge} ${sale.rating ? styles.reviewed : styles.pending}`}>
                                        {sale.rating ? 'Reviewed' : 'Pending'}
                                    </span>
                                </div>
                                
                                <div style={{fontSize:'0.85rem', color:'#94a3b8', marginBottom:'10px'}}>
                                    Purchased: {new Date(sale.sales_date).toLocaleDateString()}
                                </div>

                                {sale.rating ? (
                                    <>
                                        <div className={styles.ratingDisplay}>
                                            {'★'.repeat(sale.rating)}{'☆'.repeat(5 - sale.rating)}
                                        </div>
                                        <div className={styles.reviewText}>
                                            "{sale.review}"
                                        </div>
                                        <button 
                                            className={`${styles.btn} ${styles.btnSecondary}`}
                                            onClick={() => openModal(sale)}
                                            style={{marginTop:'15px', background:'#f1f5f9'}}
                                        >
                                            Edit Review
                                        </button>
                                    </>
                                ) : (
                                    <button 
                                        className={`${styles.btn} ${styles.btnPrimary}`}
                                        onClick={() => openModal(sale)}
                                    >
                                        Write a Review
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* REVIEW MODAL */}
            {selectedSale && (
                <div className={styles.modalOverlay} onClick={(e) => { if(e.target === e.currentTarget) closeModal() }}>
                    <div className={styles.modalContent}>
                        <h3>Review {selectedSale.product_name}</h3>
                        <form onSubmit={handleSubmit}>
                            {/* Star Rating Input */}
                            <div className={styles.starRating}>
                                {[5, 4, 3, 2, 1].map((star) => (
                                    <React.Fragment key={star}>
                                        <input 
                                            type="radio" 
                                            id={`star${star}`} 
                                            name="rating" 
                                            value={star} 
                                            checked={rating === star}
                                            onChange={() => setRating(star)}
                                        />
                                        <label htmlFor={`star${star}`}>★</label>
                                    </React.Fragment>
                                ))}
                            </div>

                            <textarea 
                                className={styles.textarea}
                                placeholder="Share your experience with this product..."
                                value={reviewText}
                                onChange={(e) => setReviewText(e.target.value)}
                            />

                            <div className={styles.modalActions}>
                                <button type="button" className={`${styles.btn} ${styles.btnSecondary}`} onClick={closeModal} style={{width:'auto'}}>
                                    Cancel
                                </button>
                                <button type="submit" className={`${styles.btn} ${styles.btnPrimary}`} style={{width:'auto'}} disabled={submitting}>
                                    {submitting ? 'Submitting...' : 'Submit Review'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Reviews;