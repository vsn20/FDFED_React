import React, { useContext, useState } from 'react';
import { Link } from 'react-router-dom';
import AuthContext from '../../context/AuthContext';
import './Sidebar.css';

const Sidebar = () => {
    const { user } = useContext(AuthContext);
    const [activeLink, setActiveLink] = useState(null);

    if (!user) return null;

    const handleLinkClick = (path) => {
        setActiveLink(path);
    };

    const ownerLinks = (
        <>
            <li className={activeLink === "/owner/analytics" ? "active" : ""}>
                <Link to="/owner/analytics" onClick={() => handleLinkClick("/owner/analytics")}>
                    <span>📊</span> Analytics
                </Link>
            </li>
             <li className={activeLink === "/owner/analytics" ? "active" : ""}>
                <Link to="/owner/products" onClick={() => handleLinkClick("/owner/products")}>
                    <span>📦</span> Products
                </Link>
            </li>
            <li className={activeLink === "/owner/employees" ? "active" : ""}>
                <Link to="/owner/employees" onClick={() => handleLinkClick("/owner/employees")}>
                    <span>👥</span> Employees
                </Link>
            </li>
            <li className={activeLink === "/owner/companies" ? "active" : ""}>
                <Link to="/owner/companies" onClick={() => handleLinkClick("/owner/companies")}>
                    <span>🏢</span> Companies
                </Link>
            </li>
            <li className={activeLink === "/owner/branches" ? "active" : ""}>
                <Link to="/owner/branches" onClick={() => handleLinkClick("/owner/branches")}>
                    <span>🌐</span> Branches
                </Link>
            </li>
        </>
    );

    const managerLinks = (
        <>
            <li className={activeLink === "/manager/analytics" ? "active" : ""}>
                <Link to="/manager/analytics" onClick={() => handleLinkClick("/manager/analytics")}>
                    <span>📊</span> Analytics
                </Link>
            </li>
            
            <li className={activeLink === "/manager/employees" ? "active" : ""}>
                <Link to="/manager/employees" onClick={() => handleLinkClick("/manager/employees")}>
                    <span>👥</span> Salesmen
                </Link>
            </li>
            <li className={activeLink === "/manager/profile" ? "active" : ""}>
                <Link to="/manager/profile" onClick={() => handleLinkClick("/manager/profile")}>
                    <span>👤</span> Profile
                </Link>
            </li>
            <li className={activeLink === "/manager/orders" ? "active" : ""}>
                <Link to="/manager/orders" onClick={() => handleLinkClick("/manager/orders")}>
                    <span>📦</span> Orders
                </Link>
            </li>
        </>
    );

    const salesmanLinks = (
        <>
            <li className={activeLink === "/salesman/analytics" ? "active" : ""}>
                <Link to="/salesman/analytics" onClick={() => handleLinkClick("/salesman/analytics")}>
                    <span>📊</span> Analytics
                </Link>
            </li>
            <li className={activeLink === "/salesman/profile" ? "active" : ""}>
                <Link to="/salesman/profile" onClick={() => handleLinkClick("/salesman/profile")}>
                    <span>👤</span> Profile
                </Link>
            </li>
            <li className={activeLink === "/salesman/sales" ? "active" : ""}>
                <Link to="/salesman/sales" onClick={() => handleLinkClick("/salesman/sales")}>
                    <span>👤</span> Sales
                </Link>
            </li>
        </>
    );

     const companyLinks = (
        <>
            <li className={activeLink === "/company/analytics" ? "active" : ""}>
                <Link to="/company/analytics" onClick={() => handleLinkClick("/company/analytics")}>
                    <span>📊</span> Analytics
                </Link>
            </li>
            <li className={activeLink === "/company/products" ? "active" : ""}>
                <Link to="/company/products" onClick={() => handleLinkClick("/company/products")}>
                    <span>📦</span> Products
                </Link>
            </li>
            <li className={activeLink === "/company/orders" ? "active" : ""}>
                <Link to="/company/orders" onClick={() => handleLinkClick("/company/orders")}>
                    <span>👥</span> orders
                </Link>
            </li>
        </>
    );

    return (
        <div className="sidebar">
            <h3 className="sidebar-title">
                {user.role.charAt(0).toUpperCase() + user.role.slice(1)} Dashboard
            </h3>
            <ul className="sidebar-menu">
                {user.role === 'owner' && ownerLinks}
                {user.role === 'manager' && managerLinks}
                {user.role === 'salesman' && salesmanLinks}
                {user.role === 'company' && companyLinks}
            </ul>
        </div>
    );
};

export default Sidebar;