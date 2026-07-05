import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

const TicketSystem = () => {
  useAuth();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({ subject: '', message: '', category: 'general', priority: 'medium' });
  const [reply, setReply] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const load = () => api.get('/tickets').then(res => setTickets(res.data.tickets || [])).catch(() => {}).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const handleCreate = async () => {
    if (!form.subject || !form.message) return;
    setSubmitting(true);
    try { await api.post('/tickets', form); setShowCreate(false); setForm({ subject: '', message: '', category: 'general', priority: 'medium' }); load(); } catch {} finally { setSubmitting(false); }
  };

  const handleReply = async () => {
    if (!reply.trim() || !selected) return;
    try { await api.post(`/tickets/${selected._id}/reply`, { message: reply }); setReply(''); load(); const res = await api.get(`/tickets/${selected._id}`); setSelected(res.data.ticket); } catch {}
  };

  const handleStatus = async (id, status) => {
    try { await api.put(`/tickets/${id}`, { status }); load(); if (selected && selected._id === id) { const res = await api.get(`/tickets/${id}`); setSelected(res.data.ticket); } } catch {}
  };

  const priorityColor = { low: '#6B7280', medium: '#D97706', high: '#DC2626', urgent: '#9333EA' };

  if (loading) return <div style={{ padding: '40px', textAlign: 'center', color: '#888' }}>Loading...</div>;

  return (
    <div>
      <style>{`
        .ticket-grid { display: grid; grid-template-columns: 340px 1fr; gap: 16px; min-height: 500px; }
        .ticket-list { border: 1px solid var(--gray-200); border-radius: var(--radius); overflow: hidden; background: var(--white); }
        .ticket-item { padding: 14px 16px; border-bottom: 1px solid var(--gray-100); cursor: pointer; transition: background 0.1s; }
        .ticket-item:hover { background: var(--gray-50); }
        .ticket-item.active { background: var(--green-light); border-left: 3px solid var(--green); }
        .ticket-item-subject { font-size: 13px; font-weight: 600; margin-bottom: 4px; }
        .ticket-item-meta { font-size: 11px; color: #888; display: flex; justify-content: space-between; }
        .ticket-detail { border: 1px solid var(--gray-200); border-radius: var(--radius); background: var(--white); display: flex; flex-direction: column; }
        .ticket-detail-header { padding: 20px; border-bottom: 1px solid var(--gray-100); }
        .ticket-detail-header h3 { margin: 0 0 6px; font-size: 16px; font-weight: 700; }
        .ticket-replies { flex: 1; overflow-y: auto; padding: 16px; display: flex; flex-direction: column; gap: 12px; }
        .ticket-reply { padding: 12px; border-radius: 8px; max-width: 80%; }
        .ticket-reply.user { background: var(--green-light); align-self: flex-end; border-bottom-right-radius: 2px; }
        .ticket-reply.admin { background: var(--gray-100); align-self: flex-start; border-bottom-left-radius: 2px; }
        .ticket-reply-sender { font-size: 11px; font-weight: 600; margin-bottom: 4px; }
        .ticket-reply-msg { font-size: 13px; line-height: 1.5; }
        .ticket-reply-time { font-size: 10px; color: #aaa; margin-top: 4px; }
        .ticket-reply-input { display: flex; gap: 8px; padding: 12px 16px; border-top: 1px solid var(--gray-100); }
        .ticket-reply-input input { flex: 1; padding: 10px; border: 1px solid var(--gray-200); border-radius: 6px; font-size: 13px; outline: none; }
        .ticket-reply-input input:focus { border-color: var(--green); }
        .ticket-reply-input button { padding: 8px 16px; background: var(--green); color: white; border: none; border-radius: 6px; font-weight: 600; cursor: pointer; font-size: 12px; }
        .ticket-empty { display: flex; align-items: center; justify-content: center; height: 100%; color: #888; font-size: 14px; }
        .ticket-create-btn { padding: 8px 16px; background: var(--green); color: white; border: none; border-radius: 6px; font-weight: 600; cursor: pointer; font-size: 13px; margin-bottom: 16px; }
        .ticket-modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 2000; padding: 20px; }
        .ticket-modal { background: white; border-radius: var(--radius); width: 100%; max-width: 480px; padding: 24px; }
        .ticket-modal h3 { margin: 0 0 16px; font-size: 18px; font-weight: 700; }
        .ticket-field { margin-bottom: 14px; }
        .ticket-field label { display: block; font-size: 13px; font-weight: 600; color: #333; margin-bottom: 6px; }
        .ticket-field input, .ticket-field textarea, .ticket-field select { width: 100%; padding: 10px; border: 1px solid var(--gray-200); border-radius: 6px; font-size: 13px; outline: none; font-family: inherit; }
        .ticket-field textarea { resize: vertical; min-height: 80px; }
        .ticket-modal-btns { display: flex; gap: 8px; justify-content: flex-end; margin-top: 16px; }
        .ticket-modal-btns button { padding: 8px 16px; border-radius: 6px; font-size: 13px; font-weight: 600; cursor: pointer; border: none; }
        .ticket-modal-btns .save { background: var(--green); color: white; }
        .ticket-modal-btns .cancel { background: var(--gray-100); color: #666; }
      `}</style>

      <button className="ticket-create-btn" onClick={() => setShowCreate(true)}>New Ticket</button>

      <div className="ticket-grid">
        <div className="ticket-list">
          {tickets.length === 0 ? <div className="ticket-empty">No tickets</div> : tickets.map(t => (
            <div key={t._id} className={`ticket-item ${selected?._id === t._id ? 'active' : ''}`} onClick={() => setSelected(t)}>
              <div className="ticket-item-subject" style={{ borderLeft: `3px solid ${priorityColor[t.priority]}`, paddingLeft: 8 }}>{t.subject}</div>
              <div className="ticket-item-meta">
                <span>{t.status} &bull; {t.replies?.length || 0} replies</span>
                <span>{new Date(t.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="ticket-detail">
          {!selected ? <div className="ticket-empty">Select a ticket</div> : (
            <>
              <div className="ticket-detail-header">
                <h3>{selected.subject}</h3>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <span style={{ padding: '2px 8px', borderRadius: 4, fontSize: 10, fontWeight: 700, textTransform: 'uppercase', background: priorityColor[selected.priority] + '20', color: priorityColor[selected.priority] }}>{selected.priority}</span>
                  <span style={{ fontSize: 12, color: '#888' }}>{selected.category} &bull; {selected.status}</span>
                  {selected.status === 'open' && <button onClick={() => handleStatus(selected._id, 'resolved')} style={{ marginLeft: 'auto', padding: '4px 10px', border: '1px solid #BBF7D0', borderRadius: 4, background: '#F0FDF4', color: '#166534', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>Resolve</button>}
                  {selected.status === 'resolved' && <button onClick={() => handleStatus(selected._id, 'open')} style={{ marginLeft: 'auto', padding: '4px 10px', border: '1px solid var(--gray-200)', borderRadius: 4, background: 'white', color: '#666', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>Reopen</button>}
                </div>
              </div>

              <div className="ticket-replies">
                {(selected.replies || []).map((r, i) => (
                  <div key={i} className={`ticket-reply ${r.sender === 'user' ? 'user' : 'admin'}`}>
                    <div className="ticket-reply-sender">{r.sender === 'user' ? (selected.user?.name || 'You') : 'Support'}</div>
                    <div className="ticket-reply-msg">{r.message}</div>
                    <div className="ticket-reply-time">{new Date(r.createdAt).toLocaleString()}</div>
                  </div>
                ))}
              </div>

              <div className="ticket-reply-input">
                <input value={reply} onChange={e => setReply(e.target.value)} placeholder="Type a reply..." onKeyDown={e => e.key === 'Enter' && handleReply()} />
                <button onClick={handleReply}>Send</button>
              </div>
            </>
          )}
        </div>
      </div>

      {showCreate && (
        <div className="ticket-modal-overlay" onClick={() => setShowCreate(false)}>
          <div className="ticket-modal" onClick={e => e.stopPropagation()}>
            <h3>New Support Ticket</h3>
            <div className="ticket-field"><label>Subject</label><input value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} placeholder="Brief description" /></div>
            <div className="ticket-field"><label>Category</label><select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}><option value="general">General</option><option value="billing">Billing</option><option value="project">Project</option><option value="account">Account</option><option value="technical">Technical</option></select></div>
            <div className="ticket-field"><label>Priority</label><select value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })}><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option><option value="urgent">Urgent</option></select></div>
            <div className="ticket-field"><label>Message</label><textarea value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} placeholder="Describe your issue..." rows={4} /></div>
            <div className="ticket-modal-btns">
              <button className="cancel" onClick={() => setShowCreate(false)}>Cancel</button>
              <button className="save" onClick={handleCreate} disabled={submitting || !form.subject || !form.message}>{submitting ? 'Sending...' : 'Submit'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TicketSystem;
