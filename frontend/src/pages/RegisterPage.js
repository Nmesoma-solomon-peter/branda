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
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 120, background: 'var(--gray-50)' }}>
      <div style={{ width: '100%', maxWidth: 420 }}>
        <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 28, fontWeight: 700, textAlign: 'center', marginBottom: 8 }}>Create your account</h2>
        <p style={{ textAlign: 'center', color: 'var(--gray-500)', marginBottom: 32, fontSize: 15 }}>Join Branda and start building your brand</p>
        <div style={{ background: 'var(--white)', padding: 32, borderRadius: 'var(--radius)', border: '1px solid var(--gray-200)' }}>
          <RegisterForm />
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
