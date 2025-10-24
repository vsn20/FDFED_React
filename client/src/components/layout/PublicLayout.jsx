import React from 'react';
import { Link, Outlet } from 'react-router-dom';

const PublicLayout = () => {
    return (
        <div>
            <nav style={{ padding: '10px', borderBottom: '1px solid black' }}>
                <Link to="/" style={{ marginRight: '10px' }}>Home</Link>
                <Link to="/about-us" style={{ marginRight: '10px' }}>About Us</Link>
                <Link to='/login'>Login</Link>
            </nav>
            <main style={{ padding: '20px' }}>
                <Outlet />
            </main>
        </div>
    );
};

export default PublicLayout;