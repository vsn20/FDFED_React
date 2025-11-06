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
    </>
  );
};

export default PublicLayout;