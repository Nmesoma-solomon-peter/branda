import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import RegisterForm from '../components/auth/RegisterForm';

const RegisterPage = () => {
  const { isAuthenticated, loading, user } = useAuth();

  if (loading) return null;
  if (isAuthenticated) {
    if (user?.role === 'admin') return <Navigate to="/manage/dashboard" replace />;
    return <Navigate to={user?.role === 'sme' ? '/dashboard' : '/specialist-dashboard'} replace />;
  }

  return (
    <div className="login-wrap" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 120, background: 'var(--gray-50)' }}>
      <style>{`@media (max-width: 480px) { .login-wrap { padding: 80px 16px !important; } .login-wrap > div { max-width: 100% !important; } .login-wrap .form-card { padding: 24px 16px !important; } }`}</style>
      <div style={{ width: '100%', maxWidth: 420 }}>
        <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 28, fontWeight: 700, textAlign: 'center', marginBottom: 8 }}>Create your account</h2>
        <p style={{ textAlign: 'center', color: 'var(--gray-500)', marginBottom: 32, fontSize: 15 }}>Join Branda and start building your brand</p>
        <div className="form-card" style={{ background: 'var(--white)', padding: 32, borderRadius: 'var(--radius)', border: '1px solid var(--gray-200)' }}>
          <RegisterForm />
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
