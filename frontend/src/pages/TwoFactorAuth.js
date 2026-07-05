import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

const TwoFactorAuth = () => {
  useAuth();
  const [enabled, setEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [qrCode, setQrCode] = useState('');
  const [secret, setSecret] = useState('');
  const [token, setToken] = useState('');
  const [step, setStep] = useState('loading');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    api.get('/auth/2fa/status').then(res => {
      setEnabled(res.data.enabled);
      setStep(res.data.enabled ? 'manage' : 'initial');
    }).catch(() => setStep('initial')).finally(() => setLoading(false));
  }, []);

  const handleEnable = async () => {
    setError('');
    setSuccess('');
    try {
      const res = await api.post('/auth/2fa/enable');
      setQrCode(res.data.qrCode);
      setSecret(res.data.secret);
      setStep('verify');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to start 2FA setup');
    }
  };

  const handleVerify = async () => {
    if (!token.trim()) return;
    setError('');
    try {
      await api.post('/auth/2fa/verify', { token });
      setEnabled(true);
      setSuccess('2FA has been enabled successfully');
      setStep('manage');
      setToken('');
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid token');
    }
  };

  const handleDisable = async () => {
    if (!token.trim()) return;
    setError('');
    try {
      await api.post('/auth/2fa/disable', { token });
      setEnabled(false);
      setSuccess('2FA has been disabled');
      setStep('initial');
      setToken('');
      setQrCode('');
      setSecret('');
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid token');
    }
  };

  if (loading) return <div style={{ padding: '100px 32px', textAlign: 'center', color: 'var(--gray-400)' }}>Loading...</div>;

  return (
    <>
      <style>{`
        .tfa-container { max-width: 480px; margin: 100px auto 60px; padding: 0 32px; }
        .tfa-card { background: var(--white); border: 1px solid var(--gray-200); border-radius: var(--radius); padding: 32px; }
        .tfa-title { font-family: var(--font-heading); font-size: 22px; font-weight: 700; margin: 0 0 8px; }
        .tfa-desc { font-size: 14px; color: var(--gray-500); line-height: 1.6; margin-bottom: 24px; }
        .tfa-status { display: inline-flex; align-items: center; gap: 6px; padding: 6px 12px; border-radius: 20px; font-size: 13px; font-weight: 600; margin-bottom: 24px; }
        .tfa-status.enabled { background: #DCFCE7; color: #166534; }
        .tfa-status.disabled { background: var(--gray-100); color: var(--gray-500); }
        .tfa-status-dot { width: 8px; height: 8px; border-radius: 50%; }
        .tfa-status.enabled .tfa-status-dot { background: #16A34A; }
        .tfa-status.disabled .tfa-status-dot { background: var(--gray-400); }
        .tfa-qr { text-align: center; margin: 20px 0; }
        .tfa-qr img { max-width: 200px; border: 1px solid var(--gray-200); border-radius: 8px; }
        .tfa-secret { background: var(--gray-50); padding: 12px; border-radius: 6px; font-family: monospace; font-size: 13px; word-break: break-all; text-align: center; margin: 12px 0; color: var(--gray-700); }
        .tfa-input { width: 100%; padding: 12px 14px; border: 1px solid var(--gray-200); border-radius: 8px; font-size: 18px; font-family: monospace; text-align: center; letter-spacing: 8px; outline: none; margin-bottom: 16px; }
        .tfa-input:focus { border-color: var(--green); }
        .tfa-btn { width: 100%; padding: 12px; border: none; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; }
        .tfa-btn.primary { background: var(--green); color: var(--white); }
        .tfa-btn.primary:disabled { background: var(--gray-300); cursor: not-allowed; }
        .tfa-btn.danger { background: #DC2626; color: var(--white); margin-top: 8px; }
        .tfa-btn.danger:disabled { background: var(--gray-300); cursor: not-allowed; }
        .tfa-btn.secondary { background: var(--white); border: 1px solid var(--gray-200); color: var(--gray-700); margin-top: 8px; }
        .tfa-msg { padding: 10px 14px; border-radius: 6px; font-size: 13px; margin-bottom: 16px; }
        .tfa-msg.error { background: #FEF2F2; color: #991B1B; border: 1px solid #FECACA; }
        .tfa-msg.success { background: #F0FDF4; color: #166534; border: 1px solid #BBF7D0; }
      `}</style>

      <div className="tfa-container">
        <div className="tfa-card">
          <h1 className="tfa-title">Two-Factor Authentication</h1>
          <p className="tfa-desc">Add an extra layer of security to your account by requiring a verification code from your authenticator app.</p>

          <div className={`tfa-status ${enabled ? 'enabled' : 'disabled'}`}>
            <div className="tfa-status-dot" />
            {enabled ? 'Enabled' : 'Disabled'}
          </div>

          {error && <div className="tfa-msg error">{error}</div>}
          {success && <div className="tfa-msg success">{success}</div>}

          {step === 'initial' && (
            <button className="tfa-btn primary" onClick={handleEnable}>Enable 2FA</button>
          )}

          {step === 'verify' && (
            <>
              <p style={{ fontSize: 14, color: 'var(--gray-600)', marginBottom: 12 }}>Scan this QR code with your authenticator app (Google Authenticator, Authy, etc.):</p>
              <div className="tfa-qr"><img src={qrCode} alt="2FA QR Code" /></div>
              <p style={{ fontSize: 12, color: 'var(--gray-400)', textAlign: 'center', marginBottom: 4 }}>Or enter this secret manually:</p>
              <div className="tfa-secret">{secret}</div>
              <p style={{ fontSize: 14, color: 'var(--gray-600)', marginBottom: 8 }}>Enter the 6-digit code from your app:</p>
              <input className="tfa-input" value={token} onChange={e => setToken(e.target.value.replace(/\D/g, '').slice(0, 6))} placeholder="000000" maxLength={6} />
              <button className="tfa-btn primary" onClick={handleVerify} disabled={token.length !== 6}>Verify & Enable</button>
              <button className="tfa-btn secondary" onClick={() => { setStep('initial'); setQrCode(''); setSecret(''); }}>Cancel</button>
            </>
          )}

          {step === 'manage' && enabled && (
            <>
              <p style={{ fontSize: 14, color: 'var(--gray-600)', marginBottom: 12 }}>To disable 2FA, enter a code from your authenticator app:</p>
              <input className="tfa-input" value={token} onChange={e => setToken(e.target.value.replace(/\D/g, '').slice(0, 6))} placeholder="000000" maxLength={6} />
              <button className="tfa-btn danger" onClick={handleDisable} disabled={token.length !== 6}>Disable 2FA</button>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default TwoFactorAuth;
