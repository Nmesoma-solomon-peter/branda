import React, { useState, useEffect } from 'react';
import api from '../../api/axios';

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
  statsRow: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 24 },
  statCard: { background: 'var(--white)', border: '1px solid var(--gray-200)', borderRadius: 'var(--radius)', padding: 20 },
  statLabel: { fontSize: 12, fontWeight: 500, color: 'var(--gray-500)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 },
  statNumber: { fontFamily: 'var(--font-heading)', fontSize: 24, fontWeight: 700, color: 'var(--green)' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { textAlign: 'left', padding: '12px 16px', borderBottom: '2px solid var(--gray-200)', fontSize: 12, fontWeight: 600, color: 'var(--gray-500)', textTransform: 'uppercase' },
  td: { padding: '14px 16px', borderBottom: '1px solid var(--gray-100)', fontSize: 14 },
  badge: (bg, color) => ({ fontSize: 12, fontWeight: 500, padding: '3px 10px', borderRadius: 100, background: bg, color, textTransform: 'capitalize' }),
  card: { background: 'var(--white)', border: '1px solid var(--gray-200)', borderRadius: 'var(--radius)', overflow: 'hidden' },
  empty: { textAlign: 'center', padding: 40, color: 'var(--gray-400)', fontSize: 14 },
};

const AdminPayments = () => {
  const [payments, setPayments] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/admin/payments'),
      api.get('/admin/payments/stats')
    ]).then(([payRes, statsRes]) => {
      setPayments(payRes.data.payments || []);
      setStats(statsRes.data.stats || null);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ padding: 20, color: 'var(--gray-400)' }}>Loading payments...</div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
        <a href="/admin/export/payments" target="_blank" rel="noreferrer" style={{
          padding: '8px 16px', borderRadius: 'var(--radius)', border: '1px solid var(--gray-300)',
          background: 'var(--white)', fontSize: 13, fontWeight: 500, cursor: 'pointer',
          fontFamily: 'var(--font-body)', textDecoration: 'none', color: 'inherit',
          display: 'inline-flex', alignItems: 'center', gap: 6
        }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="14" height="14">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
          Export CSV
        </a>
      </div>
      {stats && (
        <div style={styles.statsRow}>
          <div style={styles.statCard}>
            <div style={styles.statLabel}>Total Revenue</div>
            <div style={styles.statNumber}>{formatCurrency(stats.totalRevenue)}</div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statLabel}>Successful</div>
            <div style={{ ...styles.statNumber, color: '#059669' }}>{stats.successfulPayments}</div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statLabel}>Pending</div>
            <div style={{ ...styles.statNumber, color: '#D97706' }}>{stats.pendingPayments}</div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statLabel}>Total Transactions</div>
            <div style={styles.statNumber}>{stats.totalPayments}</div>
          </div>
        </div>
      )}

      <div style={styles.card}>
        {payments.length === 0 ? (
          <div style={styles.empty}>No payment records yet</div>
        ) : (
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Payer</th>
                <th style={styles.th}>Project</th>
                <th style={styles.th}>Amount</th>
                <th style={styles.th}>Method</th>
                <th style={styles.th}>Status</th>
                <th style={styles.th}>Reference</th>
                <th style={styles.th}>Date</th>
              </tr>
            </thead>
            <tbody>
              {payments.map(p => {
                const sc = statusColors[p.status] || statusColors.pending;
                return (
                  <tr key={p._id}>
                    <td style={styles.td}>
                      <div style={{ fontWeight: 500 }}>{p.payer?.name || 'Unknown'}</div>
                      <div style={{ fontSize: 12, color: 'var(--gray-400)' }}>{p.payer?.email || ''}</div>
                    </td>
                    <td style={styles.td}>{p.project?.title || 'N/A'}</td>
                    <td style={{ ...styles.td, fontWeight: 600 }}>{formatCurrency(p.amount)}</td>
                    <td style={{ ...styles.td, textTransform: 'capitalize' }}>{p.method}</td>
                    <td style={styles.td}><span style={styles.badge(sc.bg, sc.text)}>{p.status}</span></td>
                    <td style={{ ...styles.td, fontSize: 12, color: 'var(--gray-400)', fontFamily: 'monospace' }}>{p.reference || '-'}</td>
                    <td style={{ ...styles.td, color: 'var(--gray-500)' }}>{new Date(p.createdAt).toLocaleDateString('en-NG')}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default AdminPayments;
