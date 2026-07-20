import { NavLink, Outlet, useNavigate } from 'react-router-dom';

import { useAuth } from '../../features/auth/auth.store.js';

const navItems = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/applications', label: 'Applications' },
  { to: '/settings', label: 'Settings' },
];

export function AppLayout() {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login', { replace: true });
  }

  return (
    <div className="app-shell">
      <aside className="app-sidebar">
        <div className="app-sidebar-content">
          <div>
            <p className="app-eyebrow">ApplyFlow</p>
            <h1>Application Tracker</h1>
          </div>
          <nav className="app-nav" aria-label="Main navigation">
            {navItems.map((item) => (
              <NavLink
                className={({ isActive }) =>
                  isActive ? 'app-nav-link active' : 'app-nav-link'
                }
                key={item.to}
                to={item.to}
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>
        <div className="app-sidebar-footer">
          <div className="app-user">
            <span className="app-user-name">{user?.displayName || 'ApplyFlow user'}</span>
            {user?.email ? <span className="app-user-email">{user.email}</span> : null}
          </div>
          <button className="button-secondary" type="button" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </aside>

      <main className="app-main">
        <Outlet />
      </main>
    </div>
  );
}
