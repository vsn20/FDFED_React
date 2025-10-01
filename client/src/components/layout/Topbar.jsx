import React, { useContext } from 'react';
import AuthContext from '../../context/AuthContext';
import './Topbar.css';

const Topbar = () => {
    const { user, logout } = useContext(AuthContext);

    return (
        <div className="topbar">
            <div className="topbar-left">
                Welcome, {user ? user.name : 'Guest'} ({user ? user.role : ''})
            </div>
            <div className="topbar-right">
                <button className="logout-btn" onClick={logout}>Logout</button>
            </div>
        </div>
    );
};

export default Topbar;
