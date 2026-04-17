import React, { useState, useEffect, useRef } from 'react';
import api from '../api/api';
import styles from './TopProducts.module.css';

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
    const socketUrl = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5001';
    return `${socketUrl}/${clean}`;
};

const SkeletonCard = ({ delay = 0 }) => (
    <div className={styles.skeletonCard} style={{ animationDelay: `${delay}s` }}>
        <div className={styles.skeletonImg} />
        <div className={styles.skeletonBody}>
            <div className={styles.skeletonLine} style={{ width: '55%' }} />
            <div className={styles.skeletonLine} style={{ width: '80%' }} />
            <div className={styles.skeletonLine} style={{ width: '65%' }} />
            <div className={styles.skeletonLine} style={{ width: '50%' }} />
        </div>
    </div>
);

const StarRating = ({ rating }) => {
    const filled = Math.round(Number(rating) || 0);
    return (
        <div className={styles.stars}>
            {Array.from({ length: 5 }).map((_, i) => (
                <span key={i} className={`${styles.star} ${i < filled ? styles.starLit : ''}`}>★</span>
            ))}
            <span className={styles.ratingNum}>{Number(rating || 0).toFixed(1)}</span>
        </div>
    );
};

const getRankClass = (rank) => {
    if (rank === 1) return styles.rankGold;
    if (rank === 2) return styles.rankSilver;
    if (rank === 3) return styles.rankBronze;
    return styles.rankDefault;
};

const getRankLabel = (rank) => {
    if (rank === 1) return '🥇 #1';
    if (rank === 2) return '🥈 #2';
    if (rank === 3) return '🥉 #3';
    return `#${rank}`;
};

const TopProductCard = ({ product, index }) => {
    const [slide, setSlide]     = useState(0);
    const [hovered, setHovered] = useState(false);
    const [ref, visible]        = useReveal(0.1);
    const photos  = product.prod_photos || [];
    const rank    = index + 1;
    const isTop3  = rank <= 3;

    useEffect(() => {
        if (photos.length > 1) {
            const t = setInterval(() =>
                setSlide(p => (p + 1) % photos.length), hovered ? 1800 : 3000);
            return () => clearInterval(t);
        }
    }, [photos.length, hovered]);

    return (
        <div
            ref={ref}
            className={`${styles.card} ${visible ? styles.cardVisible : ''} ${isTop3 ? styles.cardFeatured : ''}`}
            style={{ animationDelay: `${(index % 4) * 0.07}s` }}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
        >
            {/* Rank badge */}
            <div className={`${styles.rankBadge} ${getRankClass(rank)}`}>
                {getRankLabel(rank)}
            </div>

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
                {isTop3 && (
                    <div className={styles.topChampionBadge}>
                        {rank === 1 ? 'Best Seller' : rank === 2 ? 'Runner Up' : 'Top Rated'}
                    </div>
                )}
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
                    <div className={styles.cardIconWrap}>⭐</div>
                    <div className={styles.cardTitleGroup}>
                        <div className={styles.cardTitle}>
                            {product.Prod_name || `Product ${product.prod_id}`}
                        </div>
                        <div className={styles.cardBadge}>Top Seller</div>
                    </div>
                </div>

                {/* Metrics — stars + sales */}
                <div className={styles.metricsStrip}>
                    <StarRating rating={product.averageRating} />
                    <div className={styles.salesChip}>
                        <span className={styles.salesIcon}>↑</span>
                        <span className={styles.salesNum}>{product.salesCount}</span>
                        <span className={styles.salesLbl}>sales</span>
                    </div>
                </div>

                {/* Info rows */}
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
                    <div className={styles.detailRow}>
                        <div className={styles.detailIcon}>📦</div>
                        <span>
                            <span className={styles.detailLabel}>Stock:</span>
                            <span className={Number(product.stock) < 5 ? styles.stockLow : ''}>
                                {' '}{product.stock} units
                            </span>
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

const TopProducts = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading]   = useState(true);
    const [error, setError]       = useState(null);
    const [heroRef, heroVisible]  = useReveal(0.05);

    useEffect(() => {
        api.get('/topproducts')
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
                    <div className={styles.heroTag}>Best Sellers</div>
                    <h1 className={styles.heroTitle}>Top <em>Products</em></h1>
                    <p className={styles.heroSub}>
                        Our highest-rated and best-selling appliances, ranked by sales and customer reviews
                    </p>
                    <div className={styles.heroCriteria}>
                        <div className={styles.heroCriterion}>
                            <span className={styles.heroCriterionVal}>≥ 4</span>
                            <span className={styles.heroCriterionLbl}>Total Sales</span>
                        </div>
                        <div className={styles.heroCriterionDiv} />
                        <div className={styles.heroCriterion}>
                            <span className={styles.heroCriterionVal}>≥ 4.0 ★</span>
                            <span className={styles.heroCriterionLbl}>Avg Rating</span>
                        </div>
                    </div>
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
                        <span className={styles.emptyIcon}>★</span>
                        <p>No top products yet.<br />Products need ≥ 4 sales and a ≥ 4.0 rating to qualify.</p>
                    </div>
                )}

                {!loading && products.length > 0 && (
                    <>
                        <div className={styles.countBar}>
                            <span className={styles.countNum}>{products.length}</span>
                            <span className={styles.countLabel}>top-ranked products</span>
                        </div>
                        <div className={styles.grid}>
                            {products.map((product, i) => (
                                <TopProductCard key={product.prod_id} product={product} index={i} />
                            ))}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default TopProducts;