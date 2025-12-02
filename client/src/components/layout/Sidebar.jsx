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
                    <span>💰</span> Sales
                </Link>
            </li>
                <li className={activeLink === "/owner/orders" ? "active" : ""}>
                <Link to="/owner/orders" onClick={() => handleLinkClick("/owner/orders")}>
                    <span>📝</span> Orders
                </Link>
            </li>    
             <li className={activeLink === "/owner/products" ? "active" : ""}>
                <Link to="/owner/products" onClick={() => handleLinkClick("/owner/products")}>
                    <span>📦</span> Products
                </Link>
            </li>
            <li className={activeLink === "/owner/inventory" ? "active" : ""}>
                <Link to="/owner/inventory" onClick={() => handleLinkClick("/owner/inventory")}>
                    <span>🏬</span> Inventory
                </Link>
            </li>
            <li className={activeLink === "/owner/employees" ? "active" : ""}>
                <Link to="/owner/employees" onClick={() => handleLinkClick("/owner/employees")}>
                    <span>👥</span> Employees
                </Link>
            </li>
             <li className={activeLink === "/owner/salaries" ? "active" : ""}>
                <Link to="/owner/salaries" onClick={() => handleLinkClick("/owner/salaries")}>
                    <span>💸</span> Salaries
                </Link>
            </li>
             <li className={activeLink === "/owner/profits" ? "active" : ""}>
                <Link to="/owner/profits" onClick={() => handleLinkClick("/owner/profits")}>
                    <span>📈</span> Profits
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
            <li className={activeLink === "/owner/messages" ? "active" : ""}>
                <Link to="/owner/messages" onClick={() => handleLinkClick("/owner/messages")}>
                    <span>✉</span> Messages
                </Link>
            </li>
        </>
    );

    const managerLinks = (
        <>
            <li className={activeLink === "/manager/analytics" ? "active" : ""}>
                <Link to="/manager/analytics" onClick={() => handleLinkClick("/manager/analytics")}>
                    <span>📈</span> Analytics
                </Link>
            </li>

            <li className={activeLink === "/manager/sales" ? "active" : ""}>
                <Link to="/manager/sales" onClick={() => handleLinkClick("/manager/sales")}>
                    <span>💰</span> Sales
                </Link>
            </li>
            
            <li className={activeLink === "/manager/orders" ? "active" : ""}>
                <Link to="/manager/orders" onClick={() => handleLinkClick("/manager/orders")}>
                    <span>📝</span> Orders
                </Link>
            </li>
            
            <li className={activeLink === "/manager/inventory" ? "active" : ""}>
            <Link to="/manager/inventory" onClick={() => handleLinkClick("/manager/inventory")}>
                <span>📦</span> Inventory
            </Link>
        </li>
            
          
            
            <li className={activeLink === "/manager/employees" ? "active" : ""}>
                <Link to="/manager/employees" onClick={() => handleLinkClick("/manager/employees")}>
                    <span>👥</span> Salesmen
                </Link>
            </li>
            <li className={activeLink === "/manager/salary" ? "active" : ""}> {/* NEW SALARY LINK */}
                <Link to="/manager/salary" onClick={() => handleLinkClick("/manager/salary")}>
                    <span>💸</span> Salaries
                </Link>
            </li>
            <li className={activeLink === "/manager/profile" ? "active" : ""}>
                <Link to="/manager/profile" onClick={() => handleLinkClick("/manager/profile")}>
                    <span>👤</span> Profile
                </Link>
            </li>   
            <li className={activeLink === "/manager/messages" ? "active" : ""}>
                <Link to="/manager/messages" onClick={() => handleLinkClick("/manager/messages")}>
                    <span>✉</span> messages
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
             <li className={activeLink === "/salesman/sales" ? "active" : ""}>
                <Link to="/salesman/sales" onClick={() => handleLinkClick("/salesman/sales")}>
                    <span>💰</span> Sales
                </Link>
            </li>
            <li className={activeLink === "/salesman/inventory" ? "active" : ""}>
                <Link to="/salesman/inventory" onClick={() => handleLinkClick("/salesman/inventory")}>
                    <span>📦</span> Inventory
                </Link>
            </li>
            <li className={activeLink === "/salesman/profile" ? "active" : ""}>
                <Link to="/salesman/profile" onClick={() => handleLinkClick("/salesman/profile")}>
                    <span>👥</span> Profile
                </Link>
            </li>           
            <li className={activeLink === "/salesman/salaries" ? "active" : ""}>
                <Link to="/salesman/salaries" onClick={() => handleLinkClick("/salesman/salaries")}>
                    <span>💸</span> Salary
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
            <li className={activeLink === "/company/sales" ? "active" : ""}>
                <Link to="/company/sales" onClick={() => handleLinkClick("/company/sales")}>
                    <span>💰</span> Sales
                </Link>
            </li>
            <li className={activeLink === "/company/products" ? "active" : ""}>
                <Link to="/company/products" onClick={() => handleLinkClick("/company/products")}>
                    <span>📦</span> Products
                </Link>
            </li>
            <li className={activeLink === "/company/sales" ? "active" : ""}>
                <Link to="/company/sales" onClick={() => handleLinkClick("/company/sales")}>
                    <span>💰</span> Sales
                </Link>
            </li>
            <li className={activeLink === "/company/orders" ? "active" : ""}>
                <Link to="/company/orders" onClick={() => handleLinkClick("/company/orders")}>
                    <span>📝</span> orders
                </Link>
            </li>
            <li className={activeLink === "/company/complaints" ? "active" : ""}>
                <Link to="/company/complaints" onClick={() => handleLinkClick("/company/complaints")}>
                    <span>📢</span> complaints
                </Link>
            </li>
            <li className={activeLink === "/company/messages" ? "active" : ""}>
                <Link to="/company/messages" onClick={() => handleLinkClick("/company/messages")}>
                    <span>✉</span> messages
                </Link>
            </li>
        </>
    );
    const customerLinks = (
        <>
            <li className={activeLink === "/customer/previouspurchases" ? "active" : ""}>
                <Link to="/customer/previouspurchases" onClick={() => handleLinkClick("/customer/previouspurchases")}>
                    <span>🛒</span> Previous Purchases
                </Link>
            </li>
            <li className={activeLink === "/customer/complaints" ? "active" : ""}>
                <Link to="/customer/complaints" onClick={() => handleLinkClick("/customer/complaints")}>
                    <span>📢</span> Complaints
                </Link>
            </li>
            <li className={activeLink === "/customer/review" ? "active" : ""}>
                <Link to="/customer/review" onClick={() => handleLinkClick("/customer/review")}>
                    <span>⭐</span> Reviews
                </Link>
            </li>
            <li className={activeLink === "/customer/blogs" ? "active" : ""}>
                <Link to="/customer/blogs" onClick={() => handleLinkClick("/customer/blogs")}>
                    <span>✉</span> Blogs
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
                {user.role === 'customer' && customerLinks}
            </ul>
        </div>
    );
};

export default Sidebar;