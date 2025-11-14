import React, { useState, useEffect } from 'react';
import api from '../../../api/api';
import styles from './Products.module.css';
// We no longer import ProductImageSlideshow here

const ProductDetails = ({ prod_id, onEditClick }) => {
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchProduct = async () => {
            if (!prod_id) return;
            try {
                setLoading(true);
                const res = await api.get(`/owner/products/${prod_id}`);
                setProduct(res.data);
                setError('');
            } catch (err) {
                console.error("Error fetching product details:", err);
                setError('Failed to fetch product details.');
            } finally {
                setLoading(false);
            }
        };
        fetchProduct();
    }, [prod_id]);

    // This function now renders all images side-by-side
    const renderPhotos = () => {
        if (!product.prod_photos || product.prod_photos.length === 0) {
            // Display a single placeholder if no photos exist
            return (
                <img 
                    src='/placeholder.jpg' 
                    alt="No Photo Available" 
                    className={styles.detailsPhoto} 
                />
            );
        }
        
        // Map over all photos and display them
        return product.prod_photos.map((photo, index) => (
            <img 
                key={index} 
                src={photo} 
                alt={`Product Photo ${index + 1}`} 
                className={styles.detailsPhoto} // Use a new class for styling
                onError={(e) => { e.target.src = '/placeholder.jpg'; }}
            />
        ));
    };

    if (loading) return <p>Loading details...</p>;
    if (error) return <p className={styles.errorMessage}>{error}</p>;
    if (!product) return <p>No product found.</p>;

    return (
        <div>
            {/* This container will now hold all images in a flex row, 
              as defined in the updated CSS.
            */}
            <div className={styles.photosContainer}>
                {renderPhotos()}
            </div>

            <div className={styles.formSection}>
                <legend className={styles.sectionTitle}>Product Information</legend>
                <div className={styles.fieldGroup}>
                    {Object.entries(product).map(([key, value]) => {
                        if (key === '_id' || key === 'prod_photos' || key === '__v') return null;
                        
                        return (
                            <div key={key}>
                                <label className={styles.fieldLabel}>{key}</label>
                                <input 
                                    type="text" 
                                    value={String(value) || 'N/A'} 
                                    className={styles.fieldInput} 
                                    disabled 
                                />
                            </div>
                        );
                    })}
                </div>
            </div>
            <button className={styles.formButton} onClick={() => onEditClick(product.prod_id)}>
                Edit Product Status
            </button>
        </div>
    );
};

export default ProductDetails;