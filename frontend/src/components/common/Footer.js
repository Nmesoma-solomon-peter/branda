import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => (
  <footer style={{ background: 'var(--black)', color: 'var(--white)', padding: '40px 32px 24px' }}>
    <div style={{ maxWidth: '1120px', margin: '0 auto', display: 'flex', flexWrap: 'wrap', gap: '40px', justifyContent: 'space-between' }}>
      <div style={{ minWidth: '200px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
          <img src="/logo/favicon.png" alt="Branda" width="32" height="32" />
          <span style={{ fontSize: '18px', fontWeight: 700 }}>Branda</span>
        </div>
        <p style={{ fontSize: '14px', color: '#9CA3AF', lineHeight: 1.6 }}>
          Connecting small businesses in Aba with talented brand designers.
        </p>
      </div>
      <div style={{ minWidth: '150px' }}>
        <p style={{ fontSize: '12px', fontWeight: 600, marginBottom: '12px', color: '#9CA3AF' }}>Platform</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <Link to="/blog" style={{ fontSize: '13px', color: '#D1D5DB', textDecoration: 'none' }}>Blog</Link>
          <Link to="/faq" style={{ fontSize: '13px', color: '#D1D5DB', textDecoration: 'none' }}>FAQ</Link>
          <Link to="/contact" style={{ fontSize: '13px', color: '#D1D5DB', textDecoration: 'none' }}>Contact</Link>
        </div>
      </div>
      <div style={{ minWidth: '150px' }}>
        <p style={{ fontSize: '12px', fontWeight: 600, marginBottom: '12px', color: '#9CA3AF' }}>Legal</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <Link to="/terms" style={{ fontSize: '13px', color: '#D1D5DB', textDecoration: 'none' }}>Terms of Service</Link>
          <Link to="/privacy" style={{ fontSize: '13px', color: '#D1D5DB', textDecoration: 'none' }}>Privacy Policy</Link>
        </div>
      </div>
    </div>
    <div style={{ maxWidth: '1120px', margin: '32px auto 0', borderTop: '1px solid #374151', paddingTop: '24px', textAlign: 'center', fontSize: '12px', color: '#6B7280' }}>
      &copy; 2026 Branda. Branding made simple for small businesses.
    </div>
  </footer>
);

export default Footer;