import React, { useState, useEffect } from 'react';
import styles from './Products.module.css';

const ProductImageSlideshow = ({ photos }) => {
    const [currentIndex, setCurrentIndex] = useState(0);

    // Use default placeholder if photos array is empty or undefined
    const validPhotos = photos && photos.length > 0
        ? photos
        : ['/placeholder.jpg'];

    useEffect(() => {
        // Only run the interval if there's more than one photo
        if (validPhotos.length <= 1) return;

        // Set up the interval to change the slide every 3 seconds
        const intervalId = setInterval(() => {
            setCurrentIndex(prevIndex => (prevIndex + 1) % validPhotos.length);
        }, 3000); // 3 seconds, as requested

        // Clean up the interval when the component unmounts
        return () => clearInterval(intervalId);
    }, [validPhotos.length]); // Re-run effect if the number of photos changes

    return (
        <div className={styles.slideshowContainer}>
            {validPhotos.map((photo, index) => (
                <img
                    key={index}
                    src={photo}
                    alt="Product Photo"
                    // Apply 'activeSlide' class only to the current image
                    className={`${styles.slide} ${index === currentIndex ? styles.activeSlide : ''}`}
                    onError={(e) => { e.target.src = '/placeholder.jpg'; }} // Fallback for broken images
                />
            ))}
        </div>
    );
};

export default ProductImageSlideshow;