import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import ConfirmModal from '../../components/common/ConfirmModal';

const statusColors = {
  active: '#6f9c3e',
  in_review: '#F59E0B',
  completed: '#3B82F6',
  revision: '#DC2626',
  pending: '#9CA3AF'
};

const statusLabels = {
  active: 'Active',
  in_review: 'In Review',
  completed: 'Completed',
  revision: 'Revision',
  pending: 'Pending'
};

const CardSkeleton = () => (
  <div style={{
    background: 'var(--white)', border: '1px solid var(--gray-200)',
    borderRadius: 'var(--radius)', padding: 24,
    animation: 'pulse 1.5s ease-in-out infinite'
  }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
      <div style={{ flex: 1 }}>
        <div style={{ height: 18, background: 'var(--gray-100)', borderRadius: 4, width: '60%', marginBottom: 8 }} />
        <div style={{ height: 12, background: 'var(--gray-100)', borderRadius: 4, width: '40%' }} />
      </div>
      <div style={{ height: 24, width: 80, background: 'var(--gray-100)', borderRadius: 100 }} />
    </div>
    <div style={{ display: 'flex', gap: 16, marginTop: 16 }}>
      <div style={{ flex: 1 }}>
        <div style={{ height: 10, background: 'var(--gray-100)', borderRadius: 4, width: '50%', marginBottom: 6 }} />
        <div style={{ height: 36, background: 'var(--gray-100)', borderRadius: 6 }} />
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ height: 10, background: 'var(--gray-100)', borderRadius: 4, width: '50%', marginBottom: 6 }} />
        <div style={{ height: 36, background: 'var(--gray-100)', borderRadius: 6 }} />
      </div>
    </div>
  </div>
);

const SummarySkeleton = () => (
  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 28 }}>
    {[1, 2, 3, 4].map(i => (
      <div key={i} style={{
        background: 'var(--white)', border: '1px solid var(--gray-200)',
        borderRadius: 'var(--radius)', padding: 20, animation: 'pulse 1.5s ease-in-out infinite'
      }}>
        <div style={{ height: 12, background: 'var(--gray-100)', borderRadius: 4, width: '50%', marginBottom: 8 }} />
        <div style={{ height: 28, background: 'var(--gray-100)', borderRadius: 4, width: '40%' }} />
      </div>
    ))}
  </div>
);

const AdminProjects = () => {
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [assignModal, setAssignModal] = useState({ open: false, projectId: null });
  const [selectedSpecialist, setSelectedSpecialist] = useState('');
  const [assigning, setAssigning] = useState(false);
  const [statusUpdating, setStatusUpdating] = useState(null);
  const [deleteModal, setDeleteModal] = useState({ open: false, projectId: null });
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    Promise.all([api.get('/admin/projects'), api.get('/admin/users')])
      .then(([p, u]) => { setProjects(p.data.projects); setUsers(u.data.users); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const specialists = users.filter(u => u.role === 'specialist');
  const statusOptions = ['pending', 'active', 'in_review', 'revision', 'completed'];

  const filtered = projects.filter(p =>
    p.title?.toLowerCase().includes(search.toLowerCase()) ||
    p.owner?.name?.toLowerCase().includes(search.toLowerCase())
  );

  const totalProjects = projects.length;
  const activeCount = projects.filter(p => p.status === 'active').length;
  const inReviewCount = projects.filter(p => p.status === 'in_review').length;
  const completedCount = projects.filter(p => p.status === 'completed').length;

  const openAssignModal = (projectId, currentSpecialistId) => {
    setSelectedSpecialist(currentSpecialistId || '');
    setAssignModal({ open: true, projectId });
  };

  const handleAssign = async () => {
    if (!assignModal.projectId) return;
    setAssigning(true);
    try {
      const res = await api.put(`/admin/projects/${assignModal.projectId}/assign`, { specialistId: selectedSpecialist });
      setProjects(prev => prev.map(p => p._id === assignModal.projectId ? res.data.project : p));
      setAssignModal({ open: false, projectId: null });
      setSelectedSpecialist('');
    } catch {} finally { setAssigning(false); }
  };

  const handleStatus = async (projectId, status) => {
    setStatusUpdating(projectId);
    try {
      const res = await api.put(`/admin/projects/${projectId}/status`, { status });
      setProjects(prev => prev.map(p => p._id === projectId ? res.data.project : p));
    } catch {} finally { setStatusUpdating(null); }
  };

  const handleDelete = async () => {
    if (!deleteModal.projectId) return;
    setDeleting(true);
    try {
      await api.delete(`/admin/projects/${deleteModal.projectId}`);
      setProjects(prev => prev.filter(p => p._id !== deleteModal.projectId));
      setDeleteModal({ open: false, projectId: null });
    } catch {} finally { setDeleting(false); }
  };

  return (
    <div style={{ fontFamily: 'var(--font-body)' }}>
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.6; }
        }
      `}</style>

      {loading ? (
        <>
          <SummarySkeleton />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 16 }}>
            {[1, 2, 3, 4, 5, 6].map(i => <CardSkeleton key={i} />)}
          </div>
        </>
      ) : (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 28 }}>
            {[
              { label: 'Total Projects', value: totalProjects, color: 'var(--gray-600)' },
              { label: 'Active', value: activeCount, color: statusColors.active },
              { label: 'In Review', value: inReviewCount, color: statusColors.in_review },
              { label: 'Completed', value: completedCount, color: statusColors.completed }
            ].map(card => (
              <div key={card.label} style={{
                background: 'var(--white)', border: '1px solid var(--gray-200)',
                borderRadius: 'var(--radius)', padding: 20
              }}>
                <p style={{ fontSize: 12, color: 'var(--gray-400)', margin: 0, textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: 500 }}>
                  {card.label}
                </p>
                <p style={{ fontSize: 28, fontWeight: 700, color: card.color, margin: '6px 0 0', fontFamily: 'var(--font-heading)' }}>
                  {card.value}
                </p>
              </div>
            ))}
          </div>

          <div style={{ marginBottom: 20 }}>
            <input
              type="text"
              placeholder="Search by title or owner..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="form-input"
              style={{ width: 300, padding: '10px 14px', fontSize: 13 }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 16 }}>
            {filtered.map(project => {
              const sc = statusColors[project.status] || statusColors.pending;
              return (
                <div key={project._id} style={{
                  background: 'var(--white)', border: '1px solid var(--gray-200)',
                  borderRadius: 'var(--radius)', padding: 24,
                  display: 'flex', flexDirection: 'column', gap: 16
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <h4 style={{ fontFamily: 'var(--font-heading)', fontSize: 16, fontWeight: 700, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {project.title}
                      </h4>
                      <p style={{ fontSize: 13, color: 'var(--gray-400)', margin: '4px 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        Owner: {project.owner?.name || 'Unknown'}
                      </p>
                      <p style={{ fontSize: 12, color: 'var(--gray-400)', margin: '2px 0 0' }}>
                        Specialist: {project.assignedSpecialist?.name || 'Unassigned'}
                      </p>
                      <p style={{ fontSize: 12, color: 'var(--gray-400)', margin: '2px 0 0' }}>
                        {new Date(project.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <span style={{
                      fontSize: 12, fontWeight: 600, padding: '4px 12px',
                      borderRadius: 100, background: `${sc}18`, color: sc,
                      whiteSpace: 'nowrap', flexShrink: 0
                    }}>
                      {statusLabels[project.status] || project.status}
                    </span>
                  </div>

                  <div style={{ borderTop: '1px solid var(--gray-200)', paddingTop: 14, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <button
                      onClick={() => openAssignModal(project._id, project.assignedSpecialist?._id || '')}
                      style={{
                        padding: '7px 14px', borderRadius: 6, fontSize: 13, fontWeight: 500,
                        border: '1px solid var(--gray-300)', background: 'var(--white)',
                        color: 'var(--gray-600)', cursor: 'pointer', fontFamily: 'var(--font-body)'
                      }}
                    >
                      Assign Specialist
                    </button>

                    <select
                      value={project.status}
                      onChange={e => handleStatus(project._id, e.target.value)}
                      disabled={statusUpdating === project._id}
                      className="form-input"
                      style={{
                        padding: '7px 14px', borderRadius: 6, fontSize: 13,
                        border: '1px solid var(--gray-300)', background: 'var(--white)',
                        color: 'var(--gray-600)', cursor: 'pointer', fontFamily: 'var(--font-body)',
                        appearance: 'auto', paddingRight: 28
                      }}
                    >
                      {statusOptions.map(s => (
                        <option key={s} value={s}>{statusLabels[s]}</option>
                      ))}
                    </select>

                    <button
                      onClick={() => setDeleteModal({ open: true, projectId: project._id })}
                      style={{
                        padding: '7px 14px', borderRadius: 6, fontSize: 13, fontWeight: 500,
                        border: '1px solid #FECACA', background: '#FEF2F2',
                        color: '#DC2626', cursor: 'pointer', fontFamily: 'var(--font-body)'
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {filtered.length === 0 && (
            <div style={{
              textAlign: 'center', padding: '60px 20px', color: 'var(--gray-400)',
              fontSize: 14, background: 'var(--white)', borderRadius: 'var(--radius)',
              border: '1px solid var(--gray-200)'
            }}>
              No projects found matching your search.
            </div>
          )}
        </>
      )}

      {assignModal.open && (
        <div onClick={() => { setAssignModal({ open: false, projectId: null }); setSelectedSpecialist(''); }} style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 200,
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20
        }}>
          <div onClick={e => e.stopPropagation()} style={{
            background: 'var(--white)', borderRadius: 'var(--radius)', padding: 28,
            maxWidth: 420, width: '100%', boxShadow: '0 20px 60px rgba(0,0,0,0.2)'
          }}>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 18, fontWeight: 700, marginBottom: 8 }}>
              Assign Specialist
            </h3>
            <p style={{ fontSize: 14, color: 'var(--gray-500)', marginBottom: 20, lineHeight: 1.6 }}>
              Select a specialist to assign to this project.
            </p>
            <select
              value={selectedSpecialist}
              onChange={e => setSelectedSpecialist(e.target.value)}
              className="form-input"
              style={{ width: '100%', fontSize: 13, padding: '8px 12px', marginBottom: 20 }}
            >
              <option value="">Unassigned</option>
              {specialists.map(s => (
                <option key={s._id} value={s._id}>{s.name}</option>
              ))}
            </select>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button onClick={() => { setAssignModal({ open: false, projectId: null }); setSelectedSpecialist(''); }} style={{
                padding: '8px 18px', borderRadius: 6, fontSize: 14, fontWeight: 500,
                border: '1px solid var(--gray-300)', background: 'var(--white)',
                color: 'var(--gray-600)', cursor: 'pointer', fontFamily: 'var(--font-body)'
              }}>Cancel</button>
              <button onClick={handleAssign} disabled={assigning} style={{
                padding: '8px 18px', borderRadius: 6, fontSize: 14, fontWeight: 500,
                border: 'none', background: 'var(--green)',
                color: 'var(--white)', cursor: 'pointer', fontFamily: 'var(--font-body)',
                opacity: assigning ? 0.6 : 1
              }}>{assigning ? 'Assigning...' : 'Confirm'}</button>
            </div>
          </div>
        </div>
      )}

      <ConfirmModal
        open={deleteModal.open}
        title="Delete Project"
        message="Are you sure you want to delete this project and all its files? This action cannot be undone."
        confirmText={deleting ? 'Deleting...' : 'Delete Project'}
        cancelText="Cancel"
        onConfirm={handleDelete}
        onCancel={() => setDeleteModal({ open: false, projectId: null })}
        danger
      />
    </div>
  );
};

export default AdminProjects;
