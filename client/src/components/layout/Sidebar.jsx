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
            <li className={activeLink === "/owner/sales" ? "active" : ""}>
                <Link to="/owner/sales" onClick={() => handleLinkClick("/owner/sales")}>
                    <span>📊</span> Sales
                </Link>
            </li>
                <li className={activeLink === "/owner/orders" ? "active" : ""}>
                <Link to="/owner/orders" onClick={() => handleLinkClick("/owner/orders")}>
                    <span>🌐</span> Orders
                </Link>
            </li>    
             <li className={activeLink === "/owner/products" ? "active" : ""}>
                <Link to="/owner/products" onClick={() => handleLinkClick("/owner/products")}>
                    <span>📦</span> Products
                </Link>
            </li>
            <li className={activeLink === "/owner/inventory" ? "active" : ""}>
                <Link to="/owner/inventory" onClick={() => handleLinkClick("/owner/inventory")}>
                    <span>📊</span> Inventory
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
            <li className={activeLink === "/manager/salary" ? "active" : ""}> {/* NEW SALARY LINK */}
                <Link to="/manager/salary" onClick={() => handleLinkClick("/manager/salary")}>
                    <span>💰</span> Salary
                </Link>
            </li>
            <li className={activeLink === "/manager/profile" ? "active" : ""}>
                <Link to="/manager/profile" onClick={() => handleLinkClick("/manager/profile")}>
                    <span>👤</span> Profile
                </Link>
            </li>

             <li className={activeLink === "/manager/sales" ? "active" : ""}>
                <Link to="/manager/sales" onClick={() => handleLinkClick("/manager/sales")}>
                    <span>📊</span> Sales
                </Link>
            </li>
            
            <li className={activeLink === "/manager/orders" ? "active" : ""}>
                <Link to="/manager/orders" onClick={() => handleLinkClick("/manager/orders")}>
                    <span>📦</span> Orders
                </Link>
            </li>
            <li className={activeLink === "/manager/inventory" ? "active" : ""}>
            <Link to="/manager/inventory" onClick={() => handleLinkClick("/manager/inventory")}>
                <span>📦</span> Inventory
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
                    <span>👥</span> Profile
                </Link>
            </li>
            <li className={activeLink === "/salesman/inventory" ? "active" : ""}>
                <Link to="/salesman/inventory" onClick={() => handleLinkClick("/salesman/inventory")}>
                    <span>📦</span> Inventory
                </Link>
            </li>
            <li className={activeLink === "/salesman/sales" ? "active" : ""}>
                <Link to="/salesman/sales" onClick={() => handleLinkClick("/salesman/sales")}>
                    <span>👤</span> Sales
                </Link>
            </li>
            <li className={activeLink === "/salesman/salaries" ? "active" : ""}>
                <Link to="/salesman/salaries" onClick={() => handleLinkClick("/salesman/salaries")}>
                    <span>💰</span> Salaries
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
            <li className={activeLink === "/company/complaints" ? "active" : ""}>
                <Link to="/company/complaints" onClick={() => handleLinkClick("/company/complaints")}>
                    <span>👥</span> complaints
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