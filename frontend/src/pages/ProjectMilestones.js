import React, { useState, useEffect } from 'react';
import api from '../api/axios';

const ProjectMilestones = ({ projectId, onUpdate }) => {
  const [milestones, setMilestones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', amount: '', dueDate: '' });
  const [submitting, setSubmitting] = useState(false);

  const load = () => {
    if (!projectId) return;
    api.get(`/milestones/project/${projectId}`).then(res => setMilestones(res.data.milestones || [])).catch(() => {}).finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, [projectId]);

  const handleCreate = async () => {
    if (!form.title || !form.amount) return;
    setSubmitting(true);
    try { await api.post('/milestones', { ...form, projectId, amount: Number(form.amount) }); setShowCreate(false); setForm({ title: '', description: '', amount: '', dueDate: '' }); load(); if (onUpdate) onUpdate(); } catch {} finally { setSubmitting(false); }
  };

  const handleStatus = async (id, status) => {
    try { await api.put(`/milestones/${id}`, { status }); load(); if (onUpdate) onUpdate(); } catch {}
  };

  const completedAmount = milestones.filter(m => m.status === 'completed').reduce((sum, m) => sum + (m.amount || 0), 0);
  const totalAmount = milestones.reduce((sum, m) => sum + (m.amount || 0), 0);

  const statusColor = { pending: '#D97706', in_progress: '#2563EB', completed: '#16A34A', approved: '#16A34A', rejected: '#DC2626' };

  if (loading) return <div style={{ padding: 16, color: '#888', fontSize: 13 }}>Loading milestones...</div>;

  return (
    <div style={{ background: 'var(--white)', border: '1px solid var(--gray-200)', borderRadius: 'var(--radius)', padding: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div>
          <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700 }}>Milestones</h3>
          <p style={{ margin: '4px 0 0', fontSize: 12, color: '#888' }}>₦{completedAmount.toLocaleString()} / ₦{totalAmount.toLocaleString()} completed</p>
        </div>
        <button onClick={() => setShowCreate(true)} style={{ padding: '6px 12px', background: 'var(--green)', color: 'white', border: 'none', borderRadius: 4, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>+ Add</button>
      </div>

      {milestones.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 24, color: '#aaa', fontSize: 13 }}>No milestones yet</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {milestones.map(m => (
            <div key={m._id} style={{ padding: 12, border: '1px solid var(--gray-100)', borderRadius: 6, display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 4, height: 40, borderRadius: 2, background: statusColor[m.status] || '#888', flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{m.title}</div>
                {m.description && <div style={{ fontSize: 11, color: '#888', marginTop: 2 }}>{m.description}</div>}
                <div style={{ fontSize: 11, color: '#aaa', marginTop: 4 }}>₦{m.amount?.toLocaleString()} {m.dueDate && `• Due ${new Date(m.dueDate).toLocaleDateString()}`}</div>
              </div>
              <span style={{ padding: '2px 8px', borderRadius: 4, fontSize: 10, fontWeight: 700, textTransform: 'uppercase', background: (statusColor[m.status] || '#888') + '15', color: statusColor[m.status] || '#888' }}>{m.status?.replace('_', ' ')}</span>
              {m.status === 'pending' && <button onClick={() => handleStatus(m._id, 'in_progress')} style={{ padding: '4px 8px', border: '1px solid var(--gray-200)', borderRadius: 4, background: 'white', fontSize: 11, cursor: 'pointer' }}>Start</button>}
              {m.status === 'in_progress' && <button onClick={() => handleStatus(m._id, 'completed')} style={{ padding: '4px 8px', border: '1px solid #BBF7D0', borderRadius: 4, background: '#F0FDF4', color: '#166534', fontSize: 11, cursor: 'pointer' }}>Complete</button>}
            </div>
          ))}
        </div>
      )}

      {showCreate && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, padding: 20 }} onClick={() => setShowCreate(false)}>
          <div style={{ background: 'white', borderRadius: 'var(--radius)', width: '100%', maxWidth: 420, padding: 24 }} onClick={e => e.stopPropagation()}>
            <h3 style={{ margin: '0 0 16px', fontSize: 16, fontWeight: 700 }}>New Milestone</h3>
            <div style={{ marginBottom: 14 }}><label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Title</label><input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} style={{ width: '100%', padding: 8, border: '1px solid var(--gray-200)', borderRadius: 4, fontSize: 13 }} /></div>
            <div style={{ marginBottom: 14 }}><label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Description</label><textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} style={{ width: '100%', padding: 8, border: '1px solid var(--gray-200)', borderRadius: 4, fontSize: 13, minHeight: 60, resize: 'vertical', fontFamily: 'inherit' }} /></div>
            <div style={{ marginBottom: 14 }}><label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Amount (NGN)</label><input type="number" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} style={{ width: '100%', padding: 8, border: '1px solid var(--gray-200)', borderRadius: 4, fontSize: 13 }} /></div>
            <div style={{ marginBottom: 14 }}><label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Due Date</label><input type="date" value={form.dueDate} onChange={e => setForm({ ...form, dueDate: e.target.value })} style={{ width: '100%', padding: 8, border: '1px solid var(--gray-200)', borderRadius: 4, fontSize: 13 }} /></div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button onClick={() => setShowCreate(false)} style={{ padding: '6px 12px', border: 'none', background: 'var(--gray-100)', borderRadius: 4, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
              <button onClick={handleCreate} disabled={submitting || !form.title || !form.amount} style={{ padding: '6px 12px', border: 'none', background: 'var(--green)', color: 'white', borderRadius: 4, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>{submitting ? 'Creating...' : 'Create'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectMilestones;
