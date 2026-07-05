import React, { useState, useEffect } from 'react';
import api from '../../api/axios';

const AdminCaseStudies = () => {
  const [caseStudies, setCaseStudies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ title: '', industry: 'Fashion', challenge: '', solution: '', results: '', summary: '' });
  const [submitting, setSubmitting] = useState(false);

  const load = () => api.get('/case-studies').then(res => setCaseStudies(res.data.caseStudies || [])).catch(() => {}).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const handleCreate = async () => {
    if (!form.title || !form.challenge || !form.solution || !form.results) return;
    setSubmitting(true);
    try { await api.post('/case-studies', form); setShowModal(false); setForm({ title: '', industry: 'Fashion', challenge: '', solution: '', results: '', summary: '' }); load(); } catch {} finally { setSubmitting(false); }
  };

  const handleDelete = async (id) => {
    try { await api.delete(`/case-studies/${id}`); load(); } catch {}
  };

  if (loading) return <div style={{ padding: 40, textAlign: 'center', color: '#888' }}>Loading...</div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <h3 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>Case Studies</h3>
        <button onClick={() => setShowModal(true)} style={{ padding: '8px 16px', background: 'var(--green)', color: 'white', border: 'none', borderRadius: 6, fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>+ New</button>
      </div>

      {caseStudies.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 40, color: '#888', background: 'var(--white)', borderRadius: 'var(--radius)', border: '1px solid var(--gray-200)' }}>No case studies yet</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {caseStudies.map(cs => (
            <div key={cs._id} style={{ background: 'var(--white)', border: '1px solid var(--gray-200)', borderRadius: 'var(--radius)', padding: 16, display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 600 }}>{cs.title}</div>
                <div style={{ fontSize: 12, color: '#888', marginTop: 4 }}>{cs.industry} &bull; {cs.views || 0} views</div>
                <div style={{ fontSize: 12, color: '#aaa', marginTop: 4 }}>{cs.challenge?.substring(0, 100)}...</div>
              </div>
              <button onClick={() => handleDelete(cs._id)} style={{ padding: '4px 10px', border: '1px solid #FECACA', borderRadius: 4, background: 'white', color: '#991B1B', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>Delete</button>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, padding: 20 }} onClick={() => setShowModal(false)}>
          <div style={{ background: 'white', borderRadius: 'var(--radius)', width: '100%', maxWidth: 520, padding: 24, maxHeight: '80vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
            <h3 style={{ margin: '0 0 16px', fontSize: 18, fontWeight: 700 }}>New Case Study</h3>
            <div style={{ marginBottom: 14 }}><label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Title</label><input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} style={{ width: '100%', padding: 10, border: '1px solid var(--gray-200)', borderRadius: 6, fontSize: 13 }} /></div>
            <div style={{ marginBottom: 14 }}><label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Industry</label><select value={form.industry} onChange={e => setForm({ ...form, industry: e.target.value })} style={{ width: '100%', padding: 10, border: '1px solid var(--gray-200)', borderRadius: 6, fontSize: 13 }}><option>Fashion</option><option>Food</option><option>Technology</option><option>Retail</option><option>Manufacturing</option><option>Creative</option><option>Other</option></select></div>
            <div style={{ marginBottom: 14 }}><label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Summary</label><textarea value={form.summary} onChange={e => setForm({ ...form, summary: e.target.value })} rows={2} style={{ width: '100%', padding: 10, border: '1px solid var(--gray-200)', borderRadius: 6, fontSize: 13, resize: 'vertical', fontFamily: 'inherit' }} /></div>
            <div style={{ marginBottom: 14 }}><label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Challenge</label><textarea value={form.challenge} onChange={e => setForm({ ...form, challenge: e.target.value })} rows={3} style={{ width: '100%', padding: 10, border: '1px solid var(--gray-200)', borderRadius: 6, fontSize: 13, resize: 'vertical', fontFamily: 'inherit' }} /></div>
            <div style={{ marginBottom: 14 }}><label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Solution</label><textarea value={form.solution} onChange={e => setForm({ ...form, solution: e.target.value })} rows={3} style={{ width: '100%', padding: 10, border: '1px solid var(--gray-200)', borderRadius: 6, fontSize: 13, resize: 'vertical', fontFamily: 'inherit' }} /></div>
            <div style={{ marginBottom: 14 }}><label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Results</label><textarea value={form.results} onChange={e => setForm({ ...form, results: e.target.value })} rows={3} style={{ width: '100%', padding: 10, border: '1px solid var(--gray-200)', borderRadius: 6, fontSize: 13, resize: 'vertical', fontFamily: 'inherit' }} /></div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 16 }}>
              <button onClick={() => setShowModal(false)} style={{ padding: '8px 16px', borderRadius: 6, fontSize: 13, fontWeight: 600, border: 'none', background: 'var(--gray-100)', color: '#666', cursor: 'pointer' }}>Cancel</button>
              <button onClick={handleCreate} disabled={submitting || !form.title || !form.challenge || !form.solution || !form.results} style={{ padding: '8px 16px', borderRadius: 6, fontSize: 13, fontWeight: 600, border: 'none', background: 'var(--green)', color: 'white', cursor: 'pointer' }}>{submitting ? 'Creating...' : 'Create'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCaseStudies;
