import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 120, background: 'var(--gray-50)' }}>
      <div style={{ textAlign: 'center', maxWidth: 400 }}>
        <div style={{
          width: 80, height: 80, background: 'var(--gray-100)', borderRadius: '50%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 24px'
        }}>
          <span style={{ fontFamily: 'var(--font-heading)', fontSize: 36, fontWeight: 700, color: 'var(--gray-300)' }}>404</span>
        </div>
        <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 28, fontWeight: 700, marginBottom: 8 }}>Page Not Found</h1>
        <p style={{ color: 'var(--gray-500)', fontSize: 15, marginBottom: 32, lineHeight: 1.6 }}>
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link to="/" className="btn btn-primary" style={{ display: 'inline-flex' }}>
          Go Home
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
