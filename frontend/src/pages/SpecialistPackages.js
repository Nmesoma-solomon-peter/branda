import React, { useState, useEffect } from 'react';
import api from '../api/axios';

const SpecialistPackages = () => {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editPkg, setEditPkg] = useState(null);
  const [form, setForm] = useState({ name: '', description: '', price: '', deliveryDays: '', revisions: '2', features: '', industry: '' });
  const [submitting, setSubmitting] = useState(false);

  const load = () => api.get('/packages/me').then(res => setPackages(res.data.packages || [])).catch(() => {}).finally(() => setLoading(false));

  useEffect(() => { load(); }, []);

  const openCreate = () => { setEditPkg(null); setForm({ name: '', description: '', price: '', deliveryDays: '', revisions: '2', features: '', industry: '' }); setShowModal(true); };
  const openEdit = (p) => { setEditPkg(p); setForm({ name: p.name, description: p.description, price: String(p.price), deliveryDays: String(p.deliveryDays), revisions: String(p.revisions), features: (p.features || []).join('\n'), industry: p.industry || '' }); setShowModal(true); };

  const handleSave = async () => {
    if (!form.name || !form.price || !form.deliveryDays) return;
    setSubmitting(true);
    try {
      const payload = { ...form, price: Number(form.price), deliveryDays: Number(form.deliveryDays), revisions: Number(form.revisions), features: form.features.split('\n').filter(f => f.trim()) };
      if (editPkg) { await api.put(`/packages/${editPkg._id}`, payload); }
      else { await api.post('/packages', payload); }
      setShowModal(false);
      load();
    } catch {} finally { setSubmitting(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this package?')) return;
    try { await api.delete(`/packages/${id}`); load(); } catch {}
  };

  if (loading) return <div style={{ padding: '100px 32px', textAlign: 'center', color: 'var(--gray-400)' }}>Loading...</div>;

  return (
    <>
      <style>{`
        .pkg-container { max-width: 1000px; margin: 100px auto 60px; padding: 0 32px; }
        .pkg-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 20px; margin-top: 24px; }
        .pkg-card { background: var(--white); border: 1px solid var(--gray-200); border-radius: var(--radius); padding: 24px; position: relative; }
        .pkg-card h3 { margin: 0 0 6px; font-size: 16px; font-weight: 700; }
        .pkg-card .pkg-desc { font-size: 13px; color: var(--gray-500); margin-bottom: 12px; line-height: 1.5; }
        .pkg-card .pkg-price { font-size: 22px; font-weight: 700; color: var(--green); }
        .pkg-card .pkg-price span { font-size: 13px; font-weight: 400; color: var(--gray-400); }
        .pkg-card .pkg-meta { display: flex; gap: 12px; font-size: 12px; color: var(--gray-500); margin-top: 12px; }
        .pkg-card .pkg-features { margin-top: 12px; padding-top: 12px; border-top: 1px solid var(--gray-100); }
        .pkg-card .pkg-features li { font-size: 12px; color: var(--gray-600); margin-bottom: 4px; list-style: none; }
        .pkg-card .pkg-features li::before { content: '✓ '; color: var(--green); font-weight: 700; }
        .pkg-actions { position: absolute; top: 12px; right: 12px; display: flex; gap: 6px; }
        .pkg-actions button { padding: 4px 8px; border: 1px solid var(--gray-200); border-radius: 4px; background: var(--white); cursor: pointer; font-size: 11px; }
        .pkg-actions button:hover { background: var(--gray-50); }
        .pkg-actions button.del { color: #DC2626; border-color: #FECACA; }
        .pkg-empty { text-align: center; padding: 60px 20px; color: var(--gray-400); }
        .pkg-add-btn { padding: 10px 20px; background: var(--green); color: var(--white); border: none; border-radius: 8px; font-weight: 600; font-size: 14px; cursor: pointer; }
        .pkg-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 2000; padding: 20px; }
        .pkg-modal { background: var(--white); border-radius: var(--radius); width: 100%; max-width: 500px; padding: 24px; max-height: 80vh; overflow-y: auto; }
        .pkg-modal h3 { margin: 0 0 16px; font-size: 18px; font-weight: 700; }
        .pkg-field { margin-bottom: 14px; }
        .pkg-field label { display: block; font-size: 13px; font-weight: 600; color: var(--gray-700); margin-bottom: 6px; }
        .pkg-field input, .pkg-field textarea, .pkg-field select { width: 100%; padding: 10px 12px; border: 1px solid var(--gray-200); border-radius: 6px; font-size: 14px; outline: none; font-family: inherit; }
        .pkg-field textarea { resize: vertical; min-height: 60px; }
        .pkg-field input:focus, .pkg-field textarea:focus, .pkg-field select:focus { border-color: var(--green); }
        .pkg-field small { font-size: 11px; color: var(--gray-400); }
        .pkg-modal-btns { display: flex; gap: 8px; justify-content: flex-end; margin-top: 16px; }
        .pkg-modal-btns button { padding: 10px 18px; border-radius: 6px; font-size: 13px; font-weight: 600; cursor: pointer; border: none; }
        .pkg-modal-btns .save { background: var(--green); color: var(--white); }
        .pkg-modal-btns .cancel { background: var(--gray-100); color: var(--gray-600); }
      `}</style>

      <div className="pkg-container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 28, fontWeight: 700, margin: 0 }}>Service Packages</h1>
          <button className="pkg-add-btn" onClick={openCreate}>+ New Package</button>
        </div>

        {packages.length === 0 ? (
          <div className="pkg-empty">
            <p style={{ marginBottom: 16 }}>No packages yet. Create your first service package.</p>
            <button className="pkg-add-btn" onClick={openCreate}>+ Create Package</button>
          </div>
        ) : (
          <div className="pkg-grid">
            {packages.map(p => (
              <div className="pkg-card" key={p._id}>
                <div className="pkg-actions">
                  <button onClick={() => openEdit(p)}>Edit</button>
                  <button className="del" onClick={() => handleDelete(p._id)}>Del</button>
                </div>
                <h3>{p.name}</h3>
                <p className="pkg-desc">{p.description}</p>
                <div className="pkg-price">₦{p.price.toLocaleString()} <span>/ project</span></div>
                <div className="pkg-meta">
                  <span>{p.deliveryDays} days delivery</span>
                  <span>{p.revisions} revisions</span>
                </div>
                {p.features && p.features.length > 0 && (
                  <ul className="pkg-features">{p.features.map((f, i) => <li key={i}>{f}</li>)}</ul>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <div className="pkg-overlay" onClick={() => setShowModal(false)}>
          <div className="pkg-modal" onClick={e => e.stopPropagation()}>
            <h3>{editPkg ? 'Edit Package' : 'New Package'}</h3>
            <div className="pkg-field"><label>Package Name</label><input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. Logo Design" /></div>
            <div className="pkg-field"><label>Description</label><textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Describe what's included..." rows={3} /></div>
            <div className="pkg-field"><label>Price (NGN)</label><input type="number" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} placeholder="0" min="0" /></div>
            <div className="pkg-field"><label>Delivery Days</label><input type="number" value={form.deliveryDays} onChange={e => setForm({ ...form, deliveryDays: e.target.value })} placeholder="7" min="1" /></div>
            <div className="pkg-field"><label>Revisions</label><input type="number" value={form.revisions} onChange={e => setForm({ ...form, revisions: e.target.value })} min="0" max="10" /></div>
            <div className="pkg-field"><label>Features (one per line)</label><textarea value={form.features} onChange={e => setForm({ ...form, features: e.target.value })} placeholder="3 concepts&#10;Source file&#10;Unlimited revisions" rows={4} /></div>
            <div className="pkg-field"><label>Industry (optional)</label><select value={form.industry} onChange={e => setForm({ ...form, industry: e.target.value })}><option value="">All Industries</option><option>Fashion</option><option>Food</option><option>Technology</option><option>Retail</option><option>Manufacturing</option><option>Creative</option><option>Other</option></select></div>
            <div className="pkg-modal-btns">
              <button className="cancel" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="save" onClick={handleSave} disabled={submitting || !form.name || !form.price}>{submitting ? 'Saving...' : 'Save'}</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SpecialistPackages;
