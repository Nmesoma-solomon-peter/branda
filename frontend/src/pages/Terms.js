import React from 'react';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';

const Terms = () => (
  <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
    <Navbar />
    <div style={{ flex: 1, padding: '100px 32px 60px' }}>
      <div style={{ maxWidth: 800, margin: '0 auto' }}>
        <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 28, fontWeight: 700, marginBottom: 24 }}>Terms of Service</h1>
        <div style={{ fontSize: 15, lineHeight: 1.8, color: 'var(--gray-700)' }}>
          <h2 style={{ fontSize: 18, marginTop: 24 }}>1. Acceptance of Terms</h2>
          <p>By accessing and using Branda, you agree to be bound by these Terms of Service. If you do not agree, do not use the platform.</p>

          <h2 style={{ fontSize: 18, marginTop: 24 }}>2. Description of Service</h2>
          <p>Branda is a marketplace connecting small and medium enterprises (SMEs) in Aba, Nigeria with brand designers for logos, brand guides, and design assets.</p>

          <h2 style={{ fontSize: 18, marginTop: 24 }}>3. User Accounts</h2>
          <p>You must provide accurate information when creating an account. You are responsible for maintaining the security of your account credentials. You must be at least 18 years old to use Branda.</p>

          <h2 style={{ fontSize: 18, marginTop: 24 }}>4. User Responsibilities</h2>
          <p>SMEs are responsible for providing clear project briefs and timely feedback. Specialists are responsible for delivering quality work within agreed timelines. All users must respect intellectual property rights.</p>

          <h2 style={{ fontSize: 18, marginTop: 24 }}>5. Payments</h2>
          <p>Payments are processed through our integrated payment partners. Branda charges a platform fee on completed transactions. Refunds are handled on a case-by-case basis.</p>

          <h2 style={{ fontSize: 18, marginTop: 24 }}>6. Intellectual Property</h2>
          <p>Ownership of design work is transferred to the SME upon full payment. Specialists retain the right to display completed work in their portfolio unless otherwise agreed.</p>

          <h2 style={{ fontSize: 18, marginTop: 24 }}>7. Prohibited Conduct</h2>
          <p>Users may not: harass others, upload malicious content, attempt to circumvent the platform's payment system, or violate applicable laws.</p>

          <h2 style={{ fontSize: 18, marginTop: 24 }}>8. Limitation of Liability</h2>
          <p>Branda is not liable for disputes between users, loss of data, or indirect damages. Our liability is limited to the amount paid for the service in question.</p>

          <h2 style={{ fontSize: 18, marginTop: 24 }}>9. Termination</h2>
          <p>We may suspend or terminate accounts that violate these terms. Users may delete their accounts at any time from their profile settings.</p>

          <h2 style={{ fontSize: 18, marginTop: 24 }}>10. Changes to Terms</h2>
          <p>We reserve the right to update these terms. Continued use of the platform after changes constitutes acceptance of the new terms.</p>

          <p style={{ marginTop: 32, color: 'var(--gray-400)', fontSize: 13 }}>Last updated: June 2026</p>
        </div>
      </div>
    </div>
    <Footer />
  </div>
);

export default Terms;