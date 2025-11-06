// PublicLayout.jsx
import React, { useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import './PublicLayout.css';
import logo from '/logo.jpg'; // Your logo.jpg

const PublicLayout = () => {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  // ---------- ACTIVE HELPERS ----------
  const isHome = ['/', '/home'].includes(location.pathname);
  const isPath = (paths) =>
    Array.isArray(paths)
      ? paths.includes(location.pathname)
      : location.pathname.startsWith(paths);

  return (
    <>
      {/* FIXED NAVBAR */}
      <nav className="navbar-fixed">
        {/* LOGO */}
        <Link to="/" className="logo">
          <img src={logo} alt="Logo" className="logo-img" />
        </Link>

        {/* CENTER NAV LINKS */}
        <div className="nav-links-center">
          <Link
            to="/"
            className={`nav-link ${isHome ? 'active' : ''}`}
          >
            Home
          </Link>
          <Link
            to="/about-us"
            className={`nav-link ${isPath('/about-us') ? 'active' : ''}`}
          >
            About Us
          </Link>
          <Link
            to="/our-branches"
            className={`nav-link ${isPath('/our-branches') ? 'active' : ''}`}
          >
            Our Branches
          </Link>

          {/* BOTH Customer & Employee point to /login */}
          <Link
            to="/login"
            className={`nav-link ${location.pathname === '/login' ? 'active' : ''}`}
          >
            Customer
          </Link>
          <Link
            to="/login"
            className={`nav-link ${location.pathname === '/login' ? 'active' : ''}`}
          >
            Employee
          </Link>

          <Link
            to="/companylogin"
            className={`nav-link ${isPath('/companylogin') ? 'active' : ''}`}
          >
            Company
          </Link>
          <Link
            to="/contact-us"
            className={`nav-link ${isPath('/contact-us') ? 'active' : ''}`}
          >
            Contact Us
          </Link>
        </div>

        {/* MOBILE TOGGLE */}
        <button
          className="mobile-toggle"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          <svg className="hamburger" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </nav>

      {/* MOBILE MENU */}
      <div className={`mobile-menu ${mobileOpen ? 'open' : ''}`}>
        <Link
          to="/"
          onClick={() => setMobileOpen(false)}
          className={isHome ? 'active' : ''}
        >
          Home
        </Link>
        <Link
          to="/about-us"
          onClick={() => setMobileOpen(false)}
          className={isPath('/about-us') ? 'active' : ''}
        >
          About Us
        </Link>
        <Link
          to="/our-branches"
          onClick={() => setMobileOpen(false)}
          className={isPath('/our-branches') ? 'active' : ''}
        >
          Our Branches
        </Link>

        {/* Customer & Employee share /login */}
        <Link
          to="/login"
          onClick={() => setMobileOpen(false)}
          className={location.pathname === '/login' ? 'active' : ''}
        >
          Customer
        </Link>
        <Link
          to="/login"
          onClick={() => setMobileOpen(false)}
          className={location.pathname === '/login' ? 'active' : ''}
        >
          Employee
        </Link>

        <Link
          to="/companylogin"
          onClick={() => setMobileOpen(false)}
          className={isPath('/companylogin') ? 'active' : ''}
        >
          Company
        </Link>
        <Link
          to="/contact-us"
          onClick={() => setMobileOpen(false)}
          className={isPath('/contact-us') ? 'active' : ''}
        >
          Contact Us
        </Link>
      </div>

      {/* PAGE CONTENT */}
      <main className="main-content">
        <Outlet />
      </main>

      {/* FOOTER */}
      <footer className="footer">
        <div className="footer-top">
          <div className="footer-logo-section">
            <img src={logo} alt="ElectroLand" className="footer-logo" />
            <p className="tagline">
              Powering Your World, Direct from the Source
            </p>
          </div>
          <div className="footer-links-section">
            <div className="footer-column">
              <h2 className="column-title">Information</h2>
              <ul className="column-list">
                <li><Link to="/">Home</Link></li>
                <li><Link to="/about-us">About</Link></li>
                <li><Link to="/contact-us">Contact</Link></li>
              </ul>
            </div>
            <div className="footer-column">
              <h2 className="column-title">Our Services</h2>
              <ul className="column-list">
                <li>Workday Extend Implementation</li>
                <li>Workday HCM/Finance Implementation</li>
                <li>Workday Integrations</li>
                <li>Project Managed Services</li>
                <li>Workday Payroll Services</li>
                <li>Application Management Services</li>
                <li>Staff Augmentation Services</li>
                <li>Training & Support</li>
              </ul>
            </div>
            <div className="footer-column">
              <h2 className="column-title">Get in Touch</h2>
              <div className="contact-info">
                <p>Guntur, Andhra Pradesh</p>
                <p>+91 234567890</p>
                <p><a href="mailto:seshasaisachand.a23@iits.in">seshasaisachand.a23@iits.in</a></p>
              </div>
            </div>
          </div>
        </div>
        <p className="footer-bottom">
          Copyright 2024 © <a href="https://electroland.com">ElectroLand</a>. All Rights Reserved.
        </p>
      </footer>
    </>
  );
};

export default PublicLayout;