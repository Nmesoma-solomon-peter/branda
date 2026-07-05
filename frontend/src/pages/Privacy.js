import React from 'react';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';

const Privacy = () => (
  <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
    <Navbar />
    <div style={{ flex: 1, padding: '100px 32px 60px' }}>
      <div style={{ maxWidth: 800, margin: '0 auto' }}>
        <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 28, fontWeight: 700, marginBottom: 24 }}>Privacy Policy</h1>
        <div style={{ fontSize: 15, lineHeight: 1.8, color: 'var(--gray-700)' }}>
          <h2 style={{ fontSize: 18, marginTop: 24 }}>1. Information We Collect</h2>
          <p>We collect information you provide directly: name, email, phone, location, profile image, KYC documents, and payment information. We also collect usage data such as pages visited and actions taken on the platform.</p>

          <h2 style={{ fontSize: 18, marginTop: 24 }}>2. How We Use Your Information</h2>
          <p>We use your information to: provide and improve our services, process transactions, send communications, verify identity (KYC), and ensure platform security.</p>

          <h2 style={{ fontSize: 18, marginTop: 24 }}>3. Information Sharing</h2>
          <p>We do not sell your personal information. We share information only: with your explicit consent, to complete transactions, with payment processors, or as required by law.</p>

          <h2 style={{ fontSize: 18, marginTop: 24 }}>4. Data Security</h2>
          <p>We implement industry-standard security measures including encryption, secure authentication, and regular security audits. However, no method of transmission is 100% secure.</p>

          <h2 style={{ fontSize: 18, marginTop: 24 }}>5. Data Retention</h2>
          <p>We retain your data for as long as your account is active. Upon account deletion, we remove your personal data within 30 days, except where retention is required by law.</p>

          <h2 style={{ fontSize: 18, marginTop: 24 }}>6. Your Rights (GDPR)</h2>
          <p>You have the right to: access your data, correct inaccurate data, delete your account, export your data, and object to processing. Contact us at privacy@branda.ng to exercise these rights.</p>

          <h2 style={{ fontSize: 18, marginTop: 24 }}>7. Cookies</h2>
          <p>We use essential cookies for authentication and session management. We do not use tracking cookies or third-party analytics without your consent.</p>

          <h2 style={{ fontSize: 18, marginTop: 24 }}>8. KYC Data</h2>
          <p>Identity verification documents are stored securely and access is restricted to authorized admin personnel. Documents are deleted after verification is complete or within 90 days.</p>

          <h2 style={{ fontSize: 18, marginTop: 24 }}>9. Children's Privacy</h2>
          <p>Branda is not intended for users under 18. We do not knowingly collect data from children.</p>

          <h2 style={{ fontSize: 18, marginTop: 24 }}>10. Contact Us</h2>
          <p>For privacy-related inquiries, contact us at privacy@branda.ng.</p>

          <p style={{ marginTop: 32, color: 'var(--gray-400)', fontSize: 13 }}>Last updated: June 2026</p>
        </div>
      </div>
    </div>
    <Footer />
  </div>
);

export default Privacy;