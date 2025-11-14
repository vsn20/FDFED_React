import React, { useState } from 'react';
import styles from './Products.module.css';
import AcceptedProductsList from './AcceptedProductsList';
import NewProductsList from './NewProductsList';
import RejectedProductsList from './RejectedProductsList';
import ProductDetails from './ProductDetails';
import EditProductStatus from './EditProductStatus';

const Products = () => {
    // State to manage the current view
    // 'list-accepted', 'list-new', 'list-rejected', 'details', 'edit'
    const [view, setView] = useState('list-accepted');
    
    // State to store the ID of the product being viewed/edited
    const [selectedProductId, setSelectedProductId] = useState(null);

    // Handlers to switch views
    const showDetails = (prod_id) => {
        setSelectedProductId(prod_id);
        setView('details');
    };

    const showEdit = (prod_id) => {
        setSelectedProductId(prod_id);
        setView('edit');
    };

    const handleBack = () => {
        setSelectedProductId(null);
        // Go back to the previously viewed list (or default to 'list-accepted')
        // For simplicity, we can default back to 'list-accepted'
        // or store the previous view in state if needed.
        setView('list-accepted');
    };

    const renderView = () => {
        switch (view) {
            case 'list-accepted':
                return <AcceptedProductsList onProductClick={showDetails} />;
            case 'list-new':
                return <NewProductsList onProductClick={showDetails} />;
            case 'list-rejected':
                return <RejectedProductsList onProductClick={showDetails} />;
            case 'details':
                return <ProductDetails prod_id={selectedProductId} onEditClick={showEdit} />;
            case 'edit':
                return <EditProductStatus prod_id={selectedProductId} onBack={handleBack} />;
            default:
                return <AcceptedProductsList onProductClick={showDetails} />;
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.contentArea}>
                <h1>Product Management</h1>
                
                {/* Show navigation or back button based on view */}
                {view.startsWith('list') ? (
                    <div className={styles.headerContainer}>
                        <div className={styles.headerButtons}>
                            <button 
                                className={`${styles.navButton} ${view === 'list-accepted' ? styles.active : ''}`} 
                                onClick={() => setView('list-accepted')}
                            >
                                Accepted
                            </button>
                            <button 
                                className={`${styles.navButton} ${view === 'list-new' ? styles.active : ''}`} 
                                onClick={() => setView('list-new')}
                            >
                                New Products
                            </button>
                            <button 
                                className={`${styles.navButton} ${view === 'list-rejected' ? styles.active : ''}`} 
                                onClick={() => setView('list-rejected')}
                            >
                                Rejected
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className={styles.headerContainer}>
                         <button className={styles.backButton} onClick={handleBack}>Back to List</button>
                    </div>
                )}

                {/* Render the active component */}
                <div className={styles.viewContainer}>
                    {renderView()}
                </div>
            </div>
        </div>
    );
}

export default Products;