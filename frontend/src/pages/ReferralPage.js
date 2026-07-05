import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

const CopyIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
  </svg>
);

const ShareIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
    <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
  </svg>
);

const ReferralPage = () => {
  useAuth();
  const [referralCode, setReferralCode] = useState('');
  const [referralCount] = useState(0);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/auth/me').then(res => {
      const code = res.data.user.referralCode;
      if (code) {
        setReferralCode(code);
      } else {
        api.post('/profile/generate-referral').then(r => {
          setReferralCode(r.data.referralCode);
        }).catch(() => {});
      }
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const referralLink = `${window.location.origin}/register?ref=${referralCode}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(referralLink).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleShare = (platform) => {
    const text = `Join Branda — the platform connecting businesses with talented brand designers. Use my referral code: ${referralCode}`;
    const url = referralLink;
    const encodedText = encodeURIComponent(text);
    const encodedUrl = encodeURIComponent(url);

    const links = {
      whatsapp: `https://wa.me/?text=${encodedText}%20${encodedUrl}`,
      twitter: `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      email: `mailto:?subject=${encodeURIComponent('Join Branda')}&body=${encodedText}%0A%0A${encodedUrl}`
    };

    window.open(links[platform], '_blank', 'noopener,noreferrer');
  };

  if (loading) return <div style={{ padding: '100px 32px', textAlign: 'center', color: 'var(--gray-400)' }}>Loading...</div>;

  return (
    <>
      <style>{`
        .ref-container { max-width: 560px; margin: 100px auto 60px; padding: 0 32px; }
        .ref-card { background: var(--white); border: 1px solid var(--gray-200); border-radius: var(--radius); padding: 40px 32px; text-align: center; }
        .ref-icon { width: 64px; height: 64px; border-radius: 50%; background: var(--green-light); display: flex; align-items: center; justify-content: center; margin: 0 auto 20px; color: var(--green); }
        .ref-title { font-family: var(--font-heading); font-size: 24px; font-weight: 700; margin: 0 0 8px; }
        .ref-desc { font-size: 14px; color: var(--gray-500); line-height: 1.6; margin-bottom: 28px; }
        .ref-link-box { display: flex; gap: 8px; margin-bottom: 24px; }
        .ref-link-input { flex: 1; padding: 12px 14px; border: 1px solid var(--gray-200); border-radius: 8px; font-size: 13px; font-family: monospace; color: var(--gray-700); background: var(--gray-50); outline: none; }
        .ref-copy-btn { padding: 12px 18px; border: none; border-radius: 8px; background: var(--green); color: var(--white); font-weight: 600; font-size: 13px; cursor: pointer; display: flex; align-items: center; gap: 6px; white-space: nowrap; }
        .ref-copy-btn.copied { background: #16A34A; }
        .ref-divider { display: flex; align-items: center; gap: 12px; margin: 24px 0; color: var(--gray-400); font-size: 13px; }
        .ref-divider::before, .ref-divider::after { content: ''; flex: 1; height: 1px; background: var(--gray-200); }
        .ref-share-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; }
        .ref-share-btn { padding: 12px 8px; border: 1px solid var(--gray-200); border-radius: 8px; background: var(--white); cursor: pointer; display: flex; flex-direction: column; align-items: center; gap: 6px; font-size: 11px; color: var(--gray-600); font-weight: 500; transition: all 0.12s; }
        .ref-share-btn:hover { border-color: var(--green); color: var(--green); background: #F0FDF4; }
        .ref-stats { display: flex; justify-content: center; gap: 32px; margin-top: 28px; padding-top: 24px; border-top: 1px solid var(--gray-200); }
        .ref-stat-val { font-size: 24px; font-weight: 700; color: var(--gray-800); }
        .ref-stat-label { font-size: 12px; color: var(--gray-400); }
        .ref-code-display { font-size: 28px; font-weight: 700; font-family: monospace; color: var(--green); letter-spacing: 4px; margin-bottom: 8px; }
      `}</style>

      <div className="ref-container">
        <div className="ref-card">
          <div className="ref-icon">
            <ShareIcon />
          </div>
          <h1 className="ref-title">Refer & Earn</h1>
          <p className="ref-desc">Share Branda with friends and businesses. When they sign up, you both help grow the community.</p>

          <div className="ref-code-display">{referralCode || '------'}</div>
          <p style={{ fontSize: 12, color: 'var(--gray-400)', marginBottom: 20 }}>Your unique referral code</p>

          <div className="ref-link-box">
            <input className="ref-link-input" value={referralLink} readOnly />
            <button className={`ref-copy-btn ${copied ? 'copied' : ''}`} onClick={handleCopy}>
              <CopyIcon /> {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>

          <div className="ref-divider">Share via</div>

          <div className="ref-share-grid">
            <button className="ref-share-btn" onClick={() => handleShare('whatsapp')}>
              <svg viewBox="0 0 24 24" width="20" height="20" fill="#25D366"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
              WhatsApp
            </button>
            <button className="ref-share-btn" onClick={() => handleShare('twitter')}>
              <svg viewBox="0 0 24 24" width="20" height="20" fill="#1DA1F2"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/></svg>
              Twitter
            </button>
            <button className="ref-share-btn" onClick={() => handleShare('facebook')}>
              <svg viewBox="0 0 24 24" width="20" height="20" fill="#1877F2"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
              Facebook
            </button>
            <button className="ref-share-btn" onClick={() => handleShare('email')}>
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
              Email
            </button>
          </div>

          <div className="ref-stats">
            <div>
              <div className="ref-stat-val">{referralCount}</div>
              <div className="ref-stat-label">Referrals</div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ReferralPage;
