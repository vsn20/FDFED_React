import React from 'react';
import styles from './Products.module.css';
import ProductImageSlideshow from './ProductImageSlideshow'; // Import the new component

// Small helper to get status class
const getStatusClass = (status) => {
    if (status === 'Accepted') return styles.statusAccepted;
    if (status === 'Rejected') return styles.statusRejected;
    if (status === 'Hold') return styles.statusHold;
    return '';
};

const ProductGridItem = ({ product, onProductClick }) => {
    return (
        <div className={styles.productCard} onClick={() => onProductClick(product.prod_id)}>
            
            {/* Replace the static image with the new slideshow component */}
            <ProductImageSlideshow photos={product.prod_photos} />
            
            <div className={styles.productDetails}>
                <span className={styles.prodId}>{product.prod_id}</span>
                <span>{product.Prod_name}</span>
                <span>Model: {product.Model_no}</span>
                <span>Stock: {product.stock}</span>
                <span className={`${styles.status} ${getStatusClass(product.Status)}`}>
                    {product.Status}
                </span>
            </div>
        </div>
    );
};

export default ProductGridItem;