import React, { useContext, useState } from 'react';
import { Link } from 'react-router-dom';
import AuthContext from '../../context/AuthContext';
import './Sidebar.css'; // Import CSS

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
            <li className={activeLink === "#" ? "active" : ""}>
                <Link to="#" onClick={() => handleLinkClick("#")}>
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
            <li className={activeLink === "#" ? "active" : ""}>
                <Link to="#" onClick={() => handleLinkClick("#")}>
                    <span>💰</span> Sales
                </Link>
            </li>
            <li className={activeLink === "/salesman/profile" ? "active" : ""}>
                <Link to="/salesman/profile" onClick={() => handleLinkClick("/salesman/profile")}>
                    <span>👤</span> Profile
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
            </ul>
        </div>
    );
};

export default Sidebar;