import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';

const CloseIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="14" height="14">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);

const InfoIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
    <circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>
  </svg>
);

const WarningIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
    <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
  </svg>
);

const SuccessIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
    <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
  </svg>
);

const AnnouncementBanner = () => {
  const { isAuthenticated } = useAuth();
  const [announcements, setAnnouncements] = useState([]);
  const [dismissed, setDismissed] = useState({});

  useEffect(() => {
    if (!isAuthenticated) return;
    const hidden = JSON.parse(localStorage.getItem('dismissed-announcements') || '{}');
    setDismissed(hidden);

    api.get('/announcements/active')
      .then(res => {
        const active = (res.data.announcements || []).filter(a => !hidden[a._id]);
        setAnnouncements(active);
      })
      .catch(() => {});
  }, [isAuthenticated]);

  const dismiss = (id) => {
    setAnnouncements(prev => prev.filter(a => a._id !== id));
    const hidden = { ...dismissed, [id]: true };
    setDismissed(hidden);
    localStorage.setItem('dismissed-announcements', JSON.stringify(hidden));
  };

  if (announcements.length === 0) return null;

  const colors = {
    info: { bg: '#EFF6FF', border: '#BFDBFE', color: '#1E40AF', icon: <InfoIcon /> },
    warning: { bg: '#FFFBEB', border: '#FDE68A', color: '#92400E', icon: <WarningIcon /> },
    success: { bg: '#F0FDF4', border: '#BBF7D0', color: '#166534', icon: <SuccessIcon /> }
  };

  return (
    <>
      <style>{`
        .ab-container { position: fixed; top: 70px; left: 50%; transform: translateX(-50%); z-index: 999; width: calc(100% - 32px); max-width: 600px; display: flex; flex-direction: column; gap: 8px; }
        .ab-banner { display: flex; align-items: flex-start; gap: 10px; padding: 12px 16px; border-radius: 8px; border: 1px solid; box-shadow: 0 4px 12px rgba(0,0,0,0.08); animation: ab-slideIn 0.3s ease; }
        .ab-banner-icon { flex-shrink: 0; margin-top: 1px; }
        .ab-banner-content { flex: 1; }
        .ab-banner-title { font-size: 13px; font-weight: 600; margin-bottom: 2px; }
        .ab-banner-msg { font-size: 12px; line-height: 1.5; opacity: 0.85; }
        .ab-banner-close { background: none; border: none; cursor: pointer; padding: 2px; border-radius: 4px; flex-shrink: 0; opacity: 0.6; }
        .ab-banner-close:hover { opacity: 1; }
        @keyframes ab-slideIn { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>

      <div className="ab-container">
        {announcements.map(a => {
          const c = colors[a.type] || colors.info;
          return (
            <div key={a._id} className="ab-banner" style={{ background: c.bg, borderColor: c.border, color: c.color }}>
              <div className="ab-banner-icon">{c.icon}</div>
              <div className="ab-banner-content">
                <div className="ab-banner-title">{a.title}</div>
                <div className="ab-banner-msg">{a.message}</div>
              </div>
              <button className="ab-banner-close" onClick={() => dismiss(a._id)} style={{ color: c.color }}>
                <CloseIcon />
              </button>
            </div>
          );
        })}
      </div>
    </>
  );
};

export default AnnouncementBanner;
