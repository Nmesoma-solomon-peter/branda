import React, { useState, useEffect } from 'react';
import api from '../../api/axios';

const AdminFlagged = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => api.get('/admin/flagged-content').then(res => setReports(res.data.reports || [])).catch(() => {}).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const handleAction = async (id, status) => {
    try { await api.put(`/admin/flagged-content/${id}`, { status }); load(); } catch {}
  };

  if (loading) return <div style={{ padding: '40px', textAlign: 'center', color: '#888' }}>Loading...</div>;

  return (
    <div>
      {reports.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 40, color: '#888' }}>No flagged content</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {reports.map(r => (
            <div key={r._id} style={{ background: 'var(--white)', border: '1px solid var(--gray-200)', borderRadius: 'var(--radius)', padding: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>Review by {r.review?.reviewer?.name || 'Unknown'}</div>
                  <div style={{ fontSize: 12, color: '#888' }}>Specialist: {r.review?.specialist?.name || 'Unknown'} &bull; Rating: {r.review?.rating}/5</div>
                </div>
                <span style={{ padding: '3px 8px', borderRadius: 4, fontSize: 10, fontWeight: 700, textTransform: 'uppercase', background: r.status === 'reviewed' ? '#DBEAFE' : r.status === 'dismissed' ? '#F3F4F6' : '#FEF3C7', color: r.status === 'reviewed' ? '#1E40AF' : r.status === 'dismissed' ? '#6B7280' : '#92400E' }}>{r.status}</span>
              </div>
              <div style={{ fontSize: 13, color: '#555', marginBottom: 8, fontStyle: 'italic' }}>"{r.review?.comment}"</div>
              <div style={{ fontSize: 12, color: '#888', marginBottom: 12 }}>Reason: {r.reason}</div>
              <div style={{ fontSize: 11, color: '#aaa', marginBottom: 12 }}>Reported by: {r.reportedBy?.name || 'Unknown'} &bull; {new Date(r.createdAt).toLocaleDateString()}</div>
              {r.status === 'pending' && (
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => handleAction(r._id, 'reviewed')} style={{ padding: '6px 14px', border: '1px solid #DBEAFE', borderRadius: 4, background: '#EFF6FF', color: '#1E40AF', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>Mark Reviewed</button>
                  <button onClick={() => handleAction(r._id, 'dismissed')} style={{ padding: '6px 14px', border: '1px solid var(--gray-200)', borderRadius: 4, background: 'var(--white)', color: '#666', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>Dismiss</button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminFlagged;
