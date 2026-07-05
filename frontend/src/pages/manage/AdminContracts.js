import React, { useState, useEffect } from 'react';
import api from '../../api/axios';

const AdminContracts = () => {
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => api.get('/contracts').then(res => setContracts(res.data.contracts || [])).catch(() => {}).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const handleStatus = async (id, status) => {
    try { await api.put(`/contracts/${id}`, { status }); load(); } catch {}
  };

  if (loading) return <div style={{ padding: 40, textAlign: 'center', color: '#888' }}>Loading...</div>;

  const statusColor = { draft: '#6B7280', pending: '#D97706', signed: '#16A34A', terminated: '#DC2626' };

  return (
    <div>
      <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>Contracts</h3>
      {contracts.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 40, color: '#888', background: 'var(--white)', borderRadius: 'var(--radius)', border: '1px solid var(--gray-200)' }}>No contracts yet</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {contracts.map(c => (
            <div key={c._id} style={{ background: 'var(--white)', border: '1px solid var(--gray-200)', borderRadius: 'var(--radius)', padding: 16, display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 600 }}>{c.project?.title || 'Untitled'}</div>
                <div style={{ fontSize: 12, color: '#888', marginTop: 4 }}>Amount: ₦{c.amount?.toLocaleString()} &bull; Scope: {c.scope?.substring(0, 80)}...</div>
                <div style={{ fontSize: 11, color: '#aaa', marginTop: 4 }}>Signed by: {c.signedBy?.length || 0}/2</div>
              </div>
              <span style={{ padding: '3px 8px', borderRadius: 4, fontSize: 10, fontWeight: 700, textTransform: 'uppercase', background: (statusColor[c.status] || '#6B7280') + '15', color: statusColor[c.status] || '#6B7280' }}>{c.status}</span>
              {c.status === 'terminated' ? null : (
                <button onClick={() => handleStatus(c._id, 'terminated')} style={{ padding: '4px 10px', border: '1px solid #FECACA', borderRadius: 4, background: '#FEF2F2', color: '#991B1B', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>Terminate</button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminContracts;
