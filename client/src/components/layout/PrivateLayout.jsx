import React from 'react';
import { Outlet } from 'react-router-dom';
import Topbar from './Topbar';
import Sidebar from './Sidebar';
import './PrivateLayout.css';

const PrivateLayout = () => (
  <div className="private-layout">
    <Topbar />
    <Sidebar />
    <main className="private-main">
      <Outlet />
    </main>
  </div>
);

export default PrivateLayout;