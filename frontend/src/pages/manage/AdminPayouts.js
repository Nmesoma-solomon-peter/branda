import React, { useState, useEffect } from 'react';
import api from '../../api/axios';

const AdminPayouts = () => {
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending');

  const load = () => api.get('/withdrawals/all').then(res => setWithdrawals(res.data.withdrawals || [])).catch(() => {}).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const handleAction = async (id, status) => {
    try { await api.put(`/withdrawals/${id}`, { status }); load(); } catch {}
  };

  const filtered = withdrawals.filter(w => filter === 'all' || w.status === filter);

  if (loading) return <div style={{ padding: '40px', textAlign: 'center', color: '#888' }}>Loading...</div>;

  return (
    <div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        {[['pending', 'Pending'], ['processing', 'Processing'], ['completed', 'Completed'], ['rejected', 'Rejected'], ['all', 'All']].map(([f, l]) => (
          <button key={f} onClick={() => setFilter(f)} style={{ padding: '6px 14px', border: '1px solid var(--gray-200)', borderRadius: 6, background: filter === f ? 'var(--green)' : 'var(--white)', color: filter === f ? 'var(--white)' : 'var(--gray-600)', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>{l}</button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 40, color: '#888' }}>No withdrawal requests</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {filtered.map(w => (
            <div key={w._id} style={{ background: 'var(--white)', border: '1px solid var(--gray-200)', borderRadius: 'var(--radius)', padding: 16, display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 600 }}>₦{w.amount.toLocaleString()}</div>
                <div style={{ fontSize: 12, color: '#888' }}>{w.bankName} &bull; {w.accountNumber} &bull; {w.accountName}</div>
                <div style={{ fontSize: 11, color: '#aaa', marginTop: 4 }}>Requested by: {w.user?.name || 'Unknown'} &bull; {new Date(w.createdAt).toLocaleDateString()}</div>
              </div>
              <span style={{ padding: '3px 8px', borderRadius: 4, fontSize: 10, fontWeight: 700, textTransform: 'uppercase', background: w.status === 'completed' ? '#DCFCE7' : w.status === 'pending' ? '#FEF3C7' : w.status === 'processing' ? '#DBEAFE' : '#FEE2E2', color: w.status === 'completed' ? '#166534' : w.status === 'pending' ? '#92400E' : w.status === 'processing' ? '#1E40AF' : '#991B1B' }}>{w.status}</span>
              {w.status === 'pending' && (
                <div style={{ display: 'flex', gap: 6 }}>
                  <button onClick={() => handleAction(w._id, 'processing')} style={{ padding: '6px 12px', border: '1px solid #DBEAFE', borderRadius: 4, background: '#EFF6FF', color: '#1E40AF', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>Process</button>
                  <button onClick={() => handleAction(w._id, 'completed')} style={{ padding: '6px 12px', border: '1px solid #BBF7D0', borderRadius: 4, background: '#F0FDF4', color: '#166534', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>Complete</button>
                  <button onClick={() => handleAction(w._id, 'rejected')} style={{ padding: '6px 12px', border: '1px solid #FECACA', borderRadius: 4, background: '#FEF2F2', color: '#991B1B', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>Reject</button>
                </div>
              )}
              {w.status === 'processing' && (
                <div style={{ display: 'flex', gap: 6 }}>
                  <button onClick={() => handleAction(w._id, 'completed')} style={{ padding: '6px 12px', border: '1px solid #BBF7D0', borderRadius: 4, background: '#F0FDF4', color: '#166534', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>Mark Complete</button>
                  <button onClick={() => handleAction(w._id, 'rejected')} style={{ padding: '6px 12px', border: '1px solid #FECACA', borderRadius: 4, background: '#FEF2F2', color: '#991B1B', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>Reject</button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminPayouts;
