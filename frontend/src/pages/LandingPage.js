import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';

const useReveal = (threshold = 0.15) => {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setVisible(true); observer.disconnect(); }
    }, { threshold });
    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);
  return [ref, visible];
};

const useCountUp = (target, duration = 1500, from = 0) => {
  const [count, setCount] = useState(from);
  const [started, setStarted] = useState(false);
  const trigger = () => setStarted(true);
  useEffect(() => {
    if (!started) return;
    let startTime = null;
    const step = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      setCount(Math.floor(progress * (target - from) + from));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [started, target, duration, from]);
  return [count, trigger];
};

const SuccessIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const NotificationItem = ({ notification, onRemove }) => {
  const [exiting, setExiting] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => { setExiting(true); setTimeout(() => onRemove(notification.id), 300); }, 4000);
    return () => clearTimeout(timer);
  }, [notification.id, onRemove]);
  return (
    <div className={`notification ${notification.type} ${exiting ? 'exiting' : ''}`}>
      <div className="notification-icon"><SuccessIcon /></div>
      <div className="notification-content">
        <div className="notification-title">{notification.title}</div>
        <div className="notification-message">{notification.message}</div>
      </div>
    </div>
  );
};

const LandingPage = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [visitors, setVisitors] = useState(0);
  const [loading, setLoading] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const fetched = useRef(false);

  const [howRef, howVisible] = useReveal();
  const [problemsRef, problemsVisible] = useReveal();
  const [solutionsRef, solutionsVisible] = useReveal();
  const [featuresRef, featuresVisible] = useReveal();
  const [industriesRef, industriesVisible] = useReveal();
  const [ctaRef, ctaVisible] = useReveal();

  const [visitorCount, visitorStart] = useCountUp(visitors || 500, 1200);

  const addNotification = useCallback((type, title, message) => {
    const id = Date.now() + Math.random();
    setNotifications(prev => [...prev, { id, type, title, message }]);
  }, []);

  const removeNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  useEffect(() => {
    if (fetched.current) return;
    fetched.current = true;
    api.post('/visitors').then(res => setVisitors(res.data.count)).catch(() => {});
    api.get('/visitors').then(res => setVisitors(res.data.count)).catch(() => {});
    api.get('/testimonials').then(res => setTestimonials(res.data.testimonials || [])).catch(() => {});
    const timer = setTimeout(() => visitorStart(), 800);
    return () => clearTimeout(timer);
  }, [visitorStart]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      addNotification('error', 'Invalid email', 'Please enter a valid email address.');
      return;
    }
    setLoading(true);
    try {
      await api.post('/subscribe', { email });
      setSubmitted(true);
      setEmail('');
      addNotification('success', 'You are on the list', 'We will notify you when Branda launches.');
    } catch {
      addNotification('error', 'Subscription failed', 'Something went wrong. Please try again later.');
    } finally { setLoading(false); }
  };

  const [statsRef, statsVisible] = useReveal();

  return (
    <div className="lp">
      <div className="notification-container">
        {notifications.map(n => <NotificationItem key={n.id} notification={n} onRemove={removeNotification} />)}
      </div>

      {/* ── HERO ── */}
      <section className="lp-hero">
        <div className="lp-hero-inner">
          <div className="lp-hero-badge">
            <span className="lp-hero-badge-dot" />
            Now serving Aba, Nigeria
          </div>
          <h1 className="lp-hero-title">
            Branding Made<br />
            <span className="lp-hero-highlight">Simple</span> for<br />
            Small Businesses
          </h1>
          <p className="lp-hero-desc">
            Connect with trusted brand designers who create logos, brand guides,
            and design assets at prices small businesses can afford.
          </p>
          <div className="lp-hero-actions">
            <Link to="/register" className="lp-btn lp-btn-primary">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18"><path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4-4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/></svg>
              Get Started Free
            </Link>
            <a href="#how-it-works" className="lp-btn lp-btn-outline">
              See How It Works
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
            </a>
          </div>
          <div className="lp-hero-proof">
            <div className="lp-hero-avatars">
              {[0,1,2,3].map(i => (
                <div key={i} className="lp-hero-avatar" style={{ background: i % 2 === 0 ? 'var(--green)' : 'var(--black)', zIndex: 4-i }}>
                  {String.fromCharCode(65 + i)}
                </div>
              ))}
            </div>
            <p className="lp-hero-proof-text">
              <strong>{visitorCount.toLocaleString()}+</strong> business owners already interested
            </p>
          </div>
        </div>
        <div className="lp-hero-visual">
          <div className="lp-hero-card lp-hero-card-1">
            <div className="lp-hero-card-icon" style={{ background: 'var(--green)' }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="var(--white)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="24" height="24"><path d="M12 19l7-7 3 3-7 7-3-3z"/><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/><path d="M2 2l7.586 7.586"/><circle cx="11" cy="11" r="2"/></svg>
            </div>
            <div>
              <p className="lp-hero-card-label">Logo Design</p>
              <p className="lp-hero-card-sub">Professional logos for your business</p>
            </div>
          </div>
          <div className="lp-hero-card lp-hero-card-2">
            <div className="lp-hero-card-icon" style={{ background: 'var(--black)' }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="var(--white)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="24" height="24"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
            </div>
            <div>
              <p className="lp-hero-card-label">Brand Assets</p>
              <p className="lp-hero-card-sub">Complete brand identity packages</p>
            </div>
          </div>
          <div className="lp-hero-card lp-hero-card-3">
            <div className="lp-hero-card-icon" style={{ background: '#3B82F6' }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="var(--white)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="24" height="24"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
            </div>
            <div>
              <p className="lp-hero-card-label">Brand Guide</p>
              <p className="lp-hero-card-sub">Rules for consistent branding</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS BANNER ── */}
      <section className="lp-stats-banner" ref={statsRef}>
        <div className="lp-container">
          <div className={`lp-stats-grid lp-stagger ${statsVisible ? 'visible' : ''}`}>
            <div className="lp-stat">
              <span className="lp-stat-number">85%</span>
              <span className="lp-stat-label">of SMEs in Aba lack professional branding</span>
            </div>
            <div className="lp-stat-divider" />
            <div className="lp-stat">
              <span className="lp-stat-number">3</span>
              <span className="lp-stat-label">simple steps to your brand identity</span>
            </div>
            <div className="lp-stat-divider" />
            <div className="lp-stat">
              <span className="lp-stat-number">100%</span>
              <span className="lp-stat-label">quality guaranteed with dispute resolution</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="lp-section lp-how" id="how-it-works" ref={howRef}>
        <div className="lp-container">
          <div className={`lp-section-header lp-reveal ${howVisible ? 'visible' : ''}`}>
            <span className="lp-tag">How It Works</span>
            <h2 className="lp-section-title">Three Steps to Your Brand</h2>
            <p className="lp-section-desc">Getting a professional brand identity has never been easier.</p>
          </div>
          <div className={`lp-steps lp-stagger ${howVisible ? 'visible' : ''}`}>
            {[
              { num: '01', title: 'Post Your Project', desc: 'Tell us about your business, what you need, and your budget. It takes less than 2 minutes.', icon: 'M12 20h9M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z' },
              { num: '02', title: 'Get Matched', desc: 'Our team matches you with a vetted brand specialist who understands your industry.', icon: 'M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4-4v2M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75' },
              { num: '03', title: 'Receive Your Brand', desc: 'Get your logo, brand guide, and all design files delivered to your dashboard.', icon: 'M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3' }
            ].map((step, i) => (
              <div key={i} className="lp-step">
                <div className="lp-step-num">{step.num}</div>
                <div className="lp-step-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="28" height="28"><path d={step.icon} /></svg>
                </div>
                <h3 className="lp-step-title">{step.title}</h3>
                <p className="lp-step-desc">{step.desc}</p>
                {i < 2 && <div className="lp-step-arrow">
                  <svg viewBox="0 0 24 24" fill="none" stroke="var(--gray-300)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="20" height="20"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                </div>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PROBLEMS ── */}
      <section className="lp-section lp-problems" ref={problemsRef}>
        <div className="lp-container">
          <div className={`lp-section-header lp-reveal ${problemsVisible ? 'visible' : ''}`}>
            <span className="lp-tag">The Problem</span>
            <h2 className="lp-section-title">Why SMEs Struggle with Branding</h2>
            <p className="lp-section-desc">Getting a professional brand identity should not be this hard for small businesses.</p>
          </div>
          <div className={`lp-problems-grid lp-stagger ${problemsVisible ? 'visible' : ''}`}>
            {[
              { title: 'Too Expensive', desc: 'Professional design agencies charge high fees that small businesses simply cannot afford.', icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
              { title: 'Fragmented Market', desc: 'Business owners hunt for designers on WhatsApp and Facebook. No central platform exists.', icon: 'M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z' },
              { title: 'No Quality Guarantee', desc: 'No system ensures designers deliver quality work. If something goes wrong, there is no recourse.', icon: 'M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z' }
            ].map((p, i) => (
              <div key={i} className="lp-problem-card">
                <div className="lp-problem-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="24" height="24"><path d={p.icon} /></svg>
                </div>
                <h3 className="lp-problem-title">{p.title}</h3>
                <p className="lp-problem-desc">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SOLUTION / FOR BOTH SIDES ── */}
      <section className="lp-section lp-solutions" ref={solutionsRef}>
        <div className="lp-container">
          <div className={`lp-section-header lp-reveal ${solutionsVisible ? 'visible' : ''}`}>
            <span className="lp-tag">The Solution</span>
            <h2 className="lp-section-title">Built for Both Sides</h2>
            <p className="lp-section-desc">Branda connects business owners with talented designers — everyone wins.</p>
          </div>
          <div className={`lp-solutions-grid`}>
            <div className={`lp-solution-card lp-reveal-left ${solutionsVisible ? 'visible' : ''}`}>
              <div className="lp-solution-badge">For Business Owners</div>
              <h3 className="lp-solution-title">Get Your Brand Done</h3>
              <p className="lp-solution-desc">Post your project, get matched with a vetted designer, and receive professional brand assets.</p>
              <ul className="lp-solution-list">
                {['Find trusted designers easily', 'Affordable, transparent pricing', 'Central place for all brand files', 'Quality guarantee & dispute resolution'].map((item, i) => (
                  <li key={i}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="16" height="16"><polyline points="20 6 9 17 4 12"/></svg>
                    {item}
                  </li>
                ))}
              </ul>
              <Link to="/register" className="lp-btn lp-btn-primary lp-btn-sm">Join as Business Owner</Link>
            </div>
            <div className={`lp-solution-card lp-solution-card-dark lp-reveal-right ${solutionsVisible ? 'visible' : ''}`}>
              <div className="lp-solution-badge lp-solution-badge-light">For Designers</div>
              <h3 className="lp-solution-title">Grow Your Design Business</h3>
              <p className="lp-solution-desc">Get matched with paying clients, deliver professional work, and build your portfolio.</p>
              <ul className="lp-solution-list">
                {['Find paying clients easily', 'Get paid for your design work', 'Build a portfolio of work', 'Receive clear project requirements'].map((item, i) => (
                  <li key={i}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="16" height="16"><polyline points="20 6 9 17 4 12"/></svg>
                    {item}
                  </li>
                ))}
              </ul>
              <Link to="/register" className="lp-btn lp-btn-green lp-btn-sm">Join as Designer</Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="lp-section lp-features" ref={featuresRef}>
        <div className="lp-container">
          <div className={`lp-section-header lp-reveal ${featuresVisible ? 'visible' : ''}`}>
            <span className="lp-tag">Why Branda</span>
            <h2 className="lp-section-title">Everything You Need</h2>
            <p className="lp-section-desc">A complete platform designed to make branding simple, affordable, and reliable.</p>
          </div>
          <div className={`lp-features-grid lp-stagger ${featuresVisible ? 'visible' : ''}`}>
            {[
              { icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z', title: 'Vetted Designers', desc: 'Every designer is reviewed and approved by our team before joining.' },
              { icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z', title: 'Affordable Pricing', desc: 'Get professional brand assets at prices designed for small businesses.' },
              { icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z', title: 'Managed Matching', desc: 'Our team matches you with the right designer for your industry and needs.' },
              { icon: 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z', title: 'Secure File Storage', desc: 'All your brand files stored safely in one place, accessible anytime.' },
              { icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4', title: 'Project Tracking', desc: 'Track your project from start to finish with real-time status updates.' },
              { icon: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z', title: 'Direct Communication', desc: 'Message your designer directly through the platform. No more WhatsApp threads.' }
            ].map((f, i) => (
              <div key={i} className="lp-feature-card">
                <div className="lp-feature-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="24" height="24"><path d={f.icon} /></svg>
                </div>
                <h4 className="lp-feature-title">{f.title}</h4>
                <p className="lp-feature-desc">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── INDUSTRIES ── */}
      <section className="lp-section lp-industries" ref={industriesRef}>
        <div className="lp-container">
          <div className={`lp-section-header lp-reveal ${industriesVisible ? 'visible' : ''}`}>
            <span className="lp-tag">Industries</span>
            <h2 className="lp-section-title">Built for Every Business in Aba</h2>
            <p className="lp-section-desc">Whether you sell shoes or run a tech startup, Branda has you covered.</p>
          </div>
          <div className={`lp-industries-grid lp-stagger ${industriesVisible ? 'visible' : ''}`}>
            {[
              { name: 'Fashion & Clothing', icon: 'M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5' },
              { name: 'Food & Restaurant', icon: 'M18 8h1a4 4 0 010 8h-1M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8z' },
              { name: 'Technology', icon: 'M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' },
              { name: 'Retail & Shops', icon: 'M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z' },
              { name: 'Manufacturing', icon: 'M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z' },
              { name: 'Creative & Media', icon: 'M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z' }
            ].map((ind, i) => (
              <div key={i} className="lp-industry-card">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="28" height="28"><path d={ind.icon} /></svg>
                <span>{ind.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      {testimonials.length > 0 && (
        <section className="lp-section" style={{ background: 'var(--gray-50)' }}>
          <div className="lp-container">
            <h2 className="lp-section-title">What People Say</h2>
            <p className="lp-section-subtitle">Trusted by businesses and designers in Aba</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20, marginTop: 32 }}>
              {testimonials.map(t => (
                <div key={t._id} style={{ background: 'var(--white)', border: '1px solid var(--gray-200)', borderRadius: 'var(--radius)', padding: 24 }}>
                  <div style={{ display: 'flex', gap: '2px', marginBottom: 12, color: '#F59E0B' }}>
                    {[1,2,3,4,5].map(i => (
                      <svg key={i} viewBox="0 0 24 24" fill="currentColor" width="14" height="14"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                    ))}
                  </div>
                  <p style={{ fontSize: 14, color: 'var(--gray-600)', lineHeight: 1.7, marginBottom: 16 }}>"{t.text}"</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--green)', color: 'var(--white)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700 }}>
                      {t.name?.charAt(0) || '?'}
                    </div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--gray-800)' }}>{t.name}</div>
                      <div style={{ fontSize: 12, color: 'var(--gray-400)' }}>{t.role}{t.company ? `, ${t.company}` : ''}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── CTA ── */}
      <section className="lp-section lp-cta" ref={ctaRef}>
        <div className="lp-container">
          <div className={`lp-cta-inner lp-reveal-scale ${ctaVisible ? 'visible' : ''}`}>
            <h2 className="lp-cta-title">Ready to Build Your Brand?</h2>
            <p className="lp-cta-desc">Join hundreds of business owners and designers in Aba. Get started today — it is free.</p>
            {submitted ? (
              <div className="lp-cta-success">
                <svg viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="20" height="20"><polyline points="20 6 9 17 4 12"/></svg>
                <span>You are on the list! We will notify you when we launch.</span>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="lp-cta-form">
                <input type="email" className="lp-cta-input" value={email} onChange={e => setEmail(e.target.value)} placeholder="Enter your email address" required disabled={loading} />
                <button type="submit" className="lp-btn lp-btn-primary" disabled={loading}>
                  {loading ? 'Processing...' : 'Notify Me'}
                </button>
              </form>
            )}
            <div className="lp-cta-links">
              <Link to="/register">Create Account</Link>
              <span className="lp-cta-dot" />
              <Link to="/login">Sign In</Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="lp-footer">
        <div className="lp-container">
          <div className="lp-footer-top">
            <div className="lp-footer-brand">
              <img src="/logo/logo.png" alt="Branda" width="32" height="32" style={{ borderRadius: 4 }} />
              <span className="lp-footer-logo-text">Branda</span>
            </div>
            <div className="lp-footer-links">
              <a href="#how-it-works">How It Works</a>
              <a href="#problems">For Business Owners</a>
              <a href="#solutions">For Designers</a>
              <Link to="/blog">Blog</Link>
              <Link to="/faq">FAQ</Link>
              <Link to="/contact">Contact</Link>
            </div>
          </div>
          <div className="lp-footer-bottom">
            <p>&copy; 2026 Branda. Branding made simple for small businesses.</p>
            <div style={{ display: 'flex', gap: 16, marginTop: 8 }}>
              <Link to="/terms" style={{ fontSize: 12, color: 'var(--gray-400)', textDecoration: 'none' }}>Terms of Service</Link>
              <Link to="/privacy" style={{ fontSize: 12, color: 'var(--gray-400)', textDecoration: 'none' }}>Privacy Policy</Link>
            </div>
            <p className="lp-footer-location">Serving Aba, Abia State, Nigeria</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
