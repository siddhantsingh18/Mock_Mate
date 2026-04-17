import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const NAV = [
  { path: '/dashboard', label: 'Dashboard', icon: '⊞' },
  { path: '/start', label: 'New Interview', icon: '▶' },
  { path: '/history', label: 'History', icon: '⏱' },
  { path: '/analytics', label: 'Analytics', icon: '📈' },
  { path: '/profile', label: 'Profile', icon: '◉' },
];

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/');
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)' }}>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 40, display: 'none' }}
          className="mobile-overlay"
        />
      )}

      {/* Sidebar */}
      <aside style={{
        width: 240,
        background: 'var(--bg-card)',
        borderRight: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
        position: 'fixed',
        top: 0, left: 0, bottom: 0,
        zIndex: 50,
        transition: 'transform 0.3s ease',
      }}
      className={`sidebar ${sidebarOpen ? 'sidebar-open' : ''}`}
      >
        {/* Logo */}
        <div style={{ padding: '24px 20px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg, #2563eb, #0891b2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>🎯</div>
            <div>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 18, letterSpacing: '-0.5px' }}>MockMate</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: -2 }}>AI Interview Coach</div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: 4 }}>
          {NAV.map(({ path, label, icon }) => (
            <NavLink
              key={path}
              to={path}
              onClick={() => setSidebarOpen(false)}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '10px 14px',
                borderRadius: 10,
                fontFamily: 'var(--font-display)',
                fontWeight: 600,
                fontSize: 14,
                textDecoration: 'none',
                transition: 'all 0.15s',
                background: isActive ? 'rgba(59,130,246,0.12)' : 'transparent',
                color: isActive ? 'var(--accent)' : 'var(--text-dim)',
                borderLeft: isActive ? '3px solid var(--accent)' : '3px solid transparent',
              })}
            >
              <span style={{ fontSize: 16 }}>{icon}</span>
              {label}
            </NavLink>
          ))}
        </nav>

        {/* User */}
        <div style={{ padding: '16px 12px', borderTop: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 10, background: 'var(--bg-elevated)', marginBottom: 8 }}>
            <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'linear-gradient(135deg, #2563eb, #0891b2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14, color: 'white', flexShrink: 0 }}>
              {user?.name?.[0]?.toUpperCase() || 'U'}
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 13, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.name}</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{user?.role}</div>
            </div>
          </div>
          <button onClick={handleLogout} className="btn-secondary" style={{ width: '100%', justifyContent: 'center', fontSize: 13, padding: '9px 16px' }}>
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div style={{ flex: 1, marginLeft: 240, display: 'flex', flexDirection: 'column', minHeight: '100vh' }} className="main-content">
        {/* Mobile header */}
        <header style={{ display: 'none', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', background: 'var(--bg-card)', borderBottom: '1px solid var(--border)', position: 'sticky', top: 0, zIndex: 30 }} className="mobile-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 30, height: 30, borderRadius: 8, background: 'linear-gradient(135deg, #2563eb, #0891b2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>🎯</div>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 16 }}>MockMate</span>
          </div>
          <button onClick={() => setSidebarOpen(!sidebarOpen)} style={{ background: 'none', border: 'none', color: 'var(--text)', cursor: 'pointer', fontSize: 22, lineHeight: 1 }}>
            {sidebarOpen ? '✕' : '☰'}
          </button>
        </header>

        <main style={{ flex: 1, padding: '32px', overflowY: 'auto' }} className="page-main">
          {children}
        </main>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .sidebar { transform: translateX(-100%); }
          .sidebar.sidebar-open { transform: translateX(0); }
          .mobile-overlay { display: block !important; }
          .mobile-header { display: flex !important; }
          .main-content { margin-left: 0 !important; }
          .page-main { padding: 20px !important; }
        }
      `}</style>
    </div>
  );
}
