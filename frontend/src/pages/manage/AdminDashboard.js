import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import AdminOverview from './AdminOverview';
import AdminUsers from './AdminUsers';
import AdminProjects from './AdminProjects';
import AdminAssets from './AdminAssets';
import AdminSubscribers from './AdminSubscribers';
import AdminSettings from './AdminSettings';
import AdminKYC from './AdminKYC';
import AdminActivity from './AdminActivity';
import AdminMessages from './AdminMessages';
import AdminPayments from './AdminPayments';
import AdminSpecialists from './AdminSpecialists';
import AdminPayouts from './AdminPayouts';
import AdminFlagged from './AdminFlagged';
import AdminPromoCodes from './AdminPromoCodes';
import AdminReviews from './AdminReviews';
import AdminContracts from './AdminContracts';
import AdminCaseStudies from './AdminCaseStudies';
import AdminTickets from './AdminTickets';
import AdminBlog from './AdminBlog';
import AdminAnnouncements from './AdminAnnouncements';
import ConfirmModal from '../../components/common/ConfirmModal';

const navItems = [
  { id: 'overview', label: 'Overview', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0a1 1 0 01-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 01-1 1' },
  { id: 'users', label: 'Users', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' },
  { id: 'specialists', label: 'Specialists', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z' },
  { id: 'projects', label: 'Projects', icon: 'M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' },
  { id: 'contracts', label: 'Contracts', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
  { id: 'payments', label: 'Payments', icon: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z' },
  { id: 'payouts', label: 'Payouts', icon: 'M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z' },
  { id: 'kyc', label: 'KYC', icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z' },
  { id: 'reviews', label: 'Reviews', icon: 'M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z' },
  { id: 'assets', label: 'Assets', icon: 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z' },
  { id: 'blog', label: 'Blog', icon: 'M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z' },
  { id: 'casestudies', label: 'Case Studies', icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253' },
  { id: 'flagged', label: 'Flagged', icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z' },
  { id: 'tickets', label: 'Tickets', icon: 'M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z' },
  { id: 'announcements', label: 'Announcements', icon: 'M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z' },
  { id: 'promo', label: 'Promos', icon: 'M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z' },
  { id: 'subscribers', label: 'Subscribers', icon: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' },
  { id: 'messages', label: 'Messages', icon: 'M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z M22 6l-10 7L2 6' },
  { id: 'activity', label: 'Activity', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
  { id: 'settings', label: 'Settings', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z' }
];

const NavIcon = ({ path }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
    <path d={path} />
  </svg>
);

const MenuIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="22" height="22">
    <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
  </svg>
);

const CloseIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="22" height="22">
    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [active, setActive] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showLogout, setShowLogout] = useState(false);

  useEffect(() => {
    if (!loading && (!user || user.role !== 'admin')) navigate('/manage/login');
  }, [loading, user, navigate]);

  if (loading || !user || user.role !== 'admin') return null;

  const handleLogout = () => {
    setShowLogout(false);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/manage/login');
  };

  const handleNav = (id) => {
    setActive(id);
    setSidebarOpen(false);
  };

  const renderPage = () => {
    switch (active) {
      case 'overview': return <AdminOverview />;
      case 'users': return <AdminUsers />;
      case 'projects': return <AdminProjects />;
      case 'payments': return <AdminPayments />;
      case 'assets': return <AdminAssets />;
      case 'kyc': return <AdminKYC />;
      case 'activity': return <AdminActivity />;
      case 'subscribers': return <AdminSubscribers />;
      case 'messages': return <AdminMessages />;
      case 'settings': return <AdminSettings />;
      case 'specialists': return <AdminSpecialists />;
      case 'payouts': return <AdminPayouts />;
      case 'flagged': return <AdminFlagged />;
      case 'promo': return <AdminPromoCodes />;
      case 'reviews': return <AdminReviews />;
      case 'contracts': return <AdminContracts />;
      case 'casestudies': return <AdminCaseStudies />;
      case 'tickets': return <AdminTickets />;
      case 'blog': return <AdminBlog />;
      case 'announcements': return <AdminAnnouncements />;
      default: return <AdminOverview />;
    }
  };

  return (
    <>
      <style>{`
        .admin-layout { display: flex; min-height: 100vh; background: var(--gray-50); }
        .admin-sidebar {
          width: 256px; background: var(--black); color: var(--white);
          position: fixed; top: 0; left: 0; bottom: 0; z-index: 50;
          display: flex; flex-direction: column;
          transition: transform 0.25s ease;
        }
        .admin-sidebar nav::-webkit-scrollbar { width: 4px; }
        .admin-sidebar nav::-webkit-scrollbar-track { background: transparent; }
        .admin-sidebar nav::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.2); border-radius: 2px; }
        .admin-main { flex: 1; margin-left: 256px; }
        .admin-overlay {
          position: fixed; inset: 0; background: rgba(0,0,0,0.4); z-index: 40;
          display: none;
        }
        .admin-menu-btn {
          background: none; border: none; cursor: pointer; color: var(--black);
          display: none; align-items: center; justify-content: center;
        }
        .admin-close-btn { display: none; }
        .admin-header { padding: 0 32px; }
        .admin-main-content { padding: 24px 32px; }
        @media (max-width: 768px) {
          .admin-sidebar { transform: translateX(-100%); }
          .admin-sidebar.open { transform: translateX(0); }
          .admin-main { margin-left: 0; }
          .admin-overlay.open { display: block; }
          .admin-menu-btn { display: flex; }
          .admin-close-btn { display: flex; }
          .admin-header { padding: 0 16px; }
          .admin-main-content { padding: 16px; }
        }
      `}</style>

      <div className="admin-layout">
        <div className={`admin-overlay ${sidebarOpen ? 'open' : ''}`} onClick={() => setSidebarOpen(false)} />

        <aside className={`admin-sidebar ${sidebarOpen ? 'open' : ''}`}>
          <div style={{ padding: '20px 24px', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <img src="/logo/logo.png" alt="Branda" width="28" height="28" style={{ borderRadius: 4 }} />
              <span style={{ fontFamily: 'var(--font-heading)', fontSize: 18, fontWeight: 700, color: 'var(--green)' }}>Manage</span>
            </div>
            <button onClick={() => setSidebarOpen(false)} className="admin-close-btn" style={{ background: 'none', border: 'none', color: 'var(--gray-400)', cursor: 'pointer', padding: 4 }}>
              <CloseIcon />
            </button>
          </div>

          <nav style={{ flex: 1, padding: '12px 0', overflowY: 'auto' }}>
            {navItems.map(item => (
              <button
                key={item.id}
                onClick={() => handleNav(item.id)}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: 12,
                  padding: '10px 24px', border: 'none', background: active === item.id ? 'rgba(0,218,150,0.15)' : 'transparent',
                  color: active === item.id ? 'var(--green)' : 'var(--gray-400)',
                  fontSize: 14, fontWeight: 500, cursor: 'pointer', textAlign: 'left',
                  fontFamily: 'var(--font-body)', transition: 'background 0.15s'
                }}
              >
                <NavIcon path={item.icon} />
                {item.label}
              </button>
            ))}
          </nav>

          <div style={{ padding: '16px 24px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
            <div style={{ fontSize: 13, color: 'var(--gray-400)', marginBottom: 8 }}>{user?.email}</div>
            <button onClick={() => setShowLogout(true)} style={{
              width: '100%', padding: '8px 12px', borderRadius: 'var(--radius)',
              border: '1px solid rgba(255,255,255,0.2)', background: 'transparent',
              color: 'var(--gray-300)', fontSize: 13, cursor: 'pointer',
              fontFamily: 'var(--font-body)'
            }}>
              Sign Out
            </button>
          </div>
        </aside>

        <div className="admin-main">
          <header className="admin-header" style={{
            position: 'sticky', top: 0, zIndex: 30,
            background: 'var(--white)', borderBottom: '1px solid var(--gray-200)',
            height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between'
          }}>
            <button onClick={() => setSidebarOpen(true)} className="admin-menu-btn" style={{ padding: 4 }}>
              <MenuIcon />
            </button>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 18, fontWeight: 700, textTransform: 'capitalize' }}>{active}</h2>
            <div style={{ width: 30 }} />
          </header>

          <main className="admin-main-content">
            {renderPage()}
          </main>
        </div>
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
    </>
  );
};

export default AdminDashboard;
