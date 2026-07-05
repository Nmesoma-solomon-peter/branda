import React, { useState, useEffect } from 'react';
import api from '../../api/axios';

const AdminBlog = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ title: '', content: '', category: 'general', status: 'draft' });
  const [submitting, setSubmitting] = useState(false);

  const load = () => api.get('/posts').then(res => setPosts(res.data.posts || [])).catch(() => {}).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const handleCreate = async () => {
    if (!form.title || !form.content) return;
    setSubmitting(true);
    try { await api.post('/posts', form); setShowModal(false); setForm({ title: '', content: '', category: 'general', status: 'draft' }); load(); } catch {} finally { setSubmitting(false); }
  };

  const handleDelete = async (id) => {
    try { await api.delete(`/posts/${id}`); load(); } catch {}
  };

  const handlePublish = async (id, newStatus) => {
    try { await api.put(`/posts/${id}`, { status: newStatus }); load(); } catch {}
  };

  if (loading) return <div style={{ padding: 40, textAlign: 'center', color: '#888' }}>Loading...</div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <h3 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>Blog Posts</h3>
        <button onClick={() => setShowModal(true)} style={{ padding: '8px 16px', background: 'var(--green)', color: 'white', border: 'none', borderRadius: 6, fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>+ New Post</button>
      </div>

      {posts.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 40, color: '#888', background: 'var(--white)', borderRadius: 'var(--radius)', border: '1px solid var(--gray-200)' }}>No blog posts yet</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {posts.map(p => (
            <div key={p._id} style={{ background: 'var(--white)', border: '1px solid var(--gray-200)', borderRadius: 'var(--radius)', padding: 16, display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 600 }}>{p.title}</div>
                <div style={{ fontSize: 12, color: '#888', marginTop: 4 }}>{p.category} &bull; {new Date(p.createdAt).toLocaleDateString()}</div>
              </div>
              <span style={{ padding: '3px 8px', borderRadius: 4, fontSize: 10, fontWeight: 700, textTransform: 'uppercase', background: p.status === 'published' ? '#DCFCE7' : '#FEF3C7', color: p.status === 'published' ? '#166534' : '#92400E' }}>{p.status}</span>
              {p.status === 'draft' ? (
                <button onClick={() => handlePublish(p._id, 'published')} style={{ padding: '4px 10px', border: '1px solid #BBF7D0', borderRadius: 4, background: '#F0FDF4', color: '#166534', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>Publish</button>
              ) : (
                <button onClick={() => handlePublish(p._id, 'draft')} style={{ padding: '4px 10px', border: '1px solid var(--gray-200)', borderRadius: 4, background: 'white', color: '#666', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>Unpublish</button>
              )}
              <button onClick={() => handleDelete(p._id)} style={{ padding: '4px 10px', border: '1px solid #FECACA', borderRadius: 4, background: 'white', color: '#991B1B', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>Delete</button>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, padding: 20 }} onClick={() => setShowModal(false)}>
          <div style={{ background: 'white', borderRadius: 'var(--radius)', width: '100%', maxWidth: 520, padding: 24, maxHeight: '80vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
            <h3 style={{ margin: '0 0 16px', fontSize: 18, fontWeight: 700 }}>New Blog Post</h3>
            <div style={{ marginBottom: 14 }}><label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Title</label><input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} style={{ width: '100%', padding: 10, border: '1px solid var(--gray-200)', borderRadius: 6, fontSize: 13 }} /></div>
            <div style={{ marginBottom: 14 }}><label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Category</label><select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} style={{ width: '100%', padding: 10, border: '1px solid var(--gray-200)', borderRadius: 6, fontSize: 13 }}><option value="general">General</option><option value="design">Design</option><option value="branding">Branding</option><option value="business">Business</option><option value="tutorial">Tutorial</option></select></div>
            <div style={{ marginBottom: 14 }}><label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Content</label><textarea value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} rows={8} style={{ width: '100%', padding: 10, border: '1px solid var(--gray-200)', borderRadius: 6, fontSize: 13, resize: 'vertical', fontFamily: 'inherit' }} placeholder="Write your post content here..." /></div>
            <div style={{ marginBottom: 14 }}><label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Status</label><select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} style={{ width: '100%', padding: 10, border: '1px solid var(--gray-200)', borderRadius: 6, fontSize: 13 }}><option value="draft">Draft</option><option value="published">Published</option></select></div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 16 }}>
              <button onClick={() => setShowModal(false)} style={{ padding: '8px 16px', borderRadius: 6, fontSize: 13, fontWeight: 600, border: 'none', background: 'var(--gray-100)', color: '#666', cursor: 'pointer' }}>Cancel</button>
              <button onClick={handleCreate} disabled={submitting || !form.title || !form.content} style={{ padding: '8px 16px', borderRadius: 6, fontSize: 13, fontWeight: 600, border: 'none', background: 'var(--green)', color: 'white', cursor: 'pointer' }}>{submitting ? 'Creating...' : 'Create'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminBlog;
