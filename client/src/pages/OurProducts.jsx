import React, { useState, useEffect } from 'react';
import api from '../api/api'; 
import styles from './OurProducts.module.css';

const OurProducts = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await api.get('/ourproducts'); 
                if (response.data.success) {
                    setProducts(response.data.data);
                } else {
                    setError('Failed to load products');
                }
            } catch (err) {
                console.error('Error fetching our products:', err);
                setError('Failed to load products. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, []);

    if (loading) return <div className={styles.loading}>Loading products...</div>;

    return (
        <div className={styles.container}>
            <div className={styles.contentArea}>
                <h1>Our Products</h1>
                
                {error && <div className={styles.errorMessage}>{error}</div>}
                
                {products.length === 0 && !error ? (
                    <div className={styles.noProducts}>No accepted products available at the moment.</div>
                ) : (
                    <div className={styles.productsContainer}>
                        {products.map(product => (
                            <ProductCard key={product.prod_id} product={product} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

// Sub-component for individual product card with slideshow
const ProductCard = ({ product }) => {
    const [currentSlide, setCurrentSlide] = useState(0);

    useEffect(() => {
        if (product.prod_photos && product.prod_photos.length > 1) {
            const interval = setInterval(() => {
                setCurrentSlide(prev => (prev + 1) % product.prod_photos.length);
            }, 3000); // Changed to 3s for better viewing
            return () => clearInterval(interval);
        }
    }, [product.prod_photos]);

    const getImageUrl = (path) => {
        if (!path) return '/placeholder.jpg';
        
        // If it's already a full URL (e.g., Cloudinary), return it
        if (path.startsWith('http')) return path;

        // Clean the path: replace backslashes and remove 'public/' if mistakenly stored in DB
        let cleanPath = path.replace(/\\/g, '/').replace(/^public\//, '');
        
        // Ensure it doesn't start with a slash to avoid double slashes issues with some servers
        if (cleanPath.startsWith('/')) cleanPath = cleanPath.substring(1);

        // Construct full URL pointing to your backend
        // Make sure your backend server.js has app.use('/uploads', express.static('uploads'))
        return `http://localhost:5001/${cleanPath}`;
    };

    const renderSlides = () => {
        if (!product.prod_photos || product.prod_photos.length === 0) {
            return (
                <img 
                    src='/placeholder.jpg' 
                    alt="No Photo Available" 
                    className={`${styles.slide} ${styles.active}`}
                />
            );
        }
        
        return product.prod_photos.map((photo, index) => (
            <img 
                key={index} 
                src={getImageUrl(photo)} 
                alt={`${product.Prod_name} ${index + 1}`}
                // Using styles.active assuming CSS is fixed to .active { opacity: 1 }
                className={`${styles.slide} ${index === currentSlide ? styles.active : ''}`}
                onError={(e) => { 
                    e.target.onerror = null; // Prevent infinite loop
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
                    <span>Model Number:</span> {product.Model_no}
                </p>
                <p>
                    <span role="img" aria-label="company">🏢</span> 
                    <span>Company Name:</span> {product.com_name}
                </p>
            </div>
        </div>
    );
};

export default OurProducts;