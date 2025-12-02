import React, { useState, useEffect } from 'react';
import api from '../api/api'; 
import styles from './TopProducts.module.css';

const TopProducts = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                // Fetch from the new Top Products API
                const response = await api.get('/topproducts'); 
                
                if (response.data.success) {
                    setProducts(response.data.data);
                } else {
                    setError('Failed to load products');
                }
            } catch (err) {
                console.error('Error fetching top products:', err);
                setError('Failed to load products. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, []);

    if (loading) return <div className={styles.loading}>Loading top products...</div>;

    return (
        <div className={styles.container}>
            <div className={styles.contentArea}>
                <h1>Top Products</h1>
                
                {error && <div className={styles.errorMessage}>{error}</div>}
                
                {products.length === 0 && !error ? (
                    <div className={styles.noProducts}>
                        No top products available (Sales ≥ 4 & Rating ≥ 4).
                    </div>
                ) : (
                    <div className={styles.productsContainer}>
                        {products.map(product => (
                            <TopProductCard key={product.prod_id} product={product} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

// Sub-component for individual product card
const TopProductCard = ({ product }) => {
    const [currentSlide, setCurrentSlide] = useState(0);

    // Auto-advance slideshow logic
    useEffect(() => {
        if (product.prod_photos && product.prod_photos.length > 1) {
            const interval = setInterval(() => {
                setCurrentSlide(prev => (prev + 1) % product.prod_photos.length);
            }, 2000); // 2 seconds per slide (as per original logic)
            return () => clearInterval(interval);
        }
    }, [product.prod_photos]);

    // Robust Image URL Helper
    const getImageUrl = (path) => {
        if (!path) return '/placeholder.jpg';
        if (path.startsWith('http')) return path;

        // Clean path and ensure it points to backend port 5001
        let cleanPath = path.replace(/\\/g, '/').replace(/^public\//, '');
        if (cleanPath.startsWith('/')) cleanPath = cleanPath.substring(1);
        
        return `http://localhost:5001/${cleanPath}`;
    };

    const renderSlides = () => {
        if (!product.prod_photos || product.prod_photos.length === 0) {
            return (
                <img 
                    src='/placeholder.jpg' 
                    alt="No Photo"
                    className={`${styles.slide} ${styles.active}`}
                />
            );
        }
        
        return product.prod_photos.map((photo, index) => (
            <img 
                key={index} 
                src={getImageUrl(photo)} 
                alt={`${product.Prod_name} ${index + 1}`}
                className={`${styles.slide} ${index === currentSlide ? styles.active : ''}`}
                onError={(e) => { 
                    e.target.onerror = null; 
                    e.target.src = '/placeholder.jpg'; 
                }}
            />
        ));
    };

    return (
        <div className={styles.productItem}>
            <div className={styles.slideshowContainer}>
                {renderSlides()}
            </div>
            
            <div className={styles.productDetails}>
                <p>
                    <span role="img" aria-label="id">🆔</span> 
                    <span>Product ID:</span> {product.prod_id}
                </p>
                <p>
                    <span role="img" aria-label="ruler">📏</span> 
                    <span>Model:</span> {product.Model_no}
                </p>
                <p>
                    <span role="img" aria-label="company">🏢</span> 
                    <span>Company:</span> {product.com_name}
                </p>
                <p>
                    <span role="img" aria-label="box">📦</span> 
                    <span>Stock:</span> {product.stock}
                </p>
                {/* Specific Top Product Metrics */}
                <p>
                    <span role="img" aria-label="star">⭐</span> 
                    <span>Avg Rating:</span> 
                    <span className={styles.rating}> {product.averageRating} ★</span>
                </p>
                <p>
                    <span role="img" aria-label="money">💰</span> 
                    <span>Total Sales:</span> {product.salesCount}
                </p>
            </div>
        </div>
    );
};

export default TopProducts;