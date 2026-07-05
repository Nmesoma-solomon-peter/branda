import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const RegisterForm = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('sme');
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await register({ name, email, password, role });
      navigate(data.user.role === 'sme' ? '/dashboard' : '/specialist-dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && <div className="notification error" style={{ position: 'static', marginBottom: 16, animation: 'none' }}>
        <div className="notification-content">
          <div className="notification-message" style={{ color: '#DC2626' }}>{error}</div>
        </div>
      </div>}
      <div style={{ marginBottom: 16 }}>
        <label style={{ display: 'block', fontSize: 14, fontWeight: 500, marginBottom: 6 }}>Full Name</label>
        <input
          type="text"
          className="form-input"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter your full name"
          required
          disabled={loading}
          style={{ width: '100%' }}
        />
      </div>
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
      <div style={{ marginBottom: 16 }}>
        <label style={{ display: 'block', fontSize: 14, fontWeight: 500, marginBottom: 6 }}>Password</label>
        <input
          type="password"
          className="form-input"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Min. 6 characters"
          required
          minLength={6}
          disabled={loading}
          style={{ width: '100%' }}
        />
      </div>
      <div style={{ marginBottom: 24 }}>
        <label style={{ display: 'block', fontSize: 14, fontWeight: 500, marginBottom: 6 }}>I am a...</label>
        <div style={{ display: 'flex', gap: 12 }}>
          <button
            type="button"
            onClick={() => setRole('sme')}
            style={{
              flex: 1,
              padding: '12px 16px',
              borderRadius: 'var(--radius)',
              border: `1px solid ${role === 'sme' ? 'var(--green)' : 'var(--gray-300)'}`,
              background: role === 'sme' ? 'var(--green-light)' : 'var(--white)',
              color: 'var(--black)',
              cursor: 'pointer',
              fontSize: 14,
              fontWeight: 500,
              fontFamily: 'var(--font-body)'
            }}
          >
            Business Owner
          </button>
          <button
            type="button"
            onClick={() => setRole('specialist')}
            style={{
              flex: 1,
              padding: '12px 16px',
              borderRadius: 'var(--radius)',
              border: `1px solid ${role === 'specialist' ? 'var(--green)' : 'var(--gray-300)'}`,
              background: role === 'specialist' ? 'var(--green-light)' : 'var(--white)',
              color: 'var(--black)',
              cursor: 'pointer',
              fontSize: 14,
              fontWeight: 500,
              fontFamily: 'var(--font-body)'
            }}
          >
            Designer
          </button>
        </div>
      </div>
      <div style={{ marginBottom: 20, display: 'flex', alignItems: 'flex-start', gap: 8 }}>
        <input
          type="checkbox"
          checked={agreed}
          onChange={(e) => setAgreed(e.target.checked)}
          style={{ marginTop: 3, width: 16, height: 16, accentColor: 'var(--green)' }}
          id="terms-agree"
        />
        <label htmlFor="terms-agree" style={{ fontSize: 13, color: 'var(--gray-500)', lineHeight: 1.5 }}>
          I agree to the <Link to="/terms" style={{ color: 'var(--green)', fontWeight: 500 }}>Terms of Service</Link> and <Link to="/privacy" style={{ color: 'var(--green)', fontWeight: 500 }}>Privacy Policy</Link>
        </label>
      </div>
      <button type="submit" className="btn btn-primary" disabled={loading || !agreed} style={{ width: '100%' }}>
        {loading ? 'Creating account...' : 'Create Account'}
      </button>
      <p style={{ textAlign: 'center', marginTop: 16, fontSize: 14, color: 'var(--gray-500)' }}>
        Already have an account? <Link to="/login" style={{ color: 'var(--green)', fontWeight: 500 }}>Sign in</Link>
      </p>
    </form>
  );
};

export default RegisterForm;
