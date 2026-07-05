import React, { useState, useEffect } from 'react';
import api from '../../api/axios';

const AdminSpecialists = () => {
  const [specialists, setSpecialists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(null);

  const load = () => api.get('/admin/specialists').then(res => setSpecialists(res.data.specialists || [])).catch(() => {}).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const handleAction = async (id, updates) => {
    try {
      if (updates.suspended !== undefined) await api.put(`/admin/specialists/${id}/suspend`, updates);
      else if (updates.availability) await api.put(`/admin/specialists/${id}/availability`, { availability: updates.availability });
      else if (updates.portfolioApproved !== undefined) await api.put(`/admin/specialists/${id}/portfolio-approval`, { portfolioApproved: updates.portfolioApproved });
      load(); setModal(null);
    } catch {}
  };

  const filtered = specialists.filter(s => {
    if (filter === 'suspended' && !s.suspended) return false;
    if (filter === 'available' && s.availability !== 'available') return false;
    if (filter === 'unverified' && s.isVerified) return false;
    if (search && !s.name.toLowerCase().includes(search.toLowerCase()) && !s.email.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  if (loading) return <div style={{ padding: '40px', textAlign: 'center', color: '#888' }}>Loading...</div>;

  return (
    <>
      <style>{`
        .as-container { padding: 0; }
        .as-filters { display: flex; gap: 8px; margin-bottom: 20px; flex-wrap: wrap; align-items: center; }
        .as-filters button { padding: 6px 14px; border: 1px solid var(--gray-200); border-radius: 6px; background: var(--white); font-size: 12px; font-weight: 600; cursor: pointer; }
        .as-filters button.active { background: var(--green); color: var(--white); border-color: var(--green); }
        .as-search { padding: 8px 12px; border: 1px solid var(--gray-200); border-radius: 6px; font-size: 13px; outline: none; margin-left: auto; width: 200px; }
        .as-search:focus { border-color: var(--green); }
        .as-list { display: flex; flex-direction: column; gap: 8px; }
        .as-card { background: var(--white); border: 1px solid var(--gray-200); border-radius: var(--radius); padding: 16px; display: flex; align-items: center; gap: 16px; cursor: pointer; transition: box-shadow 0.15s; }
        .as-card:hover { box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
        .as-avatar { width: 40px; height: 40px; border-radius: 50%; background: var(--gray-100); display: flex; align-items: center; justify-content: center; font-weight: 700; color: var(--gray-500); font-size: 16px; flex-shrink: 0; }
        .as-info { flex: 1; }
        .as-name { font-size: 14px; font-weight: 600; }
        .as-email { font-size: 12px; color: var(--gray-400); }
        .as-meta { display: flex; gap: 10px; font-size: 11px; color: var(--gray-500); margin-top: 4px; }
        .as-badge { padding: 3px 8px; border-radius: 4px; font-size: 10px; font-weight: 700; text-transform: uppercase; }
        .as-badge.available { background: #DCFCE7; color: #166534; }
        .as-badge.busy { background: #FEF3C7; color: #92400E; }
        .as-badge.unavailable { background: #F3F4F6; color: #6B7280; }
        .as-badge.suspended { background: #FEE2E2; color: #991B1B; }
        .as-badge.unverified { background: #DBEAFE; color: #1E40AF; }
        .as-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 2000; padding: 20px; }
        .as-modal { background: var(--white); border-radius: var(--radius); width: 100%; max-width: 480px; padding: 24px; }
        .as-modal h3 { margin: 0 0 4px; font-size: 18px; font-weight: 700; }
        .as-modal .sub { font-size: 13px; color: var(--gray-500); margin-bottom: 20px; }
        .as-modal-actions { display: flex; flex-direction: column; gap: 8px; }
        .as-modal-actions button { padding: 12px; border-radius: 6px; font-size: 13px; font-weight: 600; cursor: pointer; border: 1px solid var(--gray-200); background: var(--white); text-align: left; }
        .as-modal-actions button:hover { background: var(--gray-50); }
        .as-modal-actions button.danger { color: #DC2626; border-color: #FECACA; }
        .as-modal-actions button.danger:hover { background: #FEF2F2; }
        .as-modal-actions button.success { color: #16A34A; border-color: #BBF7D0; }
        .as-modal-actions button.success:hover { background: #F0FDF4; }
        .as-cancel { margin-top: 12px; padding: 8px; border: none; background: none; color: var(--gray-500); font-size: 13px; cursor: pointer; width: 100%; }
        .as-empty { text-align: center; padding: 40px; color: var(--gray-400); font-size: 14px; }
      `}</style>

      <div className="as-container">
        <div className="as-filters">
          {[['all', 'All'], ['available', 'Available'], ['busy', 'Busy'], ['suspended', 'Suspended'], ['unverified', 'Unverified']].map(([f, l]) => (
            <button key={f} className={filter === f ? 'active' : ''} onClick={() => setFilter(f)}>{l}</button>
          ))}
          <input className="as-search" placeholder="Search specialists..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>

        {filtered.length === 0 ? (
          <div className="as-empty">No specialists found</div>
        ) : (
          <div className="as-list">
            {filtered.map(s => (
              <div className="as-card" key={s._id} onClick={() => setModal(s)}>
                <div className="as-avatar">{s.name ? s.name.charAt(0).toUpperCase() : '?'}</div>
                <div className="as-info">
                  <div className="as-name">{s.name}</div>
                  <div className="as-email">{s.email}</div>
                  <div className="as-meta">
                    <span>{s.yearsExperience || 0}y exp</span>
                    <span>{(s.skills || []).length} skills</span>
                    <span>Joined {new Date(s.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
                <span className={`as-badge ${s.suspended ? 'suspended' : !s.isVerified ? 'unverified' : s.availability || 'available'}`}>
                  {s.suspended ? 'Suspended' : !s.isVerified ? 'Unverified' : s.availability || 'available'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {modal && (
        <div className="as-overlay" onClick={() => setModal(null)}>
          <div className="as-modal" onClick={e => e.stopPropagation()}>
            <h3>{modal.name}</h3>
            <div className="sub">{modal.email} &bull; {modal.yearsExperience || 0}y experience</div>

            <div className="as-modal-actions">
              {modal.suspended ? (
                <button className="success" onClick={() => handleAction(modal._id, { suspended: false, suspendedReason: '' })}>Unsuspend</button>
              ) : (
                <button className="danger" onClick={() => handleAction(modal._id, { suspended: true, suspendedReason: 'Suspended by admin' })}>Suspend Account</button>
              )}

              {modal.availability === 'available' ? (
                <button onClick={() => handleAction(modal._id, { availability: 'busy' })}>Set as Busy</button>
              ) : (
                <button onClick={() => handleAction(modal._id, { availability: 'available' })}>Set as Available</button>
              )}

              {modal.portfolioApproved ? (
                <button onClick={() => handleAction(modal._id, { portfolioApproved: false })}>Revoke Portfolio Approval</button>
              ) : (
                <button className="success" onClick={() => handleAction(modal._id, { portfolioApproved: true })}>Approve Portfolio</button>
              )}
            </div>

            <button className="as-cancel" onClick={() => setModal(null)}>Close</button>
          </div>
        </div>
      )}
    </>
  );
};

export default AdminSpecialists;
