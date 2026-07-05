import React, { useState } from 'react';

const SendIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
    <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
  </svg>
);

const Contact = () => {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSending(true);
    setTimeout(() => {
      setSubmitted(true);
      setSending(false);
    }, 1000);
  };

  return (
    <>
      <style>{`
        .contact-hero { text-align: center; padding: 120px 32px 48px; background: var(--green-light); }
        .contact-hero h1 { font-family: var(--font-heading); font-size: 36px; font-weight: 700; margin: 0 0 12px; }
        .contact-hero p { color: var(--gray-500); font-size: 16px; margin: 0; }
        .contact-body { max-width: 560px; margin: 0 auto; padding: 40px 32px 80px; }
        .contact-form { display: flex; flex-direction: column; gap: 16px; }
        .contact-field { display: flex; flex-direction: column; gap: 6px; }
        .contact-field label { font-size: 13px; font-weight: 600; color: var(--gray-700); }
        .contact-field input, .contact-field textarea { padding: 12px 14px; border: 1px solid var(--gray-200); border-radius: 8px; font-size: 14px; font-family: var(--font-body); outline: none; }
        .contact-field input:focus, .contact-field textarea:focus { border-color: var(--green); }
        .contact-field textarea { min-height: 120px; resize: vertical; }
        .contact-submit { padding: 14px; background: var(--green); color: var(--white); border: none; border-radius: 8px; font-weight: 600; font-size: 15px; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; }
        .contact-submit:disabled { background: var(--gray-300); cursor: not-allowed; }
        .contact-success { text-align: center; padding: 48px 0; }
        .contact-success h2 { font-family: var(--font-heading); font-size: 22px; margin: 0 0 8px; }
        .contact-success p { color: var(--gray-500); font-size: 14px; }
        .contact-info { display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 20px; margin-top: 40px; padding-top: 32px; border-top: 1px solid var(--gray-200); }
        .contact-info-item { text-align: center; }
        .contact-info-label { font-size: 12px; color: var(--gray-400); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px; }
        .contact-info-value { font-size: 14px; color: var(--gray-700); font-weight: 500; }
        .contact-info-value a { color: var(--green); text-decoration: none; }
        .contact-info-value a:hover { text-decoration: underline; }
      `}</style>

      <div className="contact-hero">
        <h1>Contact Us</h1>
        <p>Have a question or need help? We would love to hear from you.</p>
      </div>

      <div className="contact-body">
        {submitted ? (
          <div className="contact-success">
            <h2>Message Sent</h2>
            <p>Thank you for reaching out. We will get back to you within 24 hours.</p>
          </div>
        ) : (
          <form className="contact-form" onSubmit={handleSubmit}>
            <div className="contact-field">
              <label>Your Name</label>
              <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required placeholder="John Doe" />
            </div>
            <div className="contact-field">
              <label>Email Address</label>
              <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required placeholder="john@example.com" />
            </div>
            <div className="contact-field">
              <label>Subject</label>
              <input value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} required placeholder="How can we help?" />
            </div>
            <div className="contact-field">
              <label>Message</label>
              <textarea value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} required placeholder="Tell us more..." />
            </div>
            <button type="submit" className="contact-submit" disabled={sending}>
              {sending ? 'Sending...' : <><SendIcon /> Send Message</>}
            </button>
          </form>
        )}

        <div className="contact-info">
          <div className="contact-info-item">
            <div className="contact-info-label">Email</div>
            <div className="contact-info-value"><a href="mailto:support@branda.com">support@branda.com</a></div>
          </div>
          <div className="contact-info-item">
            <div className="contact-info-label">Location</div>
            <div className="contact-info-value">Aba, Nigeria</div>
          </div>
          <div className="contact-info-item">
            <div className="contact-info-label">Response Time</div>
            <div className="contact-info-value">Within 24 hours</div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Contact;
