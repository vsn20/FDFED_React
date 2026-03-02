import React, { useState, useEffect, useRef } from 'react';
import api from '../api/api';
import styles from './NewProducts.module.css';

function useReveal(threshold = 0.12) {
    const ref = useRef(null);
    const [visible, setVisible] = useState(false);
    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const obs = new IntersectionObserver(
            ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } },
            { threshold }
        );
        obs.observe(el);
        return () => obs.disconnect();
    }, [threshold]);
    return [ref, visible];
}

const getImageUrl = (path) => {
    if (!path) return '/placeholder.jpg';
    if (path.startsWith('http')) return path;
    let clean = path.replace(/\\/g, '/').replace(/^public\//, '');
    if (clean.startsWith('/')) clean = clean.substring(1);
    return `http://localhost:5001/${clean}`;
};

const SkeletonCard = ({ delay = 0 }) => (
    <div className={styles.skeletonCard} style={{ animationDelay: `${delay}s` }}>
        <div className={styles.skeletonImg} />
        <div className={styles.skeletonBody}>
            <div className={styles.skeletonLine} style={{ width: '55%' }} />
            <div className={styles.skeletonLine} style={{ width: '80%' }} />
            <div className={styles.skeletonLine} style={{ width: '65%' }} />
        </div>
    </div>
);

const ProductCard = ({ product, index }) => {
    const [slide, setSlide]     = useState(0);
    const [hovered, setHovered] = useState(false);
    const [ref, visible]        = useReveal(0.1);
    const photos = product.prod_photos || [];

    useEffect(() => {
        if (photos.length > 1) {
            const t = setInterval(() =>
                setSlide(p => (p + 1) % photos.length), hovered ? 1800 : 3500);
            return () => clearInterval(t);
        }
    }, [photos.length, hovered]);

    return (
        <div
            ref={ref}
            className={`${styles.card} ${visible ? styles.cardVisible : ''}`}
            style={{ animationDelay: `${(index % 4) * 0.08}s` }}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
        >
            {/* NEW badge */}
            <div className={styles.newBadge}>NEW</div>

            {/* Photo slideshow */}
            <div className={styles.photoWrap}>
                {photos.length === 0 ? (
                    <img src="/placeholder.jpg" alt="Product"
                        className={`${styles.photo} ${styles.photoActive}`} />
                ) : photos.map((ph, i) => (
                    <img
                        key={i}
                        src={getImageUrl(ph)}
                        alt={`${product.Prod_name || 'Product'} ${i + 1}`}
                        className={`${styles.photo} ${i === slide ? styles.photoActive : ''}`}
                        onError={e => { e.target.onerror = null; e.target.src = '/placeholder.jpg'; }}
                    />
                ))}
                <div className={styles.photoGradient} />
                <div className={styles.photoTitle}>{product.Prod_name || 'Product'}</div>
                {photos.length > 1 && (
                    <div className={styles.dots}>
                        {photos.map((_, i) => (
                            <span
                                key={i}
                                className={`${styles.dot} ${i === slide ? styles.dotActive : ''}`}
                                onClick={e => { e.stopPropagation(); setSlide(i); }}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Card body — mirrors OurBranches structure */}
            <div className={styles.cardBody}>
                <div className={styles.cardHeader}>
                    <div className={styles.cardIconWrap}>📦</div>
                    <div className={styles.cardTitleGroup}>
                        <div className={styles.cardTitle}>
                            {product.Prod_name || `Product ${product.prod_id}`}
                        </div>
                        <div className={styles.cardBadge}>Just Arrived</div>
                    </div>
                </div>

                <div className={styles.detailsInner}>
                    <div className={styles.detailRow}>
                        <div className={styles.detailIcon}>🆔</div>
                        <span><span className={styles.detailLabel}>ID:</span> {product.prod_id}</span>
                    </div>
                    <div className={styles.detailRow}>
                        <div className={styles.detailIcon}>📏</div>
                        <span><span className={styles.detailLabel}>Model:</span> {product.Model_no}</span>
                    </div>
                    <div className={styles.detailRow}>
                        <div className={styles.detailIcon}>🏢</div>
                        <span><span className={styles.detailLabel}>Company:</span> {product.com_name}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

const NewProducts = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading]   = useState(true);
    const [error, setError]       = useState(null);
    const [heroRef, heroVisible]  = useReveal(0.05);

    useEffect(() => {
        api.get('/newproducts')
            .then(res => {
                if (res.data.success) setProducts(res.data.data);
                else setError('Failed to load products');
            })
            .catch(() => setError('Failed to load products. Please try again later.'))
            .finally(() => setLoading(false));
    }, []);

    return (
        <div className={styles.root}>
            {/* Page header */}
            <div ref={heroRef} className={`${styles.hero} ${heroVisible ? styles.heroVisible : ''}`}>
                <div className={styles.heroContent}>
                    <div className={styles.heroTag}>Fresh Arrivals</div>
                    <h1 className={styles.heroTitle}>New <em>Products</em></h1>
                    <p className={styles.heroSub}>
                        Explore our latest additions — arrived within the last 15 days
                    </p>
                </div>
            </div>

            {/* Grid section */}
            <div className={styles.content}>
                {loading && (
                    <div className={styles.grid}>
                        {Array.from({ length: 8 }).map((_, i) => (
                            <SkeletonCard key={i} delay={i * 0.05} />
                        ))}
                    </div>
                )}

                {error && (
                    <div className={styles.errorState}>
                        <span className={styles.errorIcon}>⚠️</span>
                        <p>{error}</p>
                    </div>
                )}

                {!loading && !error && products.length === 0 && (
                    <div className={styles.emptyState}>
                        <span className={styles.emptyIcon}>📋</span>
                        <p>No new products found in the last 15 days.</p>
                    </div>
                )}

                {!loading && products.length > 0 && (
                    <>
                        <div className={styles.countBar}>
                            <span className={styles.countNum}>{products.length}</span>
                            <span className={styles.countLabel}>new arrivals</span>
                        </div>
                        <div className={styles.grid}>
                            {products.map((product, i) => (
                                <ProductCard key={product.prod_id} product={product} index={i} />
                            ))}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default NewProducts;