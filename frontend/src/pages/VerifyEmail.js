import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axios';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';

const VerifyEmail = () => {
  const { token } = useParams();
  const [status, setStatus] = useState('verifying');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const verify = async () => {
      try {
        await api.get(`/auth/verify/${token}`);
        setStatus('success');
        setMessage('Your email has been verified successfully.');
      } catch (err) {
        setStatus('error');
        setMessage(err.response?.data?.error || 'Invalid or expired verification link.');
      }
    };
    verify();
  }, [token]);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '120px 20px', background: 'var(--gray-50)' }}>
        <div style={{ background: '#fff', borderRadius: '8px', padding: '40px', maxWidth: '440px', width: '100%', textAlign: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          {status === 'verifying' && (
            <>
              <div style={{ width: '40px', height: '40px', border: '3px solid #e5e7eb', borderTopColor: '#6f9c3e', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }} />
              <p style={{ color: '#6b7280', fontSize: '15px' }}>Verifying your email...</p>
            </>
          )}
          {status === 'success' && (
            <>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#EDF3E2', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#6f9c3e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
              </div>
              <h2 style={{ margin: '0 0 8px', fontSize: '20px', color: '#000' }}>Email Verified</h2>
              <p style={{ color: '#6b7280', fontSize: '15px', margin: '0 0 24px' }}>{message}</p>
              <Link to="/login" style={{ display: 'inline-block', padding: '12px 28px', background: '#6f9c3e', color: '#fff', textDecoration: 'none', borderRadius: '6px', fontWeight: '600', fontSize: '14px' }}>Go to Login</Link>
            </>
          )}
          {status === 'error' && (
            <>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
              </div>
              <h2 style={{ margin: '0 0 8px', fontSize: '20px', color: '#000' }}>Verification Failed</h2>
              <p style={{ color: '#6b7280', fontSize: '15px', margin: '0 0 24px' }}>{message}</p>
              <Link to="/login" style={{ display: 'inline-block', padding: '12px 28px', background: '#6f9c3e', color: '#fff', textDecoration: 'none', borderRadius: '6px', fontWeight: '600', fontSize: '14px' }}>Go to Login</Link>
            </>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default VerifyEmail;
