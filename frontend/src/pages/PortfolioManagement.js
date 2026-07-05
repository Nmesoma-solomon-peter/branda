import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import ConfirmModal from '../components/common/ConfirmModal';

const PlusIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
);

const TrashIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
    <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
  </svg>
);

const EditIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
    <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
  </svg>
);

const CloseIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);

const Spinner = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" style={{ animation: 'spin 1s linear infinite' }}>
    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" fill="none" strokeDasharray="31.4" strokeDashoffset="10" strokeLinecap="round"/>
    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
  </svg>
);

const categories = [
  'Logo Design', 'Brand Identity', 'Web Design', 'Mobile App Design',
  'UI/UX Design', 'Graphic Design', 'Print Design', 'Packaging Design',
  'Social Media Design', 'Illustration', 'Typography', 'Motion Graphics'
];

const PortfolioManagement = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [deleteModal, setDeleteModal] = useState({ open: false, id: null, title: '' });
  const [form, setForm] = useState({ title: '', description: '', category: 'Logo Design', imageUrl: '', projectUrl: '' });
  const [imagePreview, setImagePreview] = useState('');
  const [imageFile, setImageFile] = useState(null);

  useEffect(() => {
    api.get('/portfolio/me').then(res => setItems(res.data.items)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const openNew = () => {
    setEditItem(null);
    setForm({ title: '', description: '', category: 'Logo Design', imageUrl: '', projectUrl: '' });
    setImagePreview('');
    setImageFile(null);
    setShowModal(true);
  };

  const openEdit = (item) => {
    setEditItem(item);
    setForm({ title: item.title, description: item.description, category: item.category, imageUrl: item.imageUrl || '', projectUrl: item.projectUrl || '' });
    setImagePreview(item.imageUrl || '');
    setImageFile(null);
    setShowModal(true);
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { alert('Image must be under 5MB'); return; }
    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    if (!form.title.trim() || !form.description.trim()) return;
    setSaving(true);
    try {
      let imageUrl = form.imageUrl;
      if (imageFile) {
        const fd = new FormData();
        fd.append('image', imageFile);
        const uploadRes = await api.post('/assets/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        imageUrl = uploadRes.data.asset?.url || uploadRes.data.url || '';
      }

      const payload = { ...form, imageUrl };

      if (editItem) {
        const res = await api.put(`/portfolio/${editItem._id}`, payload);
        setItems(prev => prev.map(i => i._id === editItem._id ? res.data.item : i));
      } else {
        const res = await api.post('/portfolio', payload);
        setItems(prev => [res.data.item, ...prev]);
      }
      setShowModal(false);
    } catch {} finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!deleteModal.id) return;
    try {
      await api.delete(`/portfolio/${deleteModal.id}`);
      setItems(prev => prev.filter(i => i._id !== deleteModal.id));
    } catch {} finally { setDeleteModal({ open: false, id: null, title: '' }); }
  };

  if (loading) return <div style={{ padding: '100px 32px', textAlign: 'center', color: 'var(--gray-400)' }}>Loading...</div>;

  return (
    <>
      <style>{`
        .pm-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 20px; margin-top: 24px; }
        .pm-card { border: 1px solid var(--gray-200); border-radius: var(--radius); overflow: hidden; background: var(--white); transition: box-shadow 0.15s; }
        .pm-card:hover { box-shadow: 0 4px 16px rgba(0,0,0,0.08); }
        .pm-card-img { width: 100%; height: 180px; object-fit: cover; background: var(--gray-100); }
        .pm-card-body { padding: 16px; }
        .pm-card-cat { font-size: 11px; color: var(--green); font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; }
        .pm-card-title { font-size: 15px; font-weight: 600; color: var(--gray-800); margin: 6px 0; }
        .pm-card-desc { font-size: 13px; color: var(--gray-500); line-height: 1.5; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
        .pm-card-actions { display: flex; gap: 8px; padding: 12px 16px; border-top: 1px solid var(--gray-100); }
        .pm-card-actions button { flex: 1; padding: 8px; border: 1px solid var(--gray-200); border-radius: 6px; background: var(--white); font-size: 12px; font-weight: 500; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 4px; color: var(--gray-600); }
        .pm-card-actions button:hover { background: var(--gray-50); }
        .pm-card-actions button.danger { color: #DC2626; }
        .pm-card-actions button.danger:hover { background: #FEF2F2; }
        .pm-modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 2000; padding: 20px; }
        .pm-modal { background: var(--white); border-radius: var(--radius); width: 100%; max-width: 560px; max-height: 90vh; overflow-y: auto; }
        .pm-modal-header { display: flex; justify-content: space-between; align-items: center; padding: 20px 24px; border-bottom: 1px solid var(--gray-200); }
        .pm-modal-header h3 { margin: 0; font-size: 18px; font-weight: 700; }
        .pm-modal-body { padding: 24px; }
        .pm-form-group { margin-bottom: 16px; }
        .pm-form-group label { display: block; font-size: 13px; font-weight: 600; color: var(--gray-700); margin-bottom: 6px; }
        .pm-form-group input, .pm-form-group select, .pm-form-group textarea { width: 100%; padding: 10px 12px; border: 1px solid var(--gray-200); border-radius: 6px; font-size: 14px; font-family: var(--font-body); outline: none; }
        .pm-form-group input:focus, .pm-form-group select:focus, .pm-form-group textarea:focus { border-color: var(--green); }
        .pm-form-group textarea { resize: vertical; min-height: 80px; }
        .pm-image-upload { width: 100%; height: 160px; border: 2px dashed var(--gray-200); border-radius: 8px; display: flex; flex-direction: column; align-items: center; justify-content: center; cursor: pointer; overflow: hidden; position: relative; }
        .pm-image-upload:hover { border-color: var(--green); }
        .pm-image-upload img { width: 100%; height: 100%; object-fit: cover; }
        .pm-image-upload span { font-size: 13px; color: var(--gray-400); }
        .pm-modal-footer { display: flex; gap: 10px; justify-content: flex-end; padding: 16px 24px; border-top: 1px solid var(--gray-200); }
      `}</style>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '100px 32px 60px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 28, fontWeight: 700, margin: 0 }}>My Portfolio</h1>
            <p style={{ color: 'var(--gray-400)', fontSize: 14, marginTop: 4 }}>Showcase your best work to potential clients</p>
          </div>
          <button onClick={openNew} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 20px', background: 'var(--green)', color: 'var(--white)', border: 'none', borderRadius: 8, fontWeight: 600, fontSize: 14, cursor: 'pointer' }}>
            <PlusIcon /> Add Work
          </button>
        </div>

        {items.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 32px', color: 'var(--gray-400)' }}>
            <p style={{ fontSize: 15, marginBottom: 8 }}>No portfolio items yet</p>
            <p style={{ fontSize: 13 }}>Click "Add Work" to showcase your first project</p>
          </div>
        ) : (
          <div className="pm-grid">
            {items.map(item => (
              <div key={item._id} className="pm-card">
                {item.imageUrl ? (
                  <img src={item.imageUrl} alt={item.title} className="pm-card-img" />
                ) : (
                  <div className="pm-card-img" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--gray-300)', fontSize: 32 }}>No Image</div>
                )}
                <div className="pm-card-body">
                  <div className="pm-card-cat">{item.category}</div>
                  <div className="pm-card-title">{item.title}</div>
                  <div className="pm-card-desc">{item.description}</div>
                </div>
                <div className="pm-card-actions">
                  <button onClick={() => openEdit(item)}><EditIcon /> Edit</button>
                  <button className="danger" onClick={() => setDeleteModal({ open: true, id: item._id, title: item.title })}><TrashIcon /> Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <div className="pm-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="pm-modal" onClick={e => e.stopPropagation()}>
            <div className="pm-modal-header">
              <h3>{editItem ? 'Edit Portfolio Item' : 'Add Portfolio Item'}</h3>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--gray-400)' }}><CloseIcon /></button>
            </div>
            <div className="pm-modal-body">
              <div className="pm-form-group">
                <label>Title</label>
                <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Project title" maxLength={100} />
              </div>
              <div className="pm-form-group">
                <label>Description</label>
                <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Describe the project..." maxLength={500} />
              </div>
              <div className="pm-form-group">
                <label>Category</label>
                <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="pm-form-group">
                <label>Project Image</label>
                <label className="pm-image-upload">
                  {imagePreview ? <img src={imagePreview} alt="Preview" /> : <span>Click to upload image (max 5MB)</span>}
                  <input type="file" accept="image/*" onChange={handleImageChange} style={{ display: 'none' }} />
                </label>
              </div>
              <div className="pm-form-group">
                <label>Project URL (optional)</label>
                <input value={form.projectUrl} onChange={e => setForm({ ...form, projectUrl: e.target.value })} placeholder="https://..." />
              </div>
            </div>
            <div className="pm-modal-footer">
              <button onClick={() => setShowModal(false)} style={{ padding: '10px 20px', border: '1px solid var(--gray-200)', borderRadius: 6, background: 'var(--white)', fontSize: 14, cursor: 'pointer' }}>Cancel</button>
              <button onClick={handleSave} disabled={saving || !form.title.trim() || !form.description.trim()} style={{ padding: '10px 20px', background: 'var(--green)', color: 'var(--white)', border: 'none', borderRadius: 6, fontWeight: 600, fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
                {saving ? <><Spinner /> Saving...</> : editItem ? 'Update' : 'Add'}
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmModal open={deleteModal.open} title="Delete Portfolio Item" message={`Are you sure you want to delete "${deleteModal.title}"? This cannot be undone.`} confirmText="Delete" danger onConfirm={handleDelete} onCancel={() => setDeleteModal({ open: false, id: null, title: '' })} />
    </>
  );
};

export default PortfolioManagement;
