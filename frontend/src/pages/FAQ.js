import React, { useState, useEffect } from 'react';
import api from '../api/axios';

const ChevronIcon = ({ open }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18" style={{ transform: open ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s' }}>
    <polyline points="6 9 12 15 18 9"/>
  </svg>
);

const FAQ = () => {
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openIndex, setOpenIndex] = useState(null);

  useEffect(() => {
    api.get('/search/faqs').then(res => setFaqs(res.data.faqs)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ padding: '100px 32px', textAlign: 'center', color: 'var(--gray-400)' }}>Loading...</div>;

  return (
    <>
      <style>{`
        .faq-hero { text-align: center; padding: 120px 32px 48px; background: var(--green-light); }
        .faq-hero h1 { font-family: var(--font-heading); font-size: 36px; font-weight: 700; margin: 0 0 12px; }
        .faq-hero p { color: var(--gray-500); font-size: 16px; margin: 0; }
        .faq-content { max-width: 720px; margin: 0 auto; padding: 40px 32px 80px; }
        .faq-item { border: 1px solid var(--gray-200); border-radius: 8px; margin-bottom: 12px; overflow: hidden; }
        .faq-item-header { display: flex; justify-content: space-between; align-items: center; padding: 16px 20px; cursor: pointer; background: var(--white); }
        .faq-item-header:hover { background: var(--gray-50); }
        .faq-item-q { font-size: 15px; font-weight: 600; color: var(--gray-800); flex: 1; margin-right: 12px; }
        .faq-item-a { padding: 0 20px 16px; font-size: 14px; color: var(--gray-500); line-height: 1.7; }
        .faq-empty { text-align: center; padding: 60px; color: var(--gray-400); }
        .faq-contact { text-align: center; margin-top: 40px; padding: 32px; background: var(--gray-50); border-radius: 8px; }
        .faq-contact h3 { font-size: 18px; margin: 0 0 8px; }
        .faq-contact p { font-size: 14px; color: var(--gray-500); margin: 0 0 16px; }
        .faq-contact a { color: var(--green); font-weight: 600; text-decoration: none; }
        .faq-contact a:hover { text-decoration: underline; }
      `}</style>

      <div className="faq-hero">
        <h1>Frequently Asked Questions</h1>
        <p>Find answers to common questions about Branda</p>
      </div>

      <div className="faq-content">
        {faqs.length === 0 ? (
          <div className="faq-empty">No FAQs available yet. Check back soon!</div>
        ) : faqs.map((faq, i) => (
          <div key={faq._id} className="faq-item">
            <div className="faq-item-header" onClick={() => setOpenIndex(openIndex === i ? null : i)}>
              <span className="faq-item-q">{faq.question}</span>
              <ChevronIcon open={openIndex === i} />
            </div>
            {openIndex === i && <div className="faq-item-a">{faq.answer}</div>}
          </div>
        ))}

        <div className="faq-contact">
          <h3>Still have questions?</h3>
          <p>We are here to help. Reach out to our support team.</p>
          <a href="mailto:support@branda-five.vercel.app">Contact Support</a>
        </div>
      </div>
    </>
  );
};

export default FAQ;
