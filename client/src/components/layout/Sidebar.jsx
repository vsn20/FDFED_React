import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import AuthContext from '../../context/AuthContext';
import './Sidebar.css'; // Import CSS

const Sidebar = () => {
    const { user } = useContext(AuthContext);

    if (!user) return null;

    const ownerLinks = (
        <>
            <li><Link to="/owner/analytics"><span>📊</span> Analytics</Link></li>
            <li><Link to="/owner/employees"><span>👥</span> Employees</Link></li>
            <li><Link to="/owner/companies"><span>🏢</span> Companies</Link></li>
            <li><Link to='/owner/branches'><span>🌐</span> Branches</Link></li>
        </>
    );

    const managerLinks = (
        <>
            <li><Link to="/manager/analytics"><span>📊</span> Analytics</Link></li>
            <li><Link to="#"><span>📦</span> Orders</Link></li>
        </>
    );

    const salesmanLinks = (
        <>
            <li><Link to="/salesman/analytics"><span>📊</span> Analytics</Link></li>
            <li><Link to="#"><span>💰</span> Sales</Link></li>
            <li><Link to='/salesman/profile'><span>Profile</span></Link></li>
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
