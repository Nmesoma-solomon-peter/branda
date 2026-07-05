import React, { useState, useEffect } from 'react';
import api from '../../api/axios';

const AdminTickets = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('open');
  const [selected, setSelected] = useState(null);
  const [reply, setReply] = useState('');

  const load = () => api.get('/tickets/all').then(res => setTickets(res.data.tickets || [])).catch(() => {}).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const handleStatus = async (id, status) => {
    try { await api.put(`/tickets/${id}`, { status }); load(); if (selected?._id === id) { const res = await api.get(`/tickets/${id}`); setSelected(res.data.ticket); } } catch {}
  };

  const handleReply = async () => {
    if (!reply.trim() || !selected) return;
    try { await api.post(`/tickets/${selected._id}/reply`, { message: reply }); setReply(''); load(); const res = await api.get(`/tickets/${selected._id}`); setSelected(res.data.ticket); } catch {}
  };

  const filtered = tickets.filter(t => filter === 'all' || t.status === filter);
  const priorityColor = { low: '#6B7280', medium: '#D97706', high: '#DC2626', urgent: '#9333EA' };

  if (loading) return <div style={{ padding: 40, textAlign: 'center', color: '#888' }}>Loading...</div>;

  return (
    <div>
      <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>Support Tickets</h3>
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        {['open', 'in_progress', 'resolved', 'all'].map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{ padding: '6px 14px', border: '1px solid var(--gray-200)', borderRadius: 6, background: filter === f ? 'var(--green)' : 'var(--white)', color: filter === f ? 'white' : '#666', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>{f === 'all' ? 'All' : f.replace('_', ' ')}</button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 40, color: '#888', background: 'var(--white)', borderRadius: 'var(--radius)', border: '1px solid var(--gray-200)' }}>No tickets</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {filtered.map(t => (
            <div key={t._id} onClick={() => setSelected(t)} style={{ background: 'var(--white)', border: '1px solid var(--gray-200)', borderRadius: 'var(--radius)', padding: 16, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ width: 4, height: 36, borderRadius: 2, background: priorityColor[t.priority] || '#888', flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 600 }}>{t.subject}</div>
                <div style={{ fontSize: 12, color: '#888', marginTop: 2 }}>{t.user?.name || 'User'} &bull; {t.category} &bull; {t.replies?.length || 0} replies</div>
              </div>
              <span style={{ padding: '3px 8px', borderRadius: 4, fontSize: 10, fontWeight: 700, textTransform: 'uppercase', background: t.status === 'resolved' ? '#DCFCE7' : t.status === 'in_progress' ? '#DBEAFE' : '#FEF3C7', color: t.status === 'resolved' ? '#166534' : t.status === 'in_progress' ? '#1E40AF' : '#92400E' }}>{t.status?.replace('_', ' ')}</span>
            </div>
          ))}
        </div>
      )}

      {selected && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, padding: 20 }} onClick={() => setSelected(null)}>
          <div style={{ background: 'white', borderRadius: 'var(--radius)', width: '100%', maxWidth: 560, padding: 24, maxHeight: '80vh', display: 'flex', flexDirection: 'column' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>{selected.subject}</h3>
              <div style={{ display: 'flex', gap: 6 }}>
                {selected.status !== 'in_progress' && <button onClick={() => handleStatus(selected._id, 'in_progress')} style={{ padding: '4px 10px', border: '1px solid #DBEAFE', borderRadius: 4, background: '#EFF6FF', color: '#1E40AF', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>In Progress</button>}
                {selected.status !== 'resolved' && <button onClick={() => handleStatus(selected._id, 'resolved')} style={{ padding: '4px 10px', border: '1px solid #BBF7D0', borderRadius: 4, background: '#F0FDF4', color: '#166534', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>Resolve</button>}
              </div>
            </div>
            <div style={{ flex: 1, overflowY: 'auto', marginBottom: 16 }}>
              {(selected.replies || []).map((r, i) => (
                <div key={i} style={{ padding: 10, borderRadius: 6, marginBottom: 8, maxWidth: '80%', background: r.sender === 'admin' ? 'var(--green-light)' : '#f3f4f6', alignSelf: r.sender === 'admin' ? 'flex-end' : 'flex-start' }}>
                  <div style={{ fontSize: 10, fontWeight: 600, marginBottom: 4, color: '#888' }}>{r.sender === 'admin' ? 'Admin' : selected.user?.name || 'User'}</div>
                  <div style={{ fontSize: 13 }}>{r.message}</div>
                  <div style={{ fontSize: 10, color: '#aaa', marginTop: 4 }}>{new Date(r.createdAt).toLocaleString()}</div>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <input value={reply} onChange={e => setReply(e.target.value)} placeholder="Type a reply..." onKeyDown={e => e.key === 'Enter' && handleReply()} style={{ flex: 1, padding: 10, border: '1px solid var(--gray-200)', borderRadius: 6, fontSize: 13 }} />
              <button onClick={handleReply} style={{ padding: '8px 16px', background: 'var(--green)', color: 'white', border: 'none', borderRadius: 6, fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>Send</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminTickets;
