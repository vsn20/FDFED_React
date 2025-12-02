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
                    <main style={{ padding: '20px', marginLeft: '275px', marginTop: '50px' }}>
                    <Outlet />
                    </main>
            </div>
        </div>
    );
};

export default PrivateLayout;
