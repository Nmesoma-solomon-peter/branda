import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import ConfirmModal from './ConfirmModal';

const MenuIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="24" height="24">
    <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
  </svg>
);

const CloseIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="24" height="24">
    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const BellIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
  </svg>
);

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifCount, setNotifCount] = useState(0);
  const [showLogout, setShowLogout] = useState(false);
  const [showNotifs, setShowNotifs] = useState(false);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (!isAuthenticated) return;
    const fetchCounts = () => {
      api.get('/chats/unread/count').then(res => setUnreadCount(res.data.count)).catch(() => {});
      api.get('/notifications/unread/count').then(res => setNotifCount(res.data.count)).catch(() => {});
    };
    fetchCounts();
    const interval = setInterval(fetchCounts, 15000);
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  const toggleNotifs = async () => {
    if (showNotifs) {
      setShowNotifs(false);
      return;
    }
    setShowNotifs(true);
    try {
      const res = await api.get('/notifications?limit=10');
      setNotifications(res.data.notifications);
      if (res.data.unreadCount > 0) {
        await api.put('/notifications/read-all');
        setNotifCount(0);
      }
    } catch {}
  };

  const handleLogout = () => {
    setShowLogout(false);
    logout();
    setMenuOpen(false);
    setUnreadCount(0);
    setNotifCount(0);
    navigate('/');
  };

  const closeMenu = () => setMenuOpen(false);

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="navbar-brand" onClick={closeMenu}>
          <img src="/logo/logo.png" alt="Branda logo" width="36" height="36" />
        </Link>

        <button className="navbar-toggle" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu">
          {menuOpen ? <CloseIcon /> : <MenuIcon />}
        </button>

        <ul className={`navbar-links ${menuOpen ? 'open' : ''}`}>
          {isAuthenticated ? (
            <>
              <li>
                <Link to={user?.role === 'sme' ? '/dashboard' : '/specialist-dashboard'} onClick={closeMenu}>
                  Dashboard
                </Link>
              </li>
              <li>
                <Link to="/chat" onClick={closeMenu} style={{ position: 'relative' }}>
                  Messages
                  {unreadCount > 0 && (
                    <span style={{
                      position: 'absolute', top: -4, right: -10, background: '#DC2626', color: 'var(--white)',
                      borderRadius: '50%', width: 16, height: 16, display: 'flex', alignItems: 'center',
                      justifyContent: 'center', fontSize: 9, fontWeight: 700, lineHeight: 1
                    }}>{unreadCount > 9 ? '9+' : unreadCount}</span>
                  )}
                </Link>
              </li>
              <li style={{ position: 'relative' }}>
                <button onClick={toggleNotifs} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '10px 0', color: 'inherit', position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <BellIcon />
                  {notifCount > 0 && (
                    <span style={{
                      position: 'absolute', top: 2, right: -4, background: '#DC2626', color: 'var(--white)',
                      borderRadius: '50%', width: 16, height: 16, display: 'flex', alignItems: 'center',
                      justifyContent: 'center', fontSize: 9, fontWeight: 700, lineHeight: 1
                    }}>{notifCount > 9 ? '9+' : notifCount}</span>
                  )}
                </button>
                {showNotifs && (
                  <div style={{
                    position: 'absolute', top: '100%', right: 0, background: '#fff', border: '1px solid var(--gray-200)',
                    borderRadius: '8px', width: '320px', maxHeight: '400px', overflowY: 'auto', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', zIndex: 1000, marginTop: '8px'
                  }}>
                    <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--gray-100)', fontWeight: 600, fontSize: '14px' }}>Notifications</div>
                    {notifications.length === 0 ? (
                      <div style={{ padding: '24px 16px', textAlign: 'center', color: 'var(--gray-400)', fontSize: '13px' }}>No notifications</div>
                    ) : notifications.map(n => (
                      <div key={n._id} style={{ padding: '12px 16px', borderBottom: '1px solid var(--gray-50)', background: n.read ? 'transparent' : '#f0fdf4' }}>
                        <p style={{ margin: 0, fontSize: '13px', fontWeight: 500, color: 'var(--gray-800)' }}>{n.title}</p>
                        <p style={{ margin: '4px 0 0', fontSize: '12px', color: 'var(--gray-400)' }}>{n.message}</p>
                      </div>
                    ))}
                  </div>
                )}
              </li>
              <li>
                <Link to="/profile" onClick={closeMenu}>Profile</Link>
              </li>
              {user?.role === 'specialist' && (
                <>
                  <li>
                    <Link to="/browse-projects" onClick={closeMenu}>Find Projects</Link>
                  </li>
                  <li>
                    <Link to="/kyc" onClick={closeMenu}>KYC</Link>
                  </li>
                  <li>
                    <Link to="/portfolio" onClick={closeMenu}>Portfolio</Link>
                  </li>
                </>
              )}
              {user?.role === 'sme' && (
                <>
                  <li>
                    <Link to="/browse" onClick={closeMenu}>Find Specialists</Link>
                  </li>
                  <li>
                    <Link to="/payments" onClick={closeMenu}>Payments</Link>
                  </li>
                </>
              )}
              <li>
                <Link to="/terms" onClick={closeMenu} style={{ fontSize: 13 }}>Terms</Link>
              </li>
              <li>
                <Link to="/privacy" onClick={closeMenu} style={{ fontSize: 13 }}>Privacy</Link>
              </li>
              <li>
                <button onClick={() => setShowLogout(true)} className="navbar-cta" style={{ background: 'none', color: 'var(--gray-600)', padding: '10px 0' }}>
                  Logout
                </button>
              </li>
            </>
          ) : (
            <>
              <li><Link to="/blog" onClick={closeMenu}>Blog</Link></li>
              <li><Link to="/faq" onClick={closeMenu}>FAQ</Link></li>
              <li><Link to="/contact" onClick={closeMenu}>Contact</Link></li>
              <li><Link to="/terms" onClick={closeMenu}>Terms</Link></li>
              <li><Link to="/privacy" onClick={closeMenu}>Privacy</Link></li>
              <li><Link to="/login" onClick={closeMenu}>Login</Link></li>
              <li>
                <Link to="/register" className="navbar-cta" onClick={closeMenu} style={{ background: 'var(--green)', color: 'var(--white)' }}>Get Started</Link>
              </li>
            </>
          )}
        </ul>
      </div>

      <ConfirmModal
        open={showLogout}
        title="Sign Out"
        message="Are you sure you want to sign out?"
        confirmText="Sign Out"
        danger
        onConfirm={handleLogout}
        onCancel={() => setShowLogout(false)}
      />
    </nav>
  );
};

export default Navbar;
