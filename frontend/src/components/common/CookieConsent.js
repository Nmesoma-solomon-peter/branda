import React, { useState, useEffect } from 'react';

const CookieConsent = () => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookie-consent');
    if (!consent) {
      const timer = setTimeout(() => setShow(true), 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  const accept = () => {
    localStorage.setItem('cookie-consent', 'accepted');
    setShow(false);
  };

  const decline = () => {
    localStorage.setItem('cookie-consent', 'declined');
    setShow(false);
  };

  if (!show) return null;

  return (
    <>
      <style>{`
        .cc-banner {
          position: fixed; bottom: 0; left: 0; right: 0; z-index: 9999;
          background: var(--white); border-top: 1px solid var(--gray-200);
          padding: 16px 24px; display: flex; align-items: center; justify-content: space-between;
          gap: 16px; box-shadow: 0 -4px 16px rgba(0,0,0,0.08);
        }
        .cc-text { font-size: 13px; color: var(--gray-600); line-height: 1.5; flex: 1; }
        .cc-text a { color: var(--green); text-decoration: none; font-weight: 500; }
        .cc-text a:hover { text-decoration: underline; }
        .cc-btns { display: flex; gap: 8px; flex-shrink: 0; }
        .cc-btn { padding: 8px 18px; border-radius: 6px; font-size: 13px; font-weight: 600; cursor: pointer; border: none; }
        .cc-btn.accept { background: var(--green); color: var(--white); }
        .cc-btn.decline { background: var(--white); border: 1px solid var(--gray-200); color: var(--gray-600); }
        @media (max-width: 640px) {
          .cc-banner { flex-direction: column; text-align: center; }
        }
      `}</style>

      <div className="cc-banner">
        <div className="cc-text">
          We use cookies to improve your experience on Branda. By continuing to use our site, you agree to our use of cookies.{' '}
          <a href="/privacy">Learn more</a>
        </div>
        <div className="cc-btns">
          <button className="cc-btn decline" onClick={decline}>Decline</button>
          <button className="cc-btn accept" onClick={accept}>Accept</button>
        </div>
      </div>
    </>
  );
};

export default CookieConsent;
