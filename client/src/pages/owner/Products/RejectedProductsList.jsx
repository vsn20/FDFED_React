import React, { useState, useEffect } from 'react';
import api from '../../../api/api';
import styles from './Products.module.css';
import ProductGridItem from './ProductGridItem';

const RejectedProductsList = ({ onProductClick }) => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                setLoading(true);
                const res = await api.get('/owner/products/rejected');
                setProducts(res.data);
                setError('');
            } catch (err) {
                console.error("Error fetching rejected products:", err);
                setError('Failed to fetch products.');
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, []);

    if (loading) return <p>Loading rejected products...</p>;
    if (error) return <p className={styles.errorMessage}>{error}</p>;

    return (
        <div className={styles.productsGrid}>
            {products.length > 0 ? (
                products.map(product => (
                    <ProductGridItem 
                        key={product.prod_id} 
                        product={product} 
                        onProductClick={onProductClick} 
                    />
                ))
            ) : (
                <p>No rejected products found.</p>
            )}
        </div>
    );
};

export default RejectedProductsList;