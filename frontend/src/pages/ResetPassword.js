import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('verifying');
  const [error, setError] = useState('');

  useEffect(() => {
    const checkToken = async () => {
      try {
        await api.post(`/auth/reset-password/${token}`, { password: '_check_' });
        setStatus('form');
      } catch (err) {
        if (err.response?.status === 400 && err.response?.data?.error?.includes('password')) {
          setStatus('form');
        } else {
          setStatus('error');
          setError(err.response?.data?.error || 'Invalid or expired reset link.');
        }
      }
    };
    checkToken();
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await api.post(`/auth/reset-password/${token}`, { password });
      setStatus('success');
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '120px 20px', background: 'var(--gray-50)' }}>
        <div style={{ background: '#fff', borderRadius: '8px', padding: '40px', maxWidth: '440px', width: '100%', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          {status === 'verifying' && (
            <div style={{ textAlign: 'center' }}>
              <div style={{ width: '40px', height: '40px', border: '3px solid #e5e7eb', borderTopColor: '#6f9c3e', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }} />
              <p style={{ color: '#6b7280', fontSize: '15px' }}>Verifying reset link...</p>
            </div>
          )}
          {status === 'error' && (
            <div style={{ textAlign: 'center' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
              </div>
              <h2 style={{ margin: '0 0 8px', fontSize: '20px', color: '#000' }}>Link Expired</h2>
              <p style={{ color: '#6b7280', fontSize: '15px', margin: '0 0 24px' }}>{error}</p>
              <Link to="/forgot-password" style={{ display: 'inline-block', padding: '12px 28px', background: '#6f9c3e', color: '#fff', textDecoration: 'none', borderRadius: '6px', fontWeight: '600', fontSize: '14px' }}>Request New Link</Link>
            </div>
          )}
          {status === 'success' && (
            <div style={{ textAlign: 'center' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#EDF3E2', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#6f9c3e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
              </div>
              <h2 style={{ margin: '0 0 8px', fontSize: '20px', color: '#000' }}>Password Reset</h2>
              <p style={{ color: '#6b7280', fontSize: '15px', margin: '0 0 24px' }}>Your password has been reset. Redirecting to login...</p>
            </div>
          )}
          {status === 'form' && (
            <>
              <h2 style={{ margin: '0 0 8px', fontSize: '20px', color: '#000', textAlign: 'center' }}>Reset Password</h2>
              <p style={{ color: '#6b7280', fontSize: '15px', margin: '0 0 24px', textAlign: 'center' }}>Enter your new password below.</p>
              {error && (
                <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '6px', padding: '12px', marginBottom: '16px', color: '#dc2626', fontSize: '14px' }}>{error}</div>
              )}
              <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500', color: '#374151' }}>New Password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    style={{ width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px', boxSizing: 'border-box' }}
                  />
                </div>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500', color: '#374151' }}>Confirm Password</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat your password"
                    style={{ width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px', boxSizing: 'border-box' }}
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    width: '100%', padding: '12px', background: loading ? '#9ca3af' : '#6f9c3e', color: '#fff',
                    border: 'none', borderRadius: '6px', fontSize: '14px', fontWeight: '600', cursor: loading ? 'not-allowed' : 'pointer'
                  }}
                >
                  {loading ? 'Resetting...' : 'Reset Password'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ResetPassword;