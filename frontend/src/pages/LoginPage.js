import React from 'react';
import { Navigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoginForm from '../components/auth/LoginForm';

const LoginPage = () => {
  const { isAuthenticated, loading, user } = useAuth();

  if (loading) return null;
  if (isAuthenticated) return <Navigate to={user?.role === 'sme' ? '/dashboard' : '/specialist-dashboard'} replace />;

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 120, background: 'var(--gray-50)' }}>
      <div style={{ width: '100%', maxWidth: 420 }}>
        <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 28, fontWeight: 700, textAlign: 'center', marginBottom: 8 }}>Welcome back</h2>
        <p style={{ textAlign: 'center', color: 'var(--gray-500)', marginBottom: 32, fontSize: 15 }}>Sign in to your account</p>
        <div style={{ background: 'var(--white)', padding: 32, borderRadius: 'var(--radius)', border: '1px solid var(--gray-200)' }}>
          <LoginForm />
          <div style={{ textAlign: 'right', marginTop: '12px' }}>
            <Link to="/forgot-password" style={{ color: 'var(--primary)', fontSize: '13px', textDecoration: 'none' }}>Forgot password?</Link>
          </div>
        </div>
        <p style={{ textAlign: 'center', marginTop: 20, fontSize: 12, color: 'var(--gray-400)' }}>
          By signing in you agree to our <Link to="/terms" style={{ color: 'var(--green)' }}>Terms</Link> and <Link to="/privacy" style={{ color: 'var(--green)' }}>Privacy Policy</Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
