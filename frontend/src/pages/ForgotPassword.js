import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      setError('Please enter your email');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await api.post('/auth/forgot-password', { email });
      setSent(true);
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
          {sent ? (
            <div style={{ textAlign: 'center' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#EDF3E2', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#6f9c3e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
              </div>
              <h2 style={{ margin: '0 0 8px', fontSize: '20px', color: '#000' }}>Check Your Email</h2>
              <p style={{ color: '#6b7280', fontSize: '15px', margin: '0 0 24px' }}>
                If an account exists with <strong>{email}</strong>, we've sent a password reset link.
              </p>
              <Link to="/login" style={{ display: 'inline-block', padding: '12px 28px', background: '#6f9c3e', color: '#fff', textDecoration: 'none', borderRadius: '6px', fontWeight: '600', fontSize: '14px' }}>Back to Login</Link>
            </div>
          ) : (
            <>
              <h2 style={{ margin: '0 0 8px', fontSize: '20px', color: '#000', textAlign: 'center' }}>Forgot Password</h2>
              <p style={{ color: '#6b7280', fontSize: '15px', margin: '0 0 24px', textAlign: 'center' }}>
                Enter your email and we'll send you a link to reset your password.
              </p>
              {error && (
                <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '6px', padding: '12px', marginBottom: '16px', color: '#dc2626', fontSize: '14px' }}>{error}</div>
              )}
              <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500', color: '#374151' }}>Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
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
                  {loading ? 'Sending...' : 'Send Reset Link'}
                </button>
              </form>
              <p style={{ textAlign: 'center', marginTop: '16px', fontSize: '14px', color: '#6b7280' }}>
                <Link to="/login" style={{ color: '#6f9c3e', textDecoration: 'none' }}>Back to Login</Link>
              </p>
            </>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ForgotPassword;