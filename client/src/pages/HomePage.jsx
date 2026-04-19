import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import './Homepage.css';
import SplashScreen from './Splashscreen.jsx';

// ── Scroll-reveal hook ──────────────────────────────────────────────────────
function useReveal(threshold = 0.15) {
    const ref = useRef(null);
    const [visible, setVisible] = useState(false);
    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const obs = new IntersectionObserver(
            ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect(); } },
            { threshold }
        );
        obs.observe(el);
        return () => obs.disconnect();
    }, [threshold]);
    return [ref, visible];
}

// ── Animated counter ────────────────────────────────────────────────────────
function Counter({ target, suffix = '', duration = 2000 }) {
    const [count, setCount] = useState(0);
    const [ref, visible] = useReveal(0.3);
    useEffect(() => {
        if (!visible) return;
        let start = 0;
        const step = target / (duration / 16);
        const timer = setInterval(() => {
            start = Math.min(start + step, target);
            setCount(Math.floor(start));
            if (start >= target) clearInterval(timer);
        }, 16);
        return () => clearInterval(timer);
    }, [visible, target, duration]);
    return <span ref={ref}>{count}{suffix}</span>;
}

// ── Slides data ─────────────────────────────────────────────────────────────
const SLIDES = [
    { src: '/IntoHome2.jpg',  headline: 'Built to Elevate Living', sub: 'Premium appliances that transform how you live' },
    { src: '/IntoHome.jpg',   headline: 'Discover Excellence', sub: 'Top-rated products, curated for your home' },
    { src: '/IntoHome3.jpg',  headline: 'Stock Mastery',       sub: 'Your inventory, perfectly managed' },
    { src: '/IntoHome4.jpg',  headline: 'Latest Offers',       sub: 'Unbeatable deals on world-class appliances' },
    { src: '/IntoHome5.jpg',  headline: 'Retail Redefined',    sub: 'The future of home electronics retail' },
];

const FEATURES = [
    { icon: '⬡', title: 'Unmatched Quality', body: 'Every product undergoes rigorous quality control with a comprehensive 2-year warranty. Built to outlast, designed to impress.' },
    { icon: '◈', title: 'Innovative Technology', body: 'Smart controls, energy-saving systems, and the latest advancements — engineered into every appliance we carry.' },
    { icon: '◎', title: '24/7 Expert Support', body: 'Our dedicated team is always on call. From product selection to after-sales service, we never leave you waiting.' },
    { icon: '⟡', title: 'Eco-First Design', body: 'Sustainability is built-in, not bolted on. Our appliances cut your carbon footprint without cutting performance.' },
];

const REVIEWS = [
    { name: 'Sarah Johnson', avatar: 'https://randomuser.me/api/portraits/women/1.jpg', rating: 5, text: 'The kitchen appliances I bought from Electroland transformed my cooking experience. Top quality and amazing customer service!', date: 'March 10, 2025' },
    { name: 'Michael Chen',  avatar: 'https://randomuser.me/api/portraits/men/2.jpg',   rating: 4, text: 'Great selection and outstanding quality. My washing machine works like an absolute dream — exceeded all expectations.', date: 'March 12, 2025' },
    { name: 'Emily Davis',   avatar: 'https://randomuser.me/api/portraits/women/3.jpg', rating: 5, text: 'Absolutely love my new refrigerator! Energy efficient, stylish, and silent. Electroland never disappoints.', date: 'March 14, 2025' },
];

// ── Main Component ──────────────────────────────────────────────────────────
function Home() {
    const [splashDone, setSplashDone]  = useState(false);
    const [slide, setSlide]           = useState(0);
    const [prevSlide, setPrevSlide]   = useState(null);
    const [transitioning, setTrans]   = useState(false);
    const [heroLoaded, setHeroLoaded] = useState(false);
    const [menuOpen, setMenuOpen]     = useState(false);
    const [progress, setProgress]     = useState(0);
    const [cursor, setCursor]         = useState({ x: -200, y: -200 });
    const progressRef = useRef(null);

    // Cursor tracker
    useEffect(() => {
        const move = (e) => setCursor({ x: e.clientX, y: e.clientY });
        window.addEventListener('mousemove', move);
        return () => window.removeEventListener('mousemove', move);
    }, []);

    // Slide transition
    const goTo = useCallback((idx) => {
        if (transitioning) return;
        setTrans(true);
        setPrevSlide(slide);
        setTimeout(() => {
            setSlide(idx);
            setTimeout(() => { setTrans(false); setPrevSlide(null); }, 700);
        }, 50);
    }, [slide, transitioning]);

    // Auto-advance with progress tracking
    useEffect(() => {
        setProgress(0);
        const duration = 6000;
        const step = 50;
        let elapsed = 0;
        const prog = setInterval(() => {
            elapsed += step;
            setProgress(Math.min((elapsed / duration) * 100, 100));
        }, step);
        const t = setInterval(() => {
            goTo((slide + 1) % SLIDES.length);
        }, duration);
        return () => { clearInterval(t); clearInterval(prog); };
    }, [slide, goTo]);

    // Hero entrance
    useEffect(() => { setTimeout(() => setHeroLoaded(true), 100); }, []);

    // Reveal refs
    const [statsRef,    statsVis]    = useReveal(0.2);
    const [aboutRef,    aboutVis]    = useReveal(0.15);
    const [featRef,     featVis]     = useReveal(0.1);
    const [reviewsRef,  reviewsVis]  = useReveal(0.1);

    return (
        <div className="el-root">

            {/* ── Splash Screen ── */}
            {!splashDone && <SplashScreen onDone={() => setSplashDone(true)} />}

            {/* ── Cursor glow ── */}
            <div
                className="el-cursor-glow"
                style={{ transform: `translate(${cursor.x - 200}px, ${cursor.y - 200}px)` }}
                aria-hidden="true"
            />

            {/* ── Grain overlay ── */}
            <div className="el-grain" aria-hidden="true" />

            {/* ── Floating side nav ── */}
            <nav className={`el-sidenav ${menuOpen ? 'el-sidenav--open' : ''}`}>
                <button className="el-sidenav__toggle" onClick={() => setMenuOpen(o => !o)} aria-label="Menu">
                    <span /><span /><span />
                </button>
                <div className="el-sidenav__links">
                    <Link to="/newproducts" className="el-sidenav__link">
                        <span className="el-sidenav__num">01</span>New Products
                    </Link>
                    <Link to="/ourproducts" className="el-sidenav__link">
                        <span className="el-sidenav__num">02</span>Our Products
                    </Link>
                    <Link to="/topproducts" className="el-sidenav__link">
                        <span className="el-sidenav__num">03</span>Top Products
                    </Link>
                </div>
            </nav>

            {/* ══════════════════════════════════════════════════
                HERO — Cinematic slideshow
            ══════════════════════════════════════════════════ */}
            <section className="el-hero">
                {/* Background slides */}
                <div className="el-hero__slides">
                    {SLIDES.map((s, i) => (
                        <div
                            key={i}
                            className={[
                                'el-hero__slide',
                                i === slide      ? 'el-hero__slide--active' : '',
                                i === prevSlide  ? 'el-hero__slide--exit'   : '',
                            ].join(' ')}
                        >
                            <img src={s.src} alt={s.headline} className="el-hero__bg" />
                            <div className="el-hero__vignette" />
                        </div>
                    ))}
                </div>

                {/* Hero content */}
                <div className={`el-hero__content ${heroLoaded ? 'el-hero__content--loaded' : ''}`}>
                    <div className="el-hero__overline">Electroland — Est. 2024</div>
                    <h1 className="el-hero__headline">
                        {SLIDES[slide].headline.split(' ').map((word, i) => (
                            <span key={`${slide}-${i}`} className="el-hero__word" style={{ animationDelay: `${i * 0.08}s` }}>
                                {word}{' '}
                            </span>
                        ))}
                    </h1>
                    <p className="el-hero__sub">{SLIDES[slide].sub}</p>
                    <div className="el-hero__ctas">
                        <Link to="/ourproducts" className="el-btn el-btn--primary">Explore Products</Link>
                        <Link to="/newproducts" className="el-btn el-btn--ghost">New Arrivals →</Link>
                    </div>
                </div>

                {/* Slide dots + counter */}
                <div className="el-hero__nav">
                    <div className="el-hero__dots">
                        {SLIDES.map((_, i) => (
                            <button
                                key={i}
                                className={`el-hero__dot ${i === slide ? 'el-hero__dot--active' : ''}`}
                                onClick={() => goTo(i)}
                                aria-label={`Slide ${i + 1}`}
                            />
                        ))}
                    </div>
                    <div className="el-hero__counter">
                        <span className="el-hero__counter-cur">{String(slide + 1).padStart(2, '0')}</span>
                        <span className="el-hero__counter-sep" />
                        <span className="el-hero__counter-tot">{String(SLIDES.length).padStart(2, '0')}</span>
                    </div>
                </div>

                {/* Scroll cue */}
                <div className="el-hero__scroll-cue" aria-hidden="true">
                    <div className="el-hero__scroll-line" />
                    <span>scroll</span>
                </div>

                {/* Large wordmark decoration */}
                <div className="el-hero__wordmark" aria-hidden="true">ELECTROLAND</div>

                {/* Progress bar */}
                <div className="el-hero__progress">
                    <div className="el-hero__progress-fill" style={{ width: `${progress}%` }} />
                </div>

            </section>

            {/* ── Marquee ticker ── */}
            <div className="el-ticker" aria-hidden="true">
                <div className="el-ticker__track">
                    {Array.from({ length: 3 }).map((_, r) => (
                        <span key={r} className="el-ticker__set">
                            {['Premium Appliances', '★', 'Quality Guaranteed', '★', 'Expert Support', '★', '2-Year Warranty', '★', 'Eco-Certified', '★', 'Electroland', '★'].map((w, i) => (
                                <span key={i} className="el-ticker__word">{w}</span>
                            ))}
                        </span>
                    ))}
                </div>
            </div>

            {/* ══════════════════════════════════════════════════
                STATS STRIP
            ══════════════════════════════════════════════════ */}
            <section ref={statsRef} className={`el-stats ${statsVis ? 'el-stats--visible' : ''}`}>
                <div className="el-stats__inner">
                    {[
                        { n: 500, suf: '+', label: 'Products Sold' },
                        { n: 5,   suf: '+', label: 'Branch Locations' },
                        { n: 98,   suf: '%', label: 'Customer Satisfaction' },
                        { n: 2,    suf: '+', label: 'Years of Excellence' },
                    ].map((s, i) => (
                        <div key={i} className="el-stats__item" style={{ transitionDelay: `${i * 0.1}s` }}>
                            <div className="el-stats__number">
                                <Counter target={s.n} suffix={s.suf} />
                            </div>
                            <div className="el-stats__label">{s.label}</div>
                        </div>
                    ))}
                </div>
            </section>

            {/* ══════════════════════════════════════════════════
                ABOUT STRIP — image + text
            ══════════════════════════════════════════════════ */}
            <section ref={aboutRef} className={`el-about ${aboutVis ? 'el-about--visible' : ''}`}>
                <div className="el-about__img-wrap">
                    <img src="/shopsmart.jpg" alt="Electroland showroom" className="el-about__img" />
                    <div className="el-about__img-badge">Since 2024</div>
                </div>
                <div className="el-about__body">
                    <div className="el-about__tag">Who We Are</div>
                    <h2 className="el-about__title">Discover Our<br /><em>Top Appliances</em></h2>
                    <p className="el-about__text">
                        At Electroland, we bring you the finest in home appliances — designed to make your life easier, more efficient, and more beautiful. From state-of-the-art kitchen systems to innovative home solutions, every product is built with quality and longevity in mind.
                    </p>
                    <p className="el-about__text">
                        Our curated selection blends cutting-edge functionality with modern design, ensuring that every purchase delivers exceptional performance and lasting value.
                    </p>
                    <Link to="/ourproducts" className="el-btn el-btn--amber">View All Products →</Link>
                </div>
            </section>

            {/* ══════════════════════════════════════════════════
                CINEMATIC BANNER
            ══════════════════════════════════════════════════ */}
            <section className="el-banner">
                <img
                    src="https://cdn.pixabay.com/photo/2016/11/18/17/46/house-1836070_1280.jpg"
                    alt="Transform Your Home"
                    className="el-banner__bg"
                />
                <div className="el-banner__overlay" />
                <div className="el-banner__content">
                    <div className="el-banner__tag">Premium Living</div>
                    <h2 className="el-banner__title">Transform<br />Your Home</h2>
                    <p className="el-banner__sub">Upgrade your living space with premium appliances.<br />Unmatched quality. Timeless style.</p>
                    <Link to="/ourproducts" className="el-btn el-btn--primary el-btn--lg">Shop Now</Link>
                </div>
            </section>

            {/* ══════════════════════════════════════════════════
                LIFESTYLE STRIP — floated image + text
            ══════════════════════════════════════════════════ */}
            <section className="el-lifestyle">
                <div className="el-lifestyle__img-wrap">
                    <img src="/IntoHome6.jpg" alt="Elevate Your Lifestyle" className="el-lifestyle__img" />
                    <div className="el-lifestyle__img-tag">Premium Selection</div>
                </div>
                <div className="el-lifestyle__body">
                    <div className="el-lifestyle__tag">Why Electroland</div>
                    <h2 className="el-lifestyle__title">Elevate Your<br /><em>Lifestyle</em></h2>
                    <p className="el-lifestyle__text">
                        Transforming your home starts with choosing the right appliances. At Electroland, we offer a curated selection of products that blend functionality with modern design — from kitchen to laundry to living spaces.
                    </p>
                    <div className="el-lifestyle__bullets">
                        {['2-Year Warranty on all products', 'Energy-certified appliances', 'Expert installation support', 'Dedicated after-sales care'].map((b, i) => (
                            <div key={i} className="el-lifestyle__bullet">
                                <span className="el-lifestyle__bullet-dot" />
                                {b}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════════════
                WHY CHOOSE US — dark feature grid
            ══════════════════════════════════════════════════ */}
            <section ref={featRef} className={`el-features ${featVis ? 'el-features--visible' : ''}`}>
                <div className="el-features__header">
                    <div className="el-features__tag">Our Promise</div>
                    <h2 className="el-features__title">Why Choose<br />Electroland</h2>
                    <div className="el-features__line" />
                </div>
                <div className="el-features__grid">
                    {FEATURES.map((f, i) => (
                        <div
                            key={i}
                            className="el-feature-card"
                            style={{ transitionDelay: `${i * 0.1}s` }}
                        >
                            <div className="el-feature-card__icon">{f.icon}</div>
                            <h3 className="el-feature-card__title">{f.title}</h3>
                            <p className="el-feature-card__body">{f.body}</p>
                            <div className="el-feature-card__line" />
                        </div>
                    ))}
                </div>
            </section>

            {/* ══════════════════════════════════════════════════
                REVIEWS
            ══════════════════════════════════════════════════ */}
            <section ref={reviewsRef} className={`el-reviews ${reviewsVis ? 'el-reviews--visible' : ''}`}>
                <div className="el-reviews__header">
                    <div className="el-reviews__tag">Testimonials</div>
                    <h2 className="el-reviews__title">What Our Customers Say</h2>
                </div>
                <div className="el-reviews__grid">
                    {REVIEWS.map((r, i) => (
                        <div
                            key={i}
                            className="el-review-card"
                            style={{ transitionDelay: `${i * 0.12}s` }}
                        >
                            <div className="el-review-card__quote">"</div>
                            <p className="el-review-card__text">{r.text}</p>
                            <div className="el-review-card__rating">
                                {Array.from({ length: 5 }).map((_, j) => (
                                    <span key={j} className={`el-star ${j < r.rating ? 'el-star--lit' : ''}`}>★</span>
                                ))}
                            </div>
                            <div className="el-review-card__author">
                                <img src={r.avatar} alt={r.name} className="el-review-card__avatar" />
                                <div>
                                    <div className="el-review-card__name">{r.name}</div>
                                    <div className="el-review-card__date">{r.date}</div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* ══════════════════════════════════════════════════
                FOOTER CTA
            ══════════════════════════════════════════════════ */}
            <section className="el-cta">
                <div className="el-cta__bg" aria-hidden="true" />
                <div className="el-cta__content">
                    <div className="el-cta__tag">Get Started</div>
                    <h2 className="el-cta__title">Ready to Upgrade<br />Your Home?</h2>
                    <p className="el-cta__sub">Browse our full catalogue and find the perfect appliance for every room in your house.</p>
                    <div className="el-cta__actions">
                        <Link to="/ourproducts" className="el-btn el-btn--primary el-btn--lg">Browse Products</Link>
                        <Link to="/newproducts" className="el-btn el-btn--ghost el-btn--lg">New Arrivals</Link>
                    </div>
                </div>
            </section>

        </div>
    );
}

export default Home;