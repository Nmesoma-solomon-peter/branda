import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

const CheckIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);

const ArrowRight = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
    <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
  </svg>
);

const Onboarding = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    bio: '',
    location: '',
    phone: '',
    industry: ''
  });

  const isSME = user?.role === 'sme';

  const steps = isSME
    ? [
        { title: 'Welcome to Branda', subtitle: 'Connect with talented brand designers to bring your vision to life.' },
        { title: 'Complete Your Profile', subtitle: 'Help designers know more about you and your business.' },
        { title: 'You Are All Set', subtitle: 'Start creating projects and find the perfect designer.' }
      ]
    : [
        { title: 'Welcome to Branda', subtitle: 'Showcase your design skills and connect with businesses.' },
        { title: 'Complete Your Profile', subtitle: 'Tell clients about yourself and your expertise.' },
        { title: 'Submit Your KYC', subtitle: 'Verify your identity to start receiving projects.' },
        { title: 'You Are All Set', subtitle: 'Browse projects and start delivering great work.' }
      ];

  const handleComplete = async () => {
    setSaving(true);
    try {
      await api.put('/profile', {
        bio: form.bio,
        location: form.location,
        phone: form.phone
      });
      await api.post('/auth/me', { onboardingCompleted: true }).catch(() => {});
    } catch {} finally {
      setSaving(false);
      navigate(isSME ? '/dashboard' : '/specialist-dashboard');
    }
  };

  return (
    <>
      <style>{`
        .ob-container { min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 32px; background: var(--gray-50); }
        .ob-card { background: var(--white); border: 1px solid var(--gray-200); border-radius: var(--radius); width: 100%; max-width: 480px; padding: 40px 32px; text-align: center; }
        .ob-step-dots { display: flex; justify-content: center; gap: 8px; margin-bottom: 32px; }
        .ob-dot { width: 8px; height: 8px; border-radius: 50%; background: var(--gray-200); }
        .ob-dot.active { background: var(--green); width: 24px; border-radius: 4px; }
        .ob-dot.done { background: var(--green); }
        .ob-icon { width: 64px; height: 64px; border-radius: 50%; background: var(--green-light); display: flex; align-items: center; justify-content: center; margin: 0 auto 20px; color: var(--green); }
        .ob-title { font-family: var(--font-heading); font-size: 24px; font-weight: 700; margin: 0 0 8px; }
        .ob-subtitle { font-size: 14px; color: var(--gray-500); line-height: 1.6; margin-bottom: 32px; }
        .ob-field { margin-bottom: 16px; text-align: left; }
        .ob-field label { display: block; font-size: 13px; font-weight: 600; color: var(--gray-700); margin-bottom: 6px; }
        .ob-field input, .ob-field textarea { width: 100%; padding: 10px 14px; border: 1px solid var(--gray-200); border-radius: 8px; font-size: 14px; font-family: var(--font-body); outline: none; }
        .ob-field input:focus, .ob-field textarea:focus { border-color: var(--green); }
        .ob-field textarea { resize: vertical; min-height: 80px; }
        .ob-btn { display: inline-flex; align-items: center; gap: 8px; padding: 12px 28px; border: none; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer; }
        .ob-btn.primary { background: var(--green); color: var(--white); }
        .ob-btn.primary:disabled { background: var(--gray-300); cursor: not-allowed; }
        .ob-btn.secondary { background: var(--white); color: var(--gray-600); border: 1px solid var(--gray-200); margin-left: 8px; }
        .ob-features { text-align: left; margin: 20px 0; }
        .ob-feature { display: flex; align-items: flex-start; gap: 12px; padding: 10px 0; }
        .ob-feature-icon { width: 32px; height: 32px; border-radius: 8px; background: var(--green-light); display: flex; align-items: center; justify-content: center; flex-shrink: 0; color: var(--green); }
        .ob-feature-text { font-size: 14px; color: var(--gray-700); }
        .ob-feature-text strong { display: block; font-size: 14px; margin-bottom: 2px; }
        .ob-feature-text span { font-size: 13px; color: var(--gray-500); }
      `}</style>

      <div className="ob-container">
        <div className="ob-card">
          <div className="ob-step-dots">
            {steps.map((_, i) => (
              <div key={i} className={`ob-dot ${i === step ? 'active' : ''} ${i < step ? 'done' : ''}`} />
            ))}
          </div>

          {step === 0 && (
            <>
              <div className="ob-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="28" height="28">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                </svg>
              </div>
              <h1 className="ob-title">{steps[0].title}</h1>
              <p className="ob-subtitle">{steps[0].subtitle}</p>
              <div className="ob-features">
                <div className="ob-feature">
                  <div className="ob-feature-icon"><CheckIcon /></div>
                  <div className="ob-feature-text"><strong>{isSME ? 'Post Projects' : 'Get Matched'}</strong><span>{isSME ? 'Describe your brand needs and get matched with designers' : 'Receive project assignments based on your skills'}</span></div>
                </div>
                <div className="ob-feature">
                  <div className="ob-feature-icon"><CheckIcon /></div>
                  <div className="ob-feature-text"><strong>{isSME ? 'Collaborate' : 'Deliver Work'}</strong><span>{isSME ? 'Work directly with designers through our platform' : 'Upload deliverables and get feedback in real-time'}</span></div>
                </div>
                <div className="ob-feature">
                  <div className="ob-feature-icon"><CheckIcon /></div>
                  <div className="ob-feature-text"><strong>{isSME ? 'Get Results' : 'Get Paid'}</strong><span>{isSME ? 'Receive your brand assets and launch with confidence' : 'Secure payments released upon project completion'}</span></div>
                </div>
              </div>
              <button className="ob-btn primary" onClick={() => setStep(1)}>Get Started <ArrowRight /></button>
            </>
          )}

          {step === 1 && (
            <>
              <h1 className="ob-title">{steps[1].title}</h1>
              <p className="ob-subtitle">{steps[1].subtitle}</p>
              <div className="ob-field">
                <label>{isSME ? 'Business Location' : 'Your Location'}</label>
                <input value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} placeholder="e.g. Aba, Nigeria" />
              </div>
              <div className="ob-field">
                <label>Phone Number</label>
                <input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="+234..." />
              </div>
              <div className="ob-field">
                <label>{isSME ? 'Short Bio About Your Business' : 'Professional Bio'}</label>
                <textarea value={form.bio} onChange={e => setForm({ ...form, bio: e.target.value })} placeholder={isSME ? 'Tell designers about your business and what you need...' : 'Describe your skills, experience, and what you offer...'} maxLength={500} />
              </div>
              <div style={{ marginTop: 24 }}>
                <button className="ob-btn primary" onClick={() => setStep(2)}>Continue <ArrowRight /></button>
                <button className="ob-btn secondary" onClick={() => setStep(0)}>Back</button>
              </div>
            </>
          )}

          {step === 2 && !isSME && steps.length === 4 && (
            <>
              <div className="ob-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="28" height="28">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              </div>
              <h1 className="ob-title">{steps[2].title}</h1>
              <p className="ob-subtitle">{steps[2].subtitle}</p>
              <p style={{ fontSize: 14, color: 'var(--gray-500)', marginBottom: 24 }}>KYC verification is required before you can receive project assignments. You can complete it now or later from your dashboard.</p>
              <div style={{ marginTop: 24 }}>
                <button className="ob-btn primary" onClick={() => { handleComplete(); navigate('/kyc'); }}>Submit KYC Now <ArrowRight /></button>
                <button className="ob-btn secondary" onClick={() => setStep(3)}>Do It Later</button>
              </div>
            </>
          )}

          {step === 2 && (isSME || steps.length === 3) && (
            <>
              <div className="ob-icon">
                <CheckIcon />
              </div>
              <h1 className="ob-title">{steps[steps.length - 1].title}</h1>
              <p className="ob-subtitle">{steps[steps.length - 1].subtitle}</p>
              <button className="ob-btn primary" onClick={handleComplete} disabled={saving}>{saving ? 'Saving...' : 'Go to Dashboard'} <ArrowRight /></button>
            </>
          )}

          {step === 3 && (
            <>
              <div className="ob-icon">
                <CheckIcon />
              </div>
              <h1 className="ob-title">{steps[3].title}</h1>
              <p className="ob-subtitle">{steps[3].subtitle}</p>
              <button className="ob-btn primary" onClick={handleComplete} disabled={saving}>{saving ? 'Saving...' : 'Go to Dashboard'} <ArrowRight /></button>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default Onboarding;
