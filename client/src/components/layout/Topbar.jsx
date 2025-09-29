import React, { useContext } from 'react';
import AuthContext from '../../context/AuthContext';

const Topbar = () => {
    const { user, logout } = useContext(AuthContext);

    return (
        <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            padding: '10px', 
            borderBottom: '1px solid black',
            alignItems: 'center'
        }}>
            <div>
                Welcome, {user ? user.name : 'Guest'} ({user ? user.role : ''})
            </div>
            <button onClick={logout}>Logout</button>
        </div>
    );
};

export default Topbar;
