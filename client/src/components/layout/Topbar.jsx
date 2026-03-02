import React, { useContext } from 'react';
import AuthContext from '../../context/AuthContext';
import './Topbar.css';

const LogoutIcon = () => (
  <svg viewBox="0 0 24 24">
    <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);

const initials = (name = '') =>
  name.split(' ').slice(0, 2).map(w => w[0]?.toUpperCase() ?? '').join('');

const Topbar = () => {
  const { user, logout } = useContext(AuthContext);
  const role = user?.role ?? '';
  const roleLabel = role.charAt(0).toUpperCase() + role.slice(1);

  return (
    <header className="topbar">

      {/* Brand */}
      <a className="topbar-brand" href="#">
        <div className="topbar-brand-icon">⚡</div>
        <div className="topbar-brand-wordmark">
          <span className="topbar-brand-name">Electro<em>land</em></span>
          <span className="topbar-brand-sub">Management Suite</span>
        </div>
      </a>

      <div className="topbar-sep" />

      {/* Context breadcrumb */}
      <div className="topbar-context">
        <span className="topbar-context-text">{roleLabel} Dashboard</span>
      </div>

      {/* Right cluster */}
      <div className="topbar-right">

        {/* System online pill */}
        <div className="topbar-status">
          <span className="topbar-status-dot" />
          <span className="topbar-status-text">Online</span>
        </div>

        {/* User chip */}
        {user && (
          <div className="topbar-user">
            <div className="topbar-avatar">{initials(user.name) || '?'}</div>
            <div>
              <div className="topbar-user-name">{user.name}</div>
              <div className="topbar-user-role">{role}</div>
            </div>
          </div>
        )}

        {/* Sign out */}
        <button className="logout-btn" onClick={logout}>
          <LogoutIcon />
          <span className="logout-btn-label">Sign out</span>
        </button>

      </div>
    </header>
  );
};

export default Topbar;