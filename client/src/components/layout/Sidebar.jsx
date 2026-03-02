import React, { useContext, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import AuthContext from '../../context/AuthContext';
import './Sidebar.css';

/* ─── Link config ─────────────────────────────────────────── */
const NAV = {
  owner: [
    { to: '/owner/analytics',  icon: '📊', label: 'Analytics'  },
    { to: '/owner/sales',      icon: '💰', label: 'Sales'      },
    { to: '/owner/orders',     icon: '📝', label: 'Orders'     },
    { to: '/owner/products',   icon: '📦', label: 'Products'   },
    { to: '/owner/inventory',  icon: '🏬', label: 'Inventory'  },
    { to: '/owner/employees',  icon: '👥', label: 'Employees'  },
    { to: '/owner/salaries',   icon: '💸', label: 'Salaries'   },
    { to: '/owner/profits',    icon: '📈', label: 'Profits'    },
    { to: '/owner/companies',  icon: '🏢', label: 'Companies'  },
    { to: '/owner/branches',   icon: '🌐', label: 'Branches'   },
    { to: '/owner/messages',   icon: '✉️',  label: 'Messages'   },
  ],
  manager: [
    { to: '/manager/analytics', icon: '📈', label: 'Analytics' },
    { to: '/manager/sales',     icon: '💰', label: 'Sales'     },
    { to: '/manager/orders',    icon: '📝', label: 'Orders'    },
    { to: '/manager/inventory', icon: '📦', label: 'Inventory' },
    { to: '/manager/employees', icon: '👥', label: 'Salesmen'  },
    { to: '/manager/salary',    icon: '💸', label: 'Salaries'  },
    { to: '/manager/profile',   icon: '👤', label: 'Profile'   },
    { to: '/manager/messages',  icon: '✉️',  label: 'Messages'  },
  ],
  salesman: [
    { to: '/salesman/analytics', icon: '📊', label: 'Analytics' },
    { to: '/salesman/sales',     icon: '💰', label: 'Sales'     },
    { to: '/salesman/inventory', icon: '📦', label: 'Inventory' },
    { to: '/salesman/profile',   icon: '👤', label: 'Profile'   },
    { to: '/salesman/salaries',  icon: '💸', label: 'Salary'    },
    { to: '/salesman/messages',  icon: '✉️',  label: 'Messages'  },
  ],
  company: [
    { to: '/company/analytics',  icon: '📊', label: 'Analytics'  },
    { to: '/company/sales',      icon: '💰', label: 'Sales'      },
    { to: '/company/products',   icon: '📦', label: 'Products'   },
    { to: '/company/orders',     icon: '📝', label: 'Orders'     },
    { to: '/company/complaints', icon: '📢', label: 'Complaints' },
    { to: '/company/messages',   icon: '✉️',  label: 'Messages'   },
  ],
  customer: [
    { to: '/customer/previouspurchases', icon: '🛒', label: 'Purchases'  },
    { to: '/customer/complaints',        icon: '📢', label: 'Complaints' },
    { to: '/customer/review',            icon: '⭐', label: 'Reviews'    },
    { to: '/customer/blogs',             icon: '📰', label: 'Blogs'      },
  ],
};

/* ─── Component ──────────────────────────────────────────── */
const Sidebar = () => {
  const { user } = useContext(AuthContext);
  const location = useLocation();
  const [active, setActive] = useState(location.pathname);

  if (!user) return null;

  const links  = NAV[user.role] ?? [];
  const role   = user.role;
  const rLabel = role.charAt(0).toUpperCase() + role.slice(1);

  return (
    <aside className="sidebar">

      {/* Header */}
      <div className="sidebar-profile">
        <span className="sidebar-profile-tag">Electroland</span>
        <div className="sidebar-profile-role">
          {rLabel} <em>Portal</em>
        </div>
      </div>

      {/* Nav label */}
      <span className="sidebar-section">Navigation</span>

      {/* Links */}
      <ul className="sidebar-menu">
        {links.map(({ to, icon, label }) => (
          <li key={to} className={active === to ? 'active' : ''}>
            <Link to={to} onClick={() => setActive(to)}>
              <span className="nav-icon">{icon}</span>
              <span className="nav-label">{label}</span>
            </Link>
          </li>
        ))}
      </ul>

      {/* Footer */}
      <div className="sidebar-footer">
        <span className="sidebar-footer-indicator" />
        <span className="sidebar-footer-text">All systems operational</span>
      </div>

    </aside>
  );
};

export default Sidebar;