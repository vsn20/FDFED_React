import React, { useState, useEffect, useRef } from 'react';
import api from '../api/api';
import styles from './OurProducts.module.css';

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
            style={{ animationDelay: `${(index % 4) * 0.07}s` }}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
        >
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

            {/* Card body */}
            <div className={styles.cardBody}>
                <div className={styles.cardHeader}>
                    <div className={styles.cardIconWrap}>🏠</div>
                    <div className={styles.cardTitleGroup}>
                        <div className={styles.cardTitle}>
                            {product.Prod_name || `Product ${product.prod_id}`}
                        </div>
                        <div className={styles.cardBadge}>Available</div>
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

const OurProducts = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading]   = useState(true);
    const [error, setError]       = useState(null);
    const [search, setSearch]     = useState('');
    const [heroRef, heroVisible]  = useReveal(0.05);

    useEffect(() => {
        api.get('/ourproducts')
            .then(res => {
                if (res.data.success) setProducts(res.data.data);
                else setError('Failed to load products');
            })
            .catch(() => setError('Failed to load products. Please try again later.'))
            .finally(() => setLoading(false));
    }, []);

    const filtered = products.filter(p =>
        !search ||
        (p.Prod_name || '').toLowerCase().includes(search.toLowerCase()) ||
        (p.com_name  || '').toLowerCase().includes(search.toLowerCase()) ||
        (p.Model_no  || '').toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className={styles.root}>
            {/* Page header */}
            <div ref={heroRef} className={`${styles.hero} ${heroVisible ? styles.heroVisible : ''}`}>
                <div className={styles.heroContent}>
                    <div className={styles.heroTag}>Full Catalogue</div>
                    <h1 className={styles.heroTitle}>Our <em>Products</em></h1>
                    <p className={styles.heroSub}>
                        Every appliance we carry — quality-certified and ready for your home
                    </p>
                </div>
            </div>

            {/* Search bar */}
            {!loading && products.length > 0 && (
                <div className={styles.searchWrap}>
                    <div className={styles.searchInner}>
                        <svg className={styles.searchIcon} viewBox="0 0 24 24" fill="none"
                            stroke="currentColor" strokeWidth="2">
                            <circle cx="11" cy="11" r="8" />
                            <path d="M21 21l-4.35-4.35" strokeLinecap="round" />
                        </svg>
                        <input
                            type="text"
                            className={styles.searchInput}
                            placeholder="Search by name, model, or company…"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                        {search && (
                            <button className={styles.searchClear}
                                onClick={() => setSearch('')} aria-label="Clear">✕</button>
                        )}
                    </div>
                </div>
            )}

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

                {!loading && !error && filtered.length === 0 && (
                    <div className={styles.emptyState}>
                        <span className={styles.emptyIcon}>🔍</span>
                        <p>{search ? `No products match "${search}"` : 'No products available at the moment.'}</p>
                    </div>
                )}

                {!loading && filtered.length > 0 && (
                    <>
                        <div className={styles.countBar}>
                            <span className={styles.countNum}>{filtered.length}</span>
                            <span className={styles.countLabel}>
                                {search ? 'results found' : 'products available'}
                            </span>
                        </div>
                        <div className={styles.grid}>
                            {filtered.map((product, i) => (
                                <ProductCard key={product.prod_id} product={product} index={i} />
                            ))}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default OurProducts;