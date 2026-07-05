import React from 'react';

const WrenchIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="32" height="32">
    <path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z" />
  </svg>
);

const Maintenance = () => {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 120, background: 'var(--gray-50)' }}>
      <div style={{ textAlign: 'center', maxWidth: 420 }}>
        <div style={{
          width: 80, height: 80, background: '#FEF3C7', borderRadius: '50%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 24px', color: '#D97706'
        }}>
          <WrenchIcon />
        </div>
        <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 28, fontWeight: 700, marginBottom: 8 }}>Under Maintenance</h1>
        <p style={{ color: 'var(--gray-500)', fontSize: 15, marginBottom: 12, lineHeight: 1.6 }}>
          We're currently performing scheduled maintenance. Please check back shortly.
        </p>
        <p style={{ color: 'var(--gray-400)', fontSize: 13 }}>
          For urgent inquiries, contact us at{' '}
          <a href="mailto:support@branda-five.vercel.app" style={{ color: 'var(--green)', textDecoration: 'none', fontWeight: 500 }}>
            support@branda-five.vercel.app
          </a>
        </p>
      </div>
    </div>
  );
};

export default Maintenance;
