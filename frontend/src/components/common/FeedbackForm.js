import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';

const MessageIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
    <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
  </svg>
);

const CloseIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);

const FeedbackForm = () => {
  useAuth();
  const [open, setOpen] = useState(false);
  const [type, setType] = useState('general');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async () => {
    if (!message.trim()) return;
    setSending(true);
    try {
      await api.post('/announcements/feedback', {
        type,
        message: message.trim(),
        page: window.location.pathname
      });
      setSubmitted(true);
      setTimeout(() => { setOpen(false); setSubmitted(false); setMessage(''); setType('general'); }, 2000);
    } catch {} finally { setSending(false); }
  };

  return (
    <>
      <style>{`
        .fb-trigger { position: fixed; bottom: 24px; right: 24px; z-index: 998; width: 48px; height: 48px; border-radius: 50%; background: var(--green); color: var(--white); border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 16px rgba(0,218,150,0.3); transition: transform 0.15s; }
        .fb-trigger:hover { transform: scale(1.08); }
        .fb-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.4); z-index: 2000; display: flex; align-items: flex-end; justify-content: flex-end; padding: 24px; }
        .fb-modal { background: var(--white); border-radius: var(--radius); width: 100%; max-width: 400px; box-shadow: 0 8px 32px rgba(0,0,0,0.12); animation: fb-slideUp 0.2s ease; }
        .fb-header { display: flex; align-items: center; justify-content: space-between; padding: 16px 20px; border-bottom: 1px solid var(--gray-200); }
        .fb-header h3 { font-size: 16px; font-weight: 700; margin: 0; }
        .fb-body { padding: 20px; }
        .fb-field { margin-bottom: 14px; }
        .fb-field label { display: block; font-size: 13px; font-weight: 600; color: var(--gray-700); margin-bottom: 6px; }
        .fb-field select, .fb-field textarea { width: 100%; padding: 10px 12px; border: 1px solid var(--gray-200); border-radius: 6px; font-size: 14px; font-family: var(--font-body); outline: none; }
        .fb-field select:focus, .fb-field textarea:focus { border-color: var(--green); }
        .fb-field textarea { min-height: 100px; resize: vertical; }
        .fb-footer { padding: 12px 20px; border-top: 1px solid var(--gray-200); display: flex; justify-content: flex-end; gap: 8px; }
        .fb-btn { padding: 8px 18px; border-radius: 6px; font-size: 13px; font-weight: 600; cursor: pointer; border: none; }
        .fb-btn.primary { background: var(--green); color: var(--white); }
        .fb-btn.primary:disabled { background: var(--gray-300); cursor: not-allowed; }
        .fb-btn.secondary { background: var(--white); border: 1px solid var(--gray-200); color: var(--gray-600); }
        .fb-success { text-align: center; padding: 32px 20px; }
        .fb-success h4 { font-size: 16px; margin: 0 0 4px; }
        .fb-success p { font-size: 13px; color: var(--gray-500); margin: 0; }
        @keyframes fb-slideUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>

      <button className="fb-trigger" onClick={() => setOpen(true)} title="Send Feedback">
        <MessageIcon />
      </button>

      {open && (
        <div className="fb-overlay" onClick={() => setOpen(false)}>
          <div className="fb-modal" onClick={e => e.stopPropagation()}>
            {submitted ? (
              <div className="fb-success">
                <h4>Thank You</h4>
                <p>Your feedback has been submitted.</p>
              </div>
            ) : (
              <>
                <div className="fb-header">
                  <h3>Send Feedback</h3>
                  <button onClick={() => setOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--gray-400)' }}><CloseIcon /></button>
                </div>
                <div className="fb-body">
                  <div className="fb-field">
                    <label>Type</label>
                    <select value={type} onChange={e => setType(e.target.value)}>
                      <option value="general">General Feedback</option>
                      <option value="bug">Report a Bug</option>
                      <option value="feature">Feature Request</option>
                    </select>
                  </div>
                  <div className="fb-field">
                    <label>Message</label>
                    <textarea value={message} onChange={e => setMessage(e.target.value)} placeholder="Tell us what you think or what went wrong..." maxLength={1000} />
                  </div>
                </div>
                <div className="fb-footer">
                  <button className="fb-btn secondary" onClick={() => setOpen(false)}>Cancel</button>
                  <button className="fb-btn primary" onClick={handleSubmit} disabled={sending || !message.trim()}>{sending ? 'Sending...' : 'Submit'}</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default FeedbackForm;
