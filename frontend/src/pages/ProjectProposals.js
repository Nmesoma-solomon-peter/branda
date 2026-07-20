import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axios';

const formatCurrency = (amount) => {
  if (!amount) return 'Not set';
  return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 }).format(amount);
};

const ProjectProposals = () => {
  const { id } = useParams();
  const [proposals, setProposals] = useState([]);
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    Promise.all([
      api.get(`/projects/${id}`),
      api.get(`/proposals/project/${id}`)
    ]).then(([projectRes, proposalsRes]) => {
      setProject(projectRes.data.project);
      setProposals(proposalsRes.data.proposals);
    }).catch(() => {}).finally(() => setLoading(false));
  }, [id]);

  const handleAccept = async (proposalId) => {
    setActionLoading(proposalId);
    try {
      const res = await api.put(`/proposals/${proposalId}/accept`);
      setProposals(prev => prev.map(p => ({
        ...p,
        status: p._id === proposalId ? 'accepted' : p.status === 'pending' ? 'rejected' : p.status
      })));
      if (res.data.project) setProject(res.data.project);
    } catch {
      // silent
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (proposalId) => {
    setActionLoading(proposalId);
    try {
      await api.put(`/proposals/${proposalId}/reject`);
      setProposals(prev => prev.map(p =>
        p._id === proposalId ? { ...p, status: 'rejected' } : p
      ));
    } catch {
      // silent
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) return <div style={{ padding: '100px 32px', textAlign: 'center', color: 'var(--gray-400)' }}>Loading...</div>;
  if (!project) return <div style={{ padding: '100px 32px', textAlign: 'center', color: 'var(--gray-400)' }}>Project not found</div>;

  const pending = proposals.filter(p => p.status === 'pending');
  const decided = proposals.filter(p => p.status !== 'pending');

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '100px 32px 60px' }}>
      <Link to={`/projects/${id}`} style={{ color: 'var(--green)', fontSize: 13, textDecoration: 'none', display: 'inline-block', marginBottom: 16 }}>
        &larr; Back to Project
      </Link>

      <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 28, fontWeight: 700, margin: '0 0 4px' }}>Proposals</h1>
      <p style={{ color: 'var(--gray-500)', marginBottom: 24, fontSize: 15 }}>
        {project.title} &bull; {project.status} &bull; Budget: {formatCurrency(project.budget)}
      </p>

      {pending.length > 0 && (
        <>
          <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>Pending Proposals ({pending.length})</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 32 }}>
            {pending.map(p => (
              <div key={p._id} style={{ background: 'var(--white)', border: '1px solid var(--gray-200)', borderRadius: 'var(--radius)', padding: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--green)', color: 'var(--white)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 700 }}>
                      {p.specialist?.name?.charAt(0) || '?'}
                    </div>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600 }}>{p.specialist?.name}</div>
                      <div style={{ fontSize: 12, color: 'var(--gray-400)' }}>{p.specialist?.location || 'Location not set'}</div>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--green)' }}>{formatCurrency(p.bidAmount)}</div>
                    <div style={{ fontSize: 12, color: 'var(--gray-400)' }}>{p.timeline} days</div>
                  </div>
                </div>
                <p style={{ fontSize: 14, color: 'var(--gray-600)', lineHeight: 1.6, margin: '0 0 16px' }}>{p.coverLetter}</p>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    onClick={() => handleAccept(p._id)}
                    disabled={actionLoading === p._id}
                    style={{
                      padding: '8px 20px', background: 'var(--green)', color: 'var(--white)',
                      border: 'none', borderRadius: 6, fontWeight: 600, fontSize: 13,
                      cursor: actionLoading === p._id ? 'not-allowed' : 'pointer', fontFamily: 'var(--font-body)'
                    }}
                  >{actionLoading === p._id ? 'Processing...' : 'Accept'}</button>
                  <button
                    onClick={() => handleReject(p._id)}
                    disabled={actionLoading === p._id}
                    style={{
                      padding: '8px 20px', background: 'var(--white)', color: '#DC2626',
                      border: '1px solid #FCA5A5', borderRadius: 6, fontWeight: 600, fontSize: 13,
                      cursor: actionLoading === p._id ? 'not-allowed' : 'pointer', fontFamily: 'var(--font-body)'
                    }}
                  >Reject</button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {decided.length > 0 && (
        <>
          <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16, color: 'var(--gray-400)' }}>Reviewed</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {decided.map(p => (
              <div key={p._id} style={{ background: 'var(--gray-50)', border: '1px solid var(--gray-200)', borderRadius: 'var(--radius)', padding: 16, opacity: 0.7 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--gray-300)', color: 'var(--white)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700 }}>
                      {p.specialist?.name?.charAt(0) || '?'}
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 500 }}>{p.specialist?.name}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <span style={{ fontSize: 14, fontWeight: 600 }}>{formatCurrency(p.bidAmount)}</span>
                    <span style={{
                      fontSize: 12, padding: '2px 10px', borderRadius: 10,
                      background: p.status === 'accepted' ? '#ECFDF5' : '#FEF2F2',
                      color: p.status === 'accepted' ? 'var(--green)' : '#DC2626', fontWeight: 600
                    }}>
                      {p.status}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {proposals.length === 0 && (
        <div style={{ textAlign: 'center', padding: 60, color: 'var(--gray-400)', background: 'var(--gray-50)', borderRadius: 'var(--radius)' }}>
          <p>No proposals yet for this project</p>
        </div>
      )}
    </div>
  );
};

export default ProjectProposals;
