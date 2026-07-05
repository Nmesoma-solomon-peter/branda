import React, { useState, useEffect } from 'react';
import api from '../../api/axios';

const AdminAnnouncements = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ title: '', message: '', type: 'info', target: 'all', expiresAt: '' });
  const [submitting, setSubmitting] = useState(false);

  const load = () => api.get('/announcements').then(res => setAnnouncements(res.data.announcements || [])).catch(() => {}).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const handleCreate = async () => {
    if (!form.title || !form.message) return;
    setSubmitting(true);
    try { await api.post('/announcements', form); setShowModal(false); setForm({ title: '', message: '', type: 'info', target: 'all', expiresAt: '' }); load(); } catch {} finally { setSubmitting(false); }
  };

  const handleDelete = async (id) => {
    try { await api.delete(`/announcements/${id}`); load(); } catch {}
  };

  const handleToggle = async (id, isActive) => {
    try { await api.put(`/announcements/${id}`, { isActive: !isActive }); load(); } catch {}
  };

  if (loading) return <div style={{ padding: 40, textAlign: 'center', color: '#888' }}>Loading...</div>;

  const typeColor = { info: '#3B82F6', warning: '#D97706', success: '#16A34A', error: '#DC2626' };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <h3 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>Announcements</h3>
        <button onClick={() => setShowModal(true)} style={{ padding: '8px 16px', background: 'var(--green)', color: 'white', border: 'none', borderRadius: 6, fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>+ New</button>
      </div>

      {announcements.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 40, color: '#888', background: 'var(--white)', borderRadius: 'var(--radius)', border: '1px solid var(--gray-200)' }}>No announcements yet</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {announcements.map(a => (
            <div key={a._id} style={{ background: 'var(--white)', border: '1px solid var(--gray-200)', borderRadius: 'var(--radius)', padding: 16, display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ width: 4, height: 36, borderRadius: 2, background: typeColor[a.type] || '#3B82F6', flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 600 }}>{a.title}</div>
                <div style={{ fontSize: 12, color: '#888', marginTop: 2 }}>{a.message?.substring(0, 80)}... &bull; Target: {a.target} &bull; {a.expiresAt ? `Expires ${new Date(a.expiresAt).toLocaleDateString()}` : 'No expiry'}</div>
              </div>
              <button onClick={() => handleToggle(a._id, a.isActive)} style={{ padding: '4px 10px', border: '1px solid var(--gray-200)', borderRadius: 4, background: a.isActive ? '#DCFCE7' : '#F3F4F6', color: a.isActive ? '#166534' : '#6B7280', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>{a.isActive ? 'Active' : 'Inactive'}</button>
              <button onClick={() => handleDelete(a._id)} style={{ padding: '4px 10px', border: '1px solid #FECACA', borderRadius: 4, background: 'white', color: '#991B1B', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>Delete</button>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, padding: 20 }} onClick={() => setShowModal(false)}>
          <div style={{ background: 'white', borderRadius: 'var(--radius)', width: '100%', maxWidth: 480, padding: 24 }} onClick={e => e.stopPropagation()}>
            <h3 style={{ margin: '0 0 16px', fontSize: 18, fontWeight: 700 }}>New Announcement</h3>
            <div style={{ marginBottom: 14 }}><label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Title</label><input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} style={{ width: '100%', padding: 10, border: '1px solid var(--gray-200)', borderRadius: 6, fontSize: 13 }} /></div>
            <div style={{ marginBottom: 14 }}><label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Message</label><textarea value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} rows={3} style={{ width: '100%', padding: 10, border: '1px solid var(--gray-200)', borderRadius: 6, fontSize: 13, resize: 'vertical', fontFamily: 'inherit' }} /></div>
            <div style={{ display: 'flex', gap: 12, marginBottom: 14 }}>
              <div style={{ flex: 1 }}><label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Type</label><select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} style={{ width: '100%', padding: 10, border: '1px solid var(--gray-200)', borderRadius: 6, fontSize: 13 }}><option value="info">Info</option><option value="warning">Warning</option><option value="success">Success</option><option value="error">Error</option></select></div>
              <div style={{ flex: 1 }}><label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Target</label><select value={form.target} onChange={e => setForm({ ...form, target: e.target.value })} style={{ width: '100%', padding: 10, border: '1px solid var(--gray-200)', borderRadius: 6, fontSize: 13 }}><option value="all">All Users</option><option value="sme">SMEs</option><option value="specialist">Specialists</option></select></div>
            </div>
            <div style={{ marginBottom: 14 }}><label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Expires At (optional)</label><input type="date" value={form.expiresAt} onChange={e => setForm({ ...form, expiresAt: e.target.value })} style={{ width: '100%', padding: 10, border: '1px solid var(--gray-200)', borderRadius: 6, fontSize: 13 }} /></div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 16 }}>
              <button onClick={() => setShowModal(false)} style={{ padding: '8px 16px', borderRadius: 6, fontSize: 13, fontWeight: 600, border: 'none', background: 'var(--gray-100)', color: '#666', cursor: 'pointer' }}>Cancel</button>
              <button onClick={handleCreate} disabled={submitting || !form.title || !form.message} style={{ padding: '8px 16px', borderRadius: 6, fontSize: 13, fontWeight: 600, border: 'none', background: 'var(--green)', color: 'white', cursor: 'pointer' }}>{submitting ? 'Creating...' : 'Create'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAnnouncements;
