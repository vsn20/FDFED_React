import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

const PrivateLayout = () => {
    return (
        <div style={{ display: 'flex' }}>
            <Sidebar />
            <div style={{ flex: 1 }}>
                <Topbar />
                <main style={{ padding: '20px' }}>
                    {/* The Outlet component renders the matched child route component */}
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default PrivateLayout;
