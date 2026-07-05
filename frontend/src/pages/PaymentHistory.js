import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 }).format(amount);
};

const statusColors = {
  success: { bg: '#ECFDF5', text: '#059669' },
  pending: { bg: '#FEF3C7', text: '#D97706' },
  failed: { bg: '#FEF2F2', text: '#DC2626' },
  refunded: { bg: '#EEF2FF', text: '#4F46E5' },
};

const styles = {
  page: { maxWidth: 800, margin: '0 auto', padding: '100px 24px 60px', fontFamily: 'var(--font-body)' },
  header: { marginBottom: 32 },
  title: { fontFamily: 'var(--font-heading)', fontSize: 28, fontWeight: 700, marginBottom: 4 },
  subtitle: { fontSize: 14, color: 'var(--gray-500)' },
  statsRow: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 32 },
  statCard: { background: 'var(--white)', border: '1px solid var(--gray-200)', borderRadius: 'var(--radius)', padding: '20px 16px', textAlign: 'center' },
  statNumber: { fontFamily: 'var(--font-heading)', fontSize: 24, fontWeight: 700, color: 'var(--green)', lineHeight: 1, marginBottom: 4 },
  statLabel: { fontSize: 12, fontWeight: 500, color: 'var(--gray-500)', textTransform: 'uppercase', letterSpacing: 0.5 },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { textAlign: 'left', padding: '12px 16px', borderBottom: '2px solid var(--gray-200)', fontSize: 12, fontWeight: 600, color: 'var(--gray-500)', textTransform: 'uppercase', letterSpacing: 0.5 },
  td: { padding: '14px 16px', borderBottom: '1px solid var(--gray-100)', fontSize: 14 },
  badge: (bg, color) => ({ fontSize: 12, fontWeight: 500, padding: '3px 10px', borderRadius: 100, background: bg, color, textTransform: 'capitalize' }),
  emptyContainer: { textAlign: 'center', padding: '60px 20px' },
  emptyTitle: { fontFamily: 'var(--font-heading)', fontSize: 17, fontWeight: 700, marginBottom: 6 },
  emptyDesc: { fontSize: 14, color: 'var(--gray-400)', lineHeight: 1.6, maxWidth: 320, margin: '0 auto' },
};

const PaymentHistory = () => {
  useAuth();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/payments/my')
      .then(res => setPayments(res.data.payments || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleVerify = async (reference) => {
    try {
      await api.get(`/payments/verify/${reference}`);
      const res = await api.get('/payments/my');
      setPayments(res.data.payments || []);
    } catch {}
  };

  if (loading) return <div style={{ ...styles.page, textAlign: 'center', padding: '100px 32px' }}>Loading...</div>;

  const totalPaid = payments.filter(p => p.status === 'success').reduce((s, p) => s + p.amount, 0);
  const totalPending = payments.filter(p => p.status === 'pending').reduce((s, p) => s + p.amount, 0);

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <h1 style={styles.title}>Payment History</h1>
        <p style={styles.subtitle}>Track all your project payments</p>
      </div>

      <div style={styles.statsRow}>
        <div style={styles.statCard}>
          <div style={styles.statNumber}>{payments.length}</div>
          <div style={styles.statLabel}>Total Transactions</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statNumber}>{formatCurrency(totalPaid)}</div>
          <div style={styles.statLabel}>Total Paid</div>
        </div>
        <div style={styles.statCard}>
          <div style={{ ...styles.statNumber, color: totalPending > 0 ? '#D97706' : 'var(--green)' }}>{formatCurrency(totalPending)}</div>
          <div style={styles.statLabel}>Pending</div>
        </div>
      </div>

      {payments.length === 0 ? (
        <div style={styles.emptyContainer}>
          <div style={{ width: 64, height: 64, background: 'var(--gray-100)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--gray-400)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
              <line x1="1" y1="10" x2="23" y2="10" />
            </svg>
          </div>
          <h3 style={styles.emptyTitle}>No payments yet</h3>
          <p style={styles.emptyDesc}>Payment records for your projects will appear here.</p>
          <Link to="/dashboard" style={{ display: 'inline-block', marginTop: 16, padding: '10px 20px', background: 'var(--green)', color: 'var(--white)', borderRadius: 'var(--radius)', fontSize: 14, fontWeight: 500, textDecoration: 'none' }}>Go to Dashboard</Link>
        </div>
      ) : (
        <div style={{ background: 'var(--white)', border: '1px solid var(--gray-200)', borderRadius: 'var(--radius)', overflow: 'hidden' }}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Project</th>
                <th style={styles.th}>Amount</th>
                <th style={styles.th}>Status</th>
                <th style={styles.th}>Date</th>
                <th style={styles.th}>Action</th>
              </tr>
            </thead>
            <tbody>
              {payments.map(p => {
                const sc = statusColors[p.status] || statusColors.pending;
                return (
                  <tr key={p._id}>
                    <td style={styles.td}>
                      <Link to={`/projects/${p.project?._id}`} style={{ fontWeight: 500, color: 'var(--green)', textDecoration: 'none' }}>
                        {p.project?.title || 'Unknown Project'}
                      </Link>
                    </td>
                    <td style={{ ...styles.td, fontWeight: 600 }}>{formatCurrency(p.amount)}</td>
                    <td style={styles.td}><span style={styles.badge(sc.bg, sc.text)}>{p.status}</span></td>
                    <td style={{ ...styles.td, color: 'var(--gray-500)' }}>{new Date(p.createdAt).toLocaleDateString('en-NG', { year: 'numeric', month: 'short', day: 'numeric' })}</td>
                    <td style={styles.td}>
                      {p.status === 'pending' && (
                        <button onClick={() => handleVerify(p.reference)} style={{ fontSize: 13, color: 'var(--green)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 500 }}>Verify</button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default PaymentHistory;
