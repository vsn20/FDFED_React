import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import AuthContext from '../../context/AuthContext';

const Sidebar = () => {
    const { user } = useContext(AuthContext);

    if (!user) return null;

    const ownerLinks = (
        <>
            <li><Link to="/owner/analytics">Analytics</Link></li>
            <li><Link to="/owner/employees">Employees</Link></li>
            <li><Link to="/owner/companies">Companies</Link></li>
        </>
    );

    const managerLinks = (
        <>
            <li><Link to="/manager/analytics">Analytics</Link></li>
            <li><Link to="#">Orders</Link></li> {/* Placeholder as requested */}
        </>
    );

    const salesmanLinks = (
        <>
            <li><Link to="/salesman/analytics">Analytics</Link></li>
            <li><Link to="#">Sales</Link></li> {/* Placeholder as requested */}
        </>
    );

    return (
        <div style={{ width: '200px', borderRight: '1px solid black', height: '100vh', padding: '10px' }}>
            <h3>Navigation</h3>
            <ul style={{ listStyle: 'none', padding: 0 }}>
                {user.role === 'owner' && ownerLinks}
                {user.role === 'manager' && managerLinks}
                {user.role === 'salesman' && salesmanLinks}
            </ul>
        </div>
    );
};

export default Sidebar;
