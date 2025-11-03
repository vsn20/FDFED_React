// PublicLayout.jsx
import React, { useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import './PublicLayout.css';
import logo from '/logo.jpg'; // Your logo.jpg

const PublicLayout = () => {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const activePage = location.pathname.replace('/', '') || 'home';

  return (
    <>
      {/* FIXED NAVBAR */}
      <nav className="navbar-fixed">
        {/* LEFT: LOGO */}
        <Link to="/" className="logo">
          <img src={logo} alt="Logo" className="logo-img" />
        </Link>

        {/* CENTER: NAV LINKS */}
        <div className="nav-links-center">
          <Link to="/" className={`nav-link ${activePage === 'home' ? 'active' : ''}`}>Home</Link>
          <Link to="/about-us" className={`nav-link ${activePage === 'about-us' ? 'active' : ''}`}>About Us</Link>
          <Link to="/our-branches" className={`nav-link ${activePage === 'our-branches' ? 'active' : ''}`}>Our Branches</Link>
          <Link to="/login" className={`nav-link ${activePage === 'customer' ? 'active' : ''}`}>Customer</Link>
          <Link to="/login" className={`nav-link ${activePage === 'employee' ? 'active' : ''}`}>Employee</Link>
          <Link to="/companylogin" className={`nav-link ${activePage === 'company' ? 'active' : ''}`}>Company</Link>
          <Link to="/contact-us" className={`nav-link ${activePage === 'contact-us' ? 'active' : ''}`}>Contact Us</Link>
        </div>

        {/* MOBILE MENU TOGGLE */}
        <button className="mobile-toggle" onClick={() => setMobileOpen(!mobileOpen)}>
          <svg className="hamburger" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </nav>

      {/* MOBILE MENU */}
      <div className={`mobile-menu ${mobileOpen ? 'open' : ''}`}>
        <Link to="/" onClick={() => setMobileOpen(false)}>Home</Link>
        <Link to="/about-us" onClick={() => setMobileOpen(false)}>About Us</Link>
        <Link to="/our-branches" onClick={() => setMobileOpen(false)}>Our Branches</Link>
        <Link to="/customerlogin" onClick={() => setMobileOpen(false)}>Customer</Link>
        <Link to="/employeelogin" onClick={() => setMobileOpen(false)}>Employee</Link>
        <Link to="/companylogin" onClick={() => setMobileOpen(false)}>Company</Link>
        <Link to="/contact-us" onClick={() => setMobileOpen(false)}>Contact Us</Link>
      </div>

      {/* PAGE CONTENT */}
      <main className="main-content">
        <Outlet />
      </main>
    </>
  );
};

export default PublicLayout;