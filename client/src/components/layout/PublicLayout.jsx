// PublicLayout.jsx — Electroland "Obsidian Edition"
import React, { useState, useEffect, useRef } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import './PublicLayout.css';
import logo from '/logo.jpg';

const NAV_LINKS = [
  { to: '/',             label: 'Home',     exact: true },
  { to: '/about-us',     label: 'About'               },
  { to: '/our-branches', label: 'Branches'             },
  { to: '/contact-us',   label: 'Contact'              },
];

const LOGIN_OPTIONS = [
  {
    to: '/customerlogin',
    label: 'Customer',
    desc: 'Browse products & track orders',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="8" r="4" />
        <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
      </svg>
    ),
  },
  {
    to: '/login',
    label: 'Employee',
    desc: 'Manage inventory & operations',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="7" width="20" height="14" rx="2" />
        <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
        <line x1="12" y1="12" x2="12" y2="16" />
        <line x1="10" y1="14" x2="14" y2="14" />
      </svg>
    ),
  },
  {
    to: '/companylogin',
    label: 'Company',
    desc: 'Partner portal & analytics',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 21h18" />
        <path d="M5 21V7l7-4 7 4v14" />
        <rect x="9" y="13" width="6" height="8" />
      </svg>
    ),
  },
];

/* ── Glassy Login Dropdown ──────────────────────────────── */
const LoginDropdown = () => {
  const [open, setOpen] = useState(false);
  const [hovered, setHovered] = useState(null);
  const dropRef = useRef(null);
  const location = useLocation();

  const isAuthPage = LOGIN_OPTIONS.some(o => location.pathname.startsWith(o.to));

  useEffect(() => { setOpen(false); }, [location.pathname]);

  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (dropRef.current && !dropRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  return (
    <div className={`login-dropdown-wrap ${open ? 'open' : ''}`} ref={dropRef}>
      {/* Trigger */}
      <button
        className={`login-trigger ${isAuthPage ? 'active' : ''} ${open ? 'triggered' : ''}`}
        onClick={() => setOpen(o => !o)}
        aria-haspopup="true"
        aria-expanded={open}
      >
        <span className="login-trigger__icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <rect x="5" y="11" width="14" height="10" rx="2" />
            <path d="M8 11V7a4 4 0 0 1 8 0v4" />
            <circle cx="12" cy="16" r="1.2" fill="currentColor" />
          </svg>
        </span>
        <span className="login-trigger__label">Sign In</span>
        <span className={`login-trigger__chevron ${open ? 'rotated' : ''}`}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
            <path d="M6 9l6 6 6-6" />
          </svg>
        </span>
      </button>

      {/* Dropdown panel */}
      <div className={`login-dropdown ${open ? 'login-dropdown--open' : ''}`} role="menu">
        {/* Header */}
        <div className="login-dropdown__header">
          <div className="login-dropdown__header-line" />
          <span className="login-dropdown__header-label">Choose your portal</span>
          <div className="login-dropdown__header-line" />
        </div>

        {/* Options */}
        <div className="login-dropdown__options">
          {LOGIN_OPTIONS.map(({ to, label, desc, icon }, i) => (
            <Link
              key={to}
              to={to}
              className={`login-option ${hovered === i ? 'login-option--hovered' : ''}`}
              role="menuitem"
              style={{ '--delay': `${i * 0.07}s` }}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
              onClick={() => setOpen(false)}
            >
              <div className="login-option__icon-wrap">
                <span className="login-option__icon">{icon}</span>
              </div>
              <div className="login-option__body">
                <span className="login-option__label">{label}</span>
                <span className="login-option__desc">{desc}</span>
              </div>
              <span className="login-option__arrow">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </span>
            </Link>
          ))}
        </div>

        {/* Bottom amber glow bar */}
        <div className="login-dropdown__footer" />
      </div>
    </div>
  );
};


/* ── Main Layout ────────────────────────────────────────── */
const PublicLayout = () => {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled,   setScrolled]   = useState(false);
  const navRef = useRef(null);

  useEffect(() => { setMobileOpen(false); }, [location.pathname]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (!mobileOpen) return;
    const handler = (e) => {
      if (navRef.current && !navRef.current.contains(e.target)) setMobileOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [mobileOpen]);

  const isActive = (to, exact) => {
    if (exact) return location.pathname === to || location.pathname === '/home';
    return location.pathname.startsWith(to);
  };

  return (
    <>
      {/* NAVBAR */}
      <nav ref={navRef} className={`navbar-fixed ${scrolled ? 'scrolled' : ''}`}>
        <Link to="/" className="logo" aria-label="Electroland Home">
          <img src={logo} alt="Electroland" className="logo-img" />
          <span className="logo-wordmark">Electro<span>land</span></span>
        </Link>

        <div className="nav-links-center">
          {NAV_LINKS.map(({ to, label, exact }) => (
            <Link key={to} to={to} className={`nav-link ${isActive(to, exact) ? 'active' : ''}`}>
              {label}
            </Link>
          ))}
        </div>

        <div className="nav-cta-group">
          <LoginDropdown />
        </div>

        <button
          className="mobile-toggle"
          onClick={() => setMobileOpen(o => !o)}
          aria-label="Toggle navigation"
          aria-expanded={mobileOpen}
        >
          <svg className="hamburger" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round">
            {mobileOpen ? (
              <><path d="M6 6l12 12" /><path d="M18 6L6 18" /></>
            ) : (
              <><path d="M4 6h16" /><path d="M4 12h12" /><path d="M4 18h8" /></>
            )}
          </svg>
        </button>
      </nav>

      {/* MOBILE MENU */}
      <div className={`mobile-menu ${mobileOpen ? 'open' : ''}`} role="navigation">
        {NAV_LINKS.map(({ to, label, exact }) => (
          <Link key={to} to={to} className={isActive(to, exact) ? 'active' : ''} onClick={() => setMobileOpen(false)}>
            {label}
          </Link>
        ))}

        <div className="mobile-menu-divider"><span>Sign In As</span></div>

        {LOGIN_OPTIONS.map(({ to, label, icon }) => (
          <Link key={to} to={to} className={`mobile-login-link ${isActive(to) ? 'active' : ''}`} onClick={() => setMobileOpen(false)}>
            <span className="mobile-login-link__icon">{icon}</span>
            {label}
          </Link>
        ))}
      </div>

      {/* PAGE CONTENT */}
      <main className="main-content"><Outlet /></main>

      {/* FOOTER */}
      <footer className="footer">
        <div className="footer-top">
          <div className="footer-logo-section">
            <img src={logo} alt="ElectroLand" className="footer-logo" />
            <div className="footer-divider" />
            <p className="tagline">Powering Your World,<br />Direct from the Source</p>
          </div>

          <div className="footer-links-section">
            <div className="footer-column">
              <h3 className="column-title">Navigate</h3>
              <ul className="column-list">
                <li><Link to="/">Home</Link></li>
                <li><Link to="/about-us">About Us</Link></li>
                <li><Link to="/our-branches">Our Branches</Link></li>
                <li><Link to="/contact-us">Contact</Link></li>
              </ul>
            </div>

            <div className="footer-column">
              <h3 className="column-title">Portals</h3>
              <ul className="column-list">
                <li><Link to="/customerlogin">Customer Login</Link></li>
                <li><Link to="/login">Employee Login</Link></li>
                <li><Link to="/companylogin">Company Login</Link></li>
              </ul>
            </div>

            <div className="footer-column">
              <h3 className="column-title">Get in Touch</h3>
              <div className="contact-info">
                <p>Guntur, Andhra Pradesh</p>
                <p>+91 234 567 890</p>
                <a href="mailto:seshasaisachand.a23@iits.in">seshasaisachand.a23@iits.in</a>
              </div>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <span>© 2024 <a href="https://electroland.com" target="_blank" rel="noreferrer">ElectroLand</a>. All Rights Reserved.</span>
          <div className="footer-bottom-links">
            <a href="/privacy">Privacy Policy</a>
            <a href="/terms">Terms of Use</a>
          </div>
        </div>
      </footer>
    </>
  );
};

export default PublicLayout;