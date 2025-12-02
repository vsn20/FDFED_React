import React, { useState, useEffect } from 'react';
import api from '../api/api'; // Use your existing api helper
import styles from './NewProducts.module.css';

const NewProducts = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                // Adjust endpoint if your api helper adds '/api' automatically
                // Assuming api.get('/newproducts') calls 'http://localhost:5001/api/newproducts'
                const response = await api.get('/newproducts'); 
                
                if (response.data.success) {
                    setProducts(response.data.data);
                } else {
                    setError('Failed to load products');
                }
            } catch (err) {
                console.error('Error fetching new products:', err);
                setError('Failed to load products. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, []);

    if (loading) return <div className={styles.loading}>Loading new products...</div>;

    return (
        <div className={styles.container}>
            <div className={styles.contentArea}>
                <h1>New Products</h1>
                
                {error && <div className={styles.errorMessage}>{error}</div>}
                
                {products.length === 0 && !error ? (
                    <div className={styles.noProducts}>No new products found in the last 15 days.</div>
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

// Sub-component for individual product card
const ProductCard = ({ product }) => {
    const [currentSlide, setCurrentSlide] = useState(0);

    // Auto-advance slideshow
    useEffect(() => {
        if (product.prod_photos && product.prod_photos.length > 1) {
            const interval = setInterval(() => {
                setCurrentSlide(prev => (prev + 1) % product.prod_photos.length);
            }, 2000);
            return () => clearInterval(interval);
        }
    }, [product.prod_photos]);

    // Handle missing photos
    const photos = product.prod_photos && product.prod_photos.length > 0 
        ? product.prod_photos 
        : ['https://via.placeholder.com/300x200?text=No+Image']; 

    // Construct full image URL (adjust based on where your uploads are served)
    const getImageUrl = (path) => {
        if (path.startsWith('http')) return path;
        // Assuming your server serves uploads at /uploads
        // You might need to adjust this based on your server configuration
        return `http://localhost:5001/${path.replace(/\\/g, '/')}`; 
    };

    return (
        <div className={styles.productItem}>
            <div className={styles.slideshowContainer}>
                {photos.map((photo, index) => (
                    <img 
                        key={index}
                        src={getImageUrl(photo)} 
                        alt={product.Prod_name}
                        className={`${styles.slide} ${index === currentSlide ? styles.active : ''}`}
                    />
                ))}
            </div>
            <div className={styles.productDetails}>
                <p><span>🆔 Product ID:</span> {product.prod_id}</p>
                <p><span>📏 Model Number:</span> {product.Model_no}</p>
                <p><span>🏢 Company Name:</span> {product.com_name}</p>
            </div>
        </div>
    );
};

export default NewProducts;