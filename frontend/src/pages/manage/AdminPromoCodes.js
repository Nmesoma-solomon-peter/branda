import React, { useState, useEffect } from 'react';
import api from '../../api/axios';

const AdminPromoCodes = () => {
  const [promos, setPromos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ code: '', discountPercent: '', maxUses: '', validFrom: '', validUntil: '', industry: '' });
  const [submitting, setSubmitting] = useState(false);

  const load = () => api.get('/promo-codes').then(res => setPromos(res.data.promoCodes || [])).catch(() => {}).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const handleCreate = async () => {
    if (!form.code || !form.discountPercent) return;
    setSubmitting(true);
    try { await api.post('/promo-codes', { ...form, discountPercent: Number(form.discountPercent), maxUses: Number(form.maxUses) || 100 }); setShowModal(false); setForm({ code: '', discountPercent: '', maxUses: '', validFrom: '', validUntil: '', industry: '' }); load(); } catch {} finally { setSubmitting(false); }
  };

  const handleDelete = async (id) => {
    try { await api.delete(`/promo-codes/${id}`); load(); } catch {}
  };

  if (loading) return <div style={{ padding: '40px', textAlign: 'center', color: '#888' }}>Loading...</div>;

  return (
    <div>
      <button onClick={() => setShowModal(true)} style={{ padding: '8px 16px', background: 'var(--green)', color: 'white', border: 'none', borderRadius: 6, fontWeight: 600, fontSize: 13, cursor: 'pointer', marginBottom: 16 }}>+ New Promo Code</button>

      {promos.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 40, color: '#888' }}>No promo codes</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {promos.map(p => (
            <div key={p._id} style={{ background: 'var(--white)', border: '1px solid var(--gray-200)', borderRadius: 'var(--radius)', padding: 16, display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 15, fontWeight: 700, fontFamily: 'monospace', letterSpacing: 1 }}>{p.code}</div>
                <div style={{ fontSize: 12, color: '#888', marginTop: 4 }}>{p.discountPercent}% off &bull; Used {p.usedCount || 0}/{p.maxUses} times</div>
                {p.validUntil && <div style={{ fontSize: 11, color: '#aaa' }}>Expires: {new Date(p.validUntil).toLocaleDateString()}</div>}
              </div>
              <span style={{ padding: '3px 8px', borderRadius: 4, fontSize: 10, fontWeight: 700, textTransform: 'uppercase', background: p.isActive ? '#DCFCE7' : '#FEE2E2', color: p.isActive ? '#166534' : '#991B1B' }}>{p.isActive ? 'Active' : 'Inactive'}</span>
              <button onClick={() => handleDelete(p._id)} style={{ padding: '6px 12px', border: '1px solid #FECACA', borderRadius: 4, background: 'white', color: '#991B1B', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>Delete</button>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, padding: 20 }} onClick={() => setShowModal(false)}>
          <div style={{ background: 'white', borderRadius: 'var(--radius)', width: '100%', maxWidth: 420, padding: 24 }} onClick={e => e.stopPropagation()}>
            <h3 style={{ margin: '0 0 16px', fontSize: 18, fontWeight: 700 }}>New Promo Code</h3>
            <div style={{ marginBottom: 14 }}><label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Code</label><input value={form.code} onChange={e => setForm({ ...form, code: e.target.value.toUpperCase() })} style={{ width: '100%', padding: 10, border: '1px solid var(--gray-200)', borderRadius: 6, fontSize: 14, fontFamily: 'monospace' }} placeholder="SUMMER20" /></div>
            <div style={{ marginBottom: 14 }}><label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Discount %</label><input type="number" value={form.discountPercent} onChange={e => setForm({ ...form, discountPercent: e.target.value })} style={{ width: '100%', padding: 10, border: '1px solid var(--gray-200)', borderRadius: 6, fontSize: 14 }} placeholder="20" min="1" max="90" /></div>
            <div style={{ marginBottom: 14 }}><label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Max Uses</label><input type="number" value={form.maxUses} onChange={e => setForm({ ...form, maxUses: e.target.value })} style={{ width: '100%', padding: 10, border: '1px solid var(--gray-200)', borderRadius: 6, fontSize: 14 }} placeholder="100" min="1" /></div>
            <div style={{ marginBottom: 14 }}><label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Valid Until</label><input type="date" value={form.validUntil} onChange={e => setForm({ ...form, validUntil: e.target.value })} style={{ width: '100%', padding: 10, border: '1px solid var(--gray-200)', borderRadius: 6, fontSize: 14 }} /></div>
            <div style={{ marginBottom: 14 }}><label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Industry (optional)</label><select value={form.industry} onChange={e => setForm({ ...form, industry: e.target.value })} style={{ width: '100%', padding: 10, border: '1px solid var(--gray-200)', borderRadius: 6, fontSize: 14 }}><option value="">All Industries</option><option>Fashion</option><option>Food</option><option>Technology</option><option>Retail</option><option>Manufacturing</option><option>Creative</option><option>Other</option></select></div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 16 }}>
              <button onClick={() => setShowModal(false)} style={{ padding: '8px 16px', borderRadius: 6, fontSize: 13, fontWeight: 600, border: 'none', background: 'var(--gray-100)', color: '#666', cursor: 'pointer' }}>Cancel</button>
              <button onClick={handleCreate} disabled={submitting || !form.code || !form.discountPercent} style={{ padding: '8px 16px', borderRadius: 6, fontSize: 13, fontWeight: 600, border: 'none', background: 'var(--green)', color: 'white', cursor: 'pointer' }}>{submitting ? 'Creating...' : 'Create'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPromoCodes;
