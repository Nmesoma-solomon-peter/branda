import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';

const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [requires2FA, setRequires2FA] = useState(false);
  const [userId, setUserId] = useState('');
  const [twoFAToken, setTwoFAToken] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await login(email, password);
      if (data.requires2FA) {
        setRequires2FA(true);
        setUserId(data.userId);
        setLoading(false);
        return;
      }
      if (data.user.role === 'admin') navigate('/manage/dashboard');
      else navigate(data.user.role === 'sme' ? '/dashboard' : '/specialist-dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handle2FA = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.post('/auth/login/2fa', { userId, token: twoFAToken });
      localStorage.setItem('token', res.data.token);
      if (res.data.user.role === 'admin') window.location.href = '/manage/dashboard';
      else window.location.href = res.data.user.role === 'sme' ? '/dashboard' : '/specialist-dashboard';
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (requires2FA) {
    return (
      <form onSubmit={handle2FA}>
        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <div style={{ width: 48, height: 48, borderRadius: 12, background: 'var(--green-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="24" height="24">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/>
            </svg>
          </div>
          <h3 style={{ fontSize: 16, fontWeight: 600, margin: '0 0 4px' }}>Two-Factor Authentication</h3>
          <p style={{ fontSize: 13, color: 'var(--gray-500)', margin: 0 }}>Enter the 6-digit code from your authenticator app</p>
        </div>
        {error && <div className="notification error" style={{ position: 'static', marginBottom: 16, animation: 'none' }}>
          <div className="notification-content">
            <div className="notification-message" style={{ color: '#DC2626' }}>{error}</div>
          </div>
        </div>}
        <div style={{ marginBottom: 24 }}>
          <input
            type="text"
            className="form-input"
            value={twoFAToken}
            onChange={(e) => setTwoFAToken(e.target.value.replace(/\D/g, '').slice(0, 6))}
            placeholder="000000"
            maxLength={6}
            required
            disabled={loading}
            style={{ width: '100%', fontSize: 22, fontFamily: 'monospace', textAlign: 'center', letterSpacing: 8, padding: '14px 12px' }}
            autoFocus
          />
        </div>
        <button type="submit" className="btn btn-primary" disabled={loading || twoFAToken.length !== 6} style={{ width: '100%' }}>
          {loading ? 'Verifying...' : 'Verify'}
        </button>
        <p style={{ textAlign: 'center', marginTop: 16, fontSize: 13, color: 'var(--gray-500)' }}>
          <button type="button" onClick={() => { setRequires2FA(false); setTwoFAToken(''); setError(''); }} style={{ background: 'none', border: 'none', color: 'var(--green)', cursor: 'pointer', fontSize: 13, fontWeight: 500 }}>Back to login</button>
        </p>
      </form>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      {error && <div className="notification error" style={{ position: 'static', marginBottom: 16, animation: 'none' }}>
        <div className="notification-content">
          <div className="notification-message" style={{ color: '#DC2626' }}>{error}</div>
        </div>
      </div>}
      <div style={{ marginBottom: 16 }}>
        <label style={{ display: 'block', fontSize: 14, fontWeight: 500, marginBottom: 6 }}>Email</label>
        <input
          type="email"
          className="form-input"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          required
          disabled={loading}
          style={{ width: '100%' }}
        />
      </div>
      <div style={{ marginBottom: 24 }}>
        <label style={{ display: 'block', fontSize: 14, fontWeight: 500, marginBottom: 6 }}>Password</label>
        <input
          type="password"
          className="form-input"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter your password"
          required
          disabled={loading}
          style={{ width: '100%' }}
        />
      </div>
      <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%' }}>
        {loading ? 'Signing in...' : 'Sign In'}
      </button>
      <p style={{ textAlign: 'center', marginTop: 16, fontSize: 14, color: 'var(--gray-500)' }}>
        No account? <Link to="/register" style={{ color: 'var(--green)', fontWeight: 500 }}>Create one</Link>
      </p>
      <div style={{ textAlign: 'center', marginTop: 4 }}>
        <Link to="/" style={{ fontSize: 13, color: 'var(--gray-400)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="14" height="14"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
          Back to Home
        </Link>
      </div>
    </form>
  );
};

export default LoginForm;
