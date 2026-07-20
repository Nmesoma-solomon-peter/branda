import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import ProjectStatusBadge from './ProjectStatusBadge';
import AssetGallery from '../assets/AssetGallery';
import FileUpload from '../assets/FileUpload';

const formatCurrency = (amount) => {
  if (!amount) return 'Not set';
  return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 }).format(amount);
};

const daysUntil = (dateStr) => {
  if (!dateStr) return null;
  const diff = Math.ceil((new Date(dateStr) - new Date()) / (1000 * 60 * 60 * 24));
  return diff;
};

const ProjectDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [project, setProject] = useState(null);
  const [assets, setAssets] = useState([]);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusLoading, setStatusLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Revision request state
  const [revisionNote, setRevisionNote] = useState('');
  const [revisionLoading, setRevisionLoading] = useState(false);
  const [showRevisionForm, setShowRevisionForm] = useState(false);

  // Accept/decline state
  const [acceptLoading, setAcceptLoading] = useState(false);

  // Comment state
  const [commentText, setCommentText] = useState('');
  const [commentLoading, setCommentLoading] = useState(false);

  // Payment state
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [payments, setPayments] = useState([]);
  const [showPaymentForm, setShowPaymentForm] = useState(false);

  // Dispute state
  const [disputeLoading, setDisputeLoading] = useState(false);
  const [showDisputeModal, setShowDisputeModal] = useState(false);

  const fetchData = async () => {
    try {
      const res = await api.get(`/projects/${id}`);
      setProject(res.data.project);
      setAssets(res.data.assets || []);
      setComments(res.data.comments || []);
      if (res.data.project.budget && !paymentAmount) {
        setPaymentAmount(String(res.data.project.budget));
      }
    } catch {
      setError('Failed to load project');
    } finally {
      setLoading(false);
    }
  };

  const fetchPayments = async () => {
    try {
      const res = await api.get(`/payments/project/${id}`);
      setPayments(res.data.payments || []);
    } catch {
      // silent
    }
  };

  useEffect(() => {
    fetchData();
    fetchPayments();
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  const isOwner = project && user && project.owner._id === user.id;
  const isSpecialist = project && user && project.assignedSpecialist && project.assignedSpecialist._id === user.id;
  const isAdmin = user && user.role === 'admin';

  const handleStatusUpdate = async (newStatus) => {
    setStatusLoading(true);
    try {
      await api.put(`/projects/${id}/status`, { status: newStatus });
      setProject(prev => ({ ...prev, status: newStatus }));
    } catch {
      // silent
    } finally {
      setStatusLoading(false);
    }
  };

  const handleDelete = async () => {
    setDeleteLoading(true);
    try {
      await api.delete(`/projects/${id}`);
      navigate('/dashboard');
    } catch {
      // silent
    } finally {
      setDeleteLoading(false);
      setShowDeleteModal(false);
    }
  };

  const handleRevisionRequest = async () => {
    if (!revisionNote.trim()) return;
    setRevisionLoading(true);
    try {
      await api.put(`/projects/${id}/revision`, { revisionNote });
      setProject(prev => ({ ...prev, status: 'revision', revisionNote }));
      setShowRevisionForm(false);
      setRevisionNote('');
    } catch {
      // silent
    } finally {
      setRevisionLoading(false);
    }
  };

  const handleAcceptDecline = async (action) => {
    setAcceptLoading(true);
    try {
      await api.put(`/projects/${id}/accept`, { action });
      setProject(prev => ({ ...prev, acceptanceStatus: action }));
    } catch {
      // silent
    } finally {
      setAcceptLoading(false);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    setCommentLoading(true);
    try {
      const res = await api.post(`/projects/${id}/comments`, { text: commentText });
      setComments(prev => [res.data.comment, ...prev]);
      setCommentText('');
    } catch {
      // silent
    } finally {
      setCommentLoading(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      await api.delete(`/projects/comments/${commentId}`);
      setComments(prev => prev.filter(c => c._id !== commentId));
    } catch {
      // silent
    }
  };

  const handleInitiatePayment = async () => {
    if (!paymentAmount || Number(paymentAmount) <= 0) return;
    setPaymentLoading(true);
    try {
      const res = await api.post('/payments/initiate', {
        projectId: id,
        amount: Number(paymentAmount)
      });
      if (res.data.authorizationUrl) {
        window.open(res.data.authorizationUrl, '_blank');
      }
      fetchPayments();
      setShowPaymentForm(false);
    } catch {
      // silent
    } finally {
      setPaymentLoading(false);
    }
  };

  const handleDispute = async () => {
    setDisputeLoading(true);
    try {
      await api.put(`/projects/${id}/dispute`);
      setProject(prev => ({ ...prev, status: 'dispute' }));
      setShowDisputeModal(false);
    } catch {
      // silent
    } finally {
      setDisputeLoading(false);
    }
  };

  const handleVerifyPayment = async (reference) => {
    try {
      await api.get(`/payments/verify/${reference}`);
      fetchPayments();
    } catch {
      // silent
    }
  };

  if (loading) return <div style={{ padding: 40, textAlign: 'center', fontFamily: 'var(--font-body)' }}>Loading...</div>;
  if (error) return <div style={{ padding: 40, textAlign: 'center', color: '#DC2626', fontFamily: 'var(--font-body)' }}>{error}</div>;
  if (!project) return <div style={{ padding: 40, textAlign: 'center', fontFamily: 'var(--font-body)' }}>Project not found</div>;

  const remaining = daysUntil(project.deadline);
  const successfulPaymentTotal = payments.filter(p => p.status === 'success').reduce((sum, p) => sum + p.amount, 0);

  return (
    <div style={{ maxWidth: 800, fontFamily: 'var(--font-body)' }}>
      {/* Delete Modal */}
      {showDeleteModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }}>
          <div style={{ background: 'var(--white)', borderRadius: 'var(--radius)', padding: 32, maxWidth: 400, width: '100%', textAlign: 'center' }}>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 20, fontWeight: 700, marginBottom: 12 }}>Delete Project</h3>
            <p style={{ fontSize: 15, color: 'var(--gray-500)', marginBottom: 24, lineHeight: 1.6 }}>
              Are you sure you want to delete this project? This will remove all uploaded files and cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: 12 }}>
              <button onClick={() => setShowDeleteModal(false)} disabled={deleteLoading} style={{ flex: 1, padding: '10px 16px', borderRadius: 'var(--radius)', border: '1px solid var(--gray-300)', background: 'var(--white)', fontSize: 14, fontWeight: 500, cursor: 'pointer', fontFamily: 'var(--font-body)' }}>Cancel</button>
              <button onClick={handleDelete} disabled={deleteLoading} style={{ flex: 1, padding: '10px 16px', borderRadius: 'var(--radius)', border: 'none', background: '#DC2626', color: 'var(--white)', fontSize: 14, fontWeight: 500, cursor: 'pointer', opacity: deleteLoading ? 0.6 : 1, fontFamily: 'var(--font-body)' }}>{deleteLoading ? 'Deleting...' : 'Delete'}</button>
            </div>
          </div>
        </div>
      )}

      {/* Dispute Modal */}
      {showDisputeModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }}>
          <div style={{ background: 'var(--white)', borderRadius: 'var(--radius)', padding: 32, maxWidth: 400, width: '100%', textAlign: 'center' }}>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 20, fontWeight: 700, marginBottom: 12 }}>Report Issue</h3>
            <p style={{ fontSize: 15, color: 'var(--gray-500)', marginBottom: 24, lineHeight: 1.6 }}>
              Are you sure you want to flag this project for dispute? An admin will review the case and mediate.
            </p>
            <div style={{ display: 'flex', gap: 12 }}>
              <button onClick={() => setShowDisputeModal(false)} disabled={disputeLoading} style={{ flex: 1, padding: '10px 16px', borderRadius: 'var(--radius)', border: '1px solid var(--gray-300)', background: 'var(--white)', fontSize: 14, fontWeight: 500, cursor: 'pointer', fontFamily: 'var(--font-body)' }}>Cancel</button>
              <button onClick={handleDispute} disabled={disputeLoading} style={{ flex: 1, padding: '10px 16px', borderRadius: 'var(--radius)', border: 'none', background: '#D97706', color: 'var(--white)', fontSize: 14, fontWeight: 500, cursor: 'pointer', opacity: disputeLoading ? 0.6 : 1, fontFamily: 'var(--font-body)' }}>{disputeLoading ? 'Submitting...' : 'Report Issue'}</button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 28, fontWeight: 700, marginBottom: 8 }}>{project.title}</h2>
          <ProjectStatusBadge status={project.status} />
        </div>
        <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
          {isOwner && (
            <button onClick={() => setShowDeleteModal(true)} style={{ background: 'none', border: '1px solid var(--gray-300)', borderRadius: 'var(--radius)', padding: '8px 16px', fontSize: 13, color: '#DC2626', cursor: 'pointer', fontFamily: 'var(--font-body)' }}>
              Delete
            </button>
          )}
        </div>
      </div>

      {/* Description */}
      <div style={{ background: 'var(--gray-50)', borderRadius: 'var(--radius)', padding: 24, marginBottom: 24 }}>
        <h4 style={{ fontSize: 14, fontWeight: 500, color: 'var(--gray-500)', marginBottom: 8 }}>Description</h4>
        <p style={{ fontSize: 15, lineHeight: 1.7 }}>{project.description}</p>
      </div>

      {/* Project Info Grid */}
      <div className="project-detail-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
        <div style={{ background: 'var(--gray-50)', borderRadius: 'var(--radius)', padding: 20 }}>
          <h4 style={{ fontSize: 13, fontWeight: 500, color: 'var(--gray-400)', marginBottom: 4 }}>Industry</h4>
          <p style={{ fontSize: 15 }}>{project.industry}</p>
        </div>
        <div style={{ background: 'var(--gray-50)', borderRadius: 'var(--radius)', padding: 20 }}>
          <h4 style={{ fontSize: 13, fontWeight: 500, color: 'var(--gray-400)', marginBottom: 4 }}>Color Preferences</h4>
          <p style={{ fontSize: 15 }}>{project.colorPreferences || 'None specified'}</p>
        </div>
        <div style={{ background: 'var(--gray-50)', borderRadius: 'var(--radius)', padding: 20 }}>
          <h4 style={{ fontSize: 13, fontWeight: 500, color: 'var(--gray-400)', marginBottom: 4 }}>Budget</h4>
          <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--green)' }}>{formatCurrency(project.budget)}</p>
        </div>
        <div style={{ background: 'var(--gray-50)', borderRadius: 'var(--radius)', padding: 20 }}>
          <h4 style={{ fontSize: 13, fontWeight: 500, color: 'var(--gray-400)', marginBottom: 4 }}>Deadline</h4>
          {project.deadline ? (
            <p style={{ fontSize: 15, fontWeight: remaining !== null && remaining <= 3 ? 600 : 400, color: remaining !== null && remaining <= 0 ? '#DC2626' : remaining !== null && remaining <= 3 ? '#D97706' : 'var(--black)' }}>
              {new Date(project.deadline).toLocaleDateString('en-NG', { year: 'numeric', month: 'short', day: 'numeric' })}
              {remaining !== null && (
                <span style={{ fontSize: 12, marginLeft: 8, fontWeight: 500, color: remaining <= 0 ? '#DC2626' : 'var(--gray-400)' }}>
                  {remaining <= 0 ? 'Overdue' : `${remaining} day${remaining !== 1 ? 's' : ''} left`}
                </span>
              )}
            </p>
          ) : (
            <p style={{ fontSize: 15, color: 'var(--gray-400)' }}>Not set</p>
          )}
        </div>
      </div>

      {/* Assigned Specialist Info */}
      {project.assignedSpecialist && (
        <div style={{ background: 'var(--green-light)', borderRadius: 'var(--radius)', padding: 16, marginBottom: 24, display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--green)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--white)', fontWeight: 700, fontSize: 14, flexShrink: 0 }}>
            {project.assignedSpecialist.name?.[0]?.toUpperCase()}
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: 14, fontWeight: 600, margin: 0 }}>{project.assignedSpecialist.name}</p>
            <p style={{ fontSize: 12, color: 'var(--gray-500)', margin: 0 }}>Assigned Specialist</p>
          </div>
          <a href={`/specialists/${project.assignedSpecialist._id}`} style={{ fontSize: 13, fontWeight: 500, color: 'var(--green)', textDecoration: 'none' }}>View Profile</a>
        </div>
      )}

      {/* Revision Note Display */}
      {project.revisionNote && project.status === 'revision' && (
        <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 'var(--radius)', padding: 16, marginBottom: 24 }}>
          <h4 style={{ fontSize: 13, fontWeight: 600, color: '#DC2626', marginBottom: 4 }}>Revision Note</h4>
          <p style={{ fontSize: 14, color: '#7F1D1D', margin: 0 }}>{project.revisionNote}</p>
        </div>
      )}

      {/* Specialist Accept/Decline */}
      {isSpecialist && project.acceptanceStatus === 'pending' && (
        <div style={{ background: '#EEF2FF', border: '1px solid #C7D2FE', borderRadius: 'var(--radius)', padding: 20, marginBottom: 24 }}>
          <h4 style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>Project Assignment</h4>
          <p style={{ fontSize: 14, color: 'var(--gray-500)', marginBottom: 16 }}>You have been assigned this project. Please accept or decline.</p>
          <div style={{ display: 'flex', gap: 12 }}>
            <button onClick={() => handleAcceptDecline('accepted')} disabled={acceptLoading} style={{ padding: '10px 24px', borderRadius: 'var(--radius)', border: 'none', background: 'var(--green)', color: 'var(--white)', fontSize: 14, fontWeight: 600, cursor: acceptLoading ? 'not-allowed' : 'pointer', opacity: acceptLoading ? 0.6 : 1, fontFamily: 'var(--font-body)' }}>
              {acceptLoading ? 'Processing...' : 'Accept'}
            </button>
            <button onClick={() => handleAcceptDecline('declined')} disabled={acceptLoading} style={{ padding: '10px 24px', borderRadius: 'var(--radius)', border: '1px solid var(--gray-300)', background: 'var(--white)', fontSize: 14, fontWeight: 500, cursor: acceptLoading ? 'not-allowed' : 'pointer', opacity: acceptLoading ? 0.6 : 1, fontFamily: 'var(--font-body)' }}>
              Decline
            </button>
          </div>
        </div>
      )}

      {/* Files Section */}
      <div style={{ marginBottom: 24 }}>
        <h4 style={{ fontSize: 14, fontWeight: 500, color: 'var(--gray-500)', marginBottom: 12 }}>Uploaded Files</h4>
        <AssetGallery
          assets={assets}
          currentUser={user}
          projectOwnerId={project.owner._id}
          onDelete={(assetId) => setAssets(prev => prev.filter(a => a._id !== assetId))}
        />
      </div>

      {/* Upload Section */}
      {(isOwner || isSpecialist) && (
        <div style={{ marginBottom: 24 }}>
          <h4 style={{ fontSize: 14, fontWeight: 500, color: 'var(--gray-500)', marginBottom: 12 }}>
            {isSpecialist ? 'Upload Design Files' : 'Upload Reference Images'}
          </h4>
          <FileUpload projectId={id} onUploaded={fetchData} />
        </div>
      )}

      {/* Payment Section (SME only) */}
      {isOwner && project.budget > 0 && (
        <div style={{ background: 'var(--white)', border: '1px solid var(--gray-200)', borderRadius: 'var(--radius)', padding: 24, marginBottom: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h4 style={{ fontSize: 14, fontWeight: 600 }}>Payment</h4>
            <button onClick={() => setShowPaymentForm(!showPaymentForm)} style={{ padding: '6px 14px', borderRadius: 'var(--radius)', border: '1px solid var(--green)', background: 'var(--green-light)', color: 'var(--green)', fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: 'var(--font-body)' }}>
              {showPaymentForm ? 'Cancel' : 'Make Payment'}
            </button>
          </div>

          {/* Payment summary */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 16 }}>
            <div style={{ textAlign: 'center', padding: 12, background: 'var(--gray-50)', borderRadius: 'var(--radius)' }}>
              <p style={{ fontSize: 12, color: 'var(--gray-400)', margin: 0 }}>Total Budget</p>
              <p style={{ fontSize: 16, fontWeight: 700, color: 'var(--black)', margin: '4px 0 0' }}>{formatCurrency(project.budget)}</p>
            </div>
            <div style={{ textAlign: 'center', padding: 12, background: 'var(--gray-50)', borderRadius: 'var(--radius)' }}>
              <p style={{ fontSize: 12, color: 'var(--gray-400)', margin: 0 }}>Paid</p>
              <p style={{ fontSize: 16, fontWeight: 700, color: '#059669', margin: '4px 0 0' }}>{formatCurrency(successfulPaymentTotal)}</p>
            </div>
            <div style={{ textAlign: 'center', padding: 12, background: 'var(--gray-50)', borderRadius: 'var(--radius)' }}>
              <p style={{ fontSize: 12, color: 'var(--gray-400)', margin: 0 }}>Remaining</p>
              <p style={{ fontSize: 16, fontWeight: 700, color: project.budget - successfulPaymentTotal > 0 ? '#D97706' : '#059669', margin: '4px 0 0' }}>{formatCurrency(Math.max(0, project.budget - successfulPaymentTotal))}</p>
            </div>
          </div>

          {showPaymentForm && (
            <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end', padding: 16, background: 'var(--gray-50)', borderRadius: 'var(--radius)' }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 4 }}>Amount (NGN)</label>
                <input type="number" className="form-input" value={paymentAmount} onChange={e => setPaymentAmount(e.target.value)} min="1" style={{ width: '100%' }} />
              </div>
              <button onClick={handleInitiatePayment} disabled={paymentLoading || !paymentAmount} style={{ padding: '10px 20px', borderRadius: 'var(--radius)', border: 'none', background: 'var(--green)', color: 'var(--white)', fontSize: 14, fontWeight: 600, cursor: paymentLoading ? 'not-allowed' : 'pointer', opacity: paymentLoading || !paymentAmount ? 0.6 : 1, whiteSpace: 'nowrap', fontFamily: 'var(--font-body)' }}>
                {paymentLoading ? 'Processing...' : 'Pay with Paystack'}
              </button>
            </div>
          )}

          {/* Payment History */}
          {payments.length > 0 && (
            <div style={{ marginTop: 16 }}>
              <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--gray-500)', marginBottom: 8 }}>Payment History</p>
              {payments.map(p => (
                <div key={p._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid var(--gray-100)' }}>
                  <div>
                    <span style={{ fontSize: 14, fontWeight: 500 }}>{formatCurrency(p.amount)}</span>
                    <span style={{ fontSize: 12, color: 'var(--gray-400)', marginLeft: 8 }}>{new Date(p.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 12, fontWeight: 500, padding: '2px 8px', borderRadius: 100, background: p.status === 'success' ? '#ECFDF5' : p.status === 'pending' ? '#FEF3C7' : '#FEF2F2', color: p.status === 'success' ? '#059669' : p.status === 'pending' ? '#D97706' : '#DC2626', textTransform: 'capitalize' }}>
                      {p.status}
                    </span>
                    {p.status === 'pending' && (
                      <button onClick={() => handleVerifyPayment(p.reference)} style={{ fontSize: 12, color: 'var(--green)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 500 }}>Verify</button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Specialist Actions (Status Update) */}
      {isSpecialist && (
        <div style={{ borderTop: '1px solid var(--gray-200)', paddingTop: 20, marginBottom: 24 }}>
          <h4 style={{ fontSize: 14, fontWeight: 500, color: 'var(--gray-500)', marginBottom: 12 }}>Update Status</h4>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {['active', 'in_review', 'completed', 'revision'].map(s => (
              <button
                key={s}
                onClick={() => handleStatusUpdate(s)}
                disabled={statusLoading || project.status === s}
                style={{
                  padding: '8px 16px',
                  borderRadius: 'var(--radius)',
                  border: `1px solid ${project.status === s ? 'var(--green)' : 'var(--gray-300)'}`,
                  background: project.status === s ? 'var(--green-light)' : 'var(--white)',
                  fontSize: 13,
                  fontWeight: 500,
                  cursor: statusLoading ? 'not-allowed' : 'pointer',
                  opacity: statusLoading ? 0.6 : 1,
                  fontFamily: 'var(--font-body)',
                  textTransform: 'capitalize'
                }}
              >
                {s.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Revision Request (SME only, when status is in_review) */}
      {isOwner && project.status === 'in_review' && (
        <div style={{ background: '#FEF3C7', border: '1px solid #FDE68A', borderRadius: 'var(--radius)', padding: 20, marginBottom: 24 }}>
          <h4 style={{ fontSize: 14, fontWeight: 600, color: '#92400E', marginBottom: 8 }}>Review Deliverables</h4>
          <p style={{ fontSize: 14, color: '#78350F', marginBottom: 12 }}>The specialist has submitted their work. Please review and either approve or request revisions.</p>
          {!showRevisionForm ? (
            <div style={{ display: 'flex', gap: 12 }}>
              <button onClick={() => handleStatusUpdate('completed')} disabled={statusLoading} style={{ padding: '10px 20px', borderRadius: 'var(--radius)', border: 'none', background: 'var(--green)', color: 'var(--white)', fontSize: 14, fontWeight: 600, cursor: statusLoading ? 'not-allowed' : 'pointer', fontFamily: 'var(--font-body)' }}>
                Approve
              </button>
              <button onClick={() => setShowRevisionForm(true)} style={{ padding: '10px 20px', borderRadius: 'var(--radius)', border: '1px solid #D97706', background: 'var(--white)', color: '#D97706', fontSize: 14, fontWeight: 500, cursor: 'pointer', fontFamily: 'var(--font-body)' }}>
                Request Revision
              </button>
            </div>
          ) : (
            <div>
              <textarea className="form-input" value={revisionNote} onChange={e => setRevisionNote(e.target.value)} placeholder="Describe what needs to be changed..." rows={3} style={{ width: '100%', resize: 'vertical', marginBottom: 12 }} />
              <div style={{ display: 'flex', gap: 12 }}>
                <button onClick={handleRevisionRequest} disabled={revisionLoading || !revisionNote.trim()} style={{ padding: '10px 20px', borderRadius: 'var(--radius)', border: 'none', background: '#D97706', color: 'var(--white)', fontSize: 14, fontWeight: 500, cursor: revisionLoading || !revisionNote.trim() ? 'not-allowed' : 'pointer', opacity: revisionLoading || !revisionNote.trim() ? 0.6 : 1, fontFamily: 'var(--font-body)' }}>
                  {revisionLoading ? 'Submitting...' : 'Submit Revision Request'}
                </button>
                <button onClick={() => { setShowRevisionForm(false); setRevisionNote(''); }} style={{ padding: '10px 20px', borderRadius: 'var(--radius)', border: '1px solid var(--gray-300)', background: 'var(--white)', fontSize: 14, cursor: 'pointer', fontFamily: 'var(--font-body)' }}>
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Dispute Button (any participant) */}
      {(isOwner || isSpecialist) && project.status !== 'dispute' && project.status !== 'completed' && (
        <div style={{ marginBottom: 24 }}>
          <button onClick={() => setShowDisputeModal(true)} style={{ fontSize: 13, color: 'var(--gray-400)', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline', fontFamily: 'var(--font-body)' }}>
            Report an issue with this project
          </button>
        </div>
      )}

      {/* Comments Section */}
      <div style={{ borderTop: '1px solid var(--gray-200)', paddingTop: 24 }}>
        <h4 style={{ fontSize: 14, fontWeight: 600, marginBottom: 16 }}>Comments ({comments.length})</h4>

        {/* Add Comment Form */}
        {(isOwner || isSpecialist || isAdmin) && (
          <form onSubmit={handleAddComment} style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
            <input
              type="text"
              className="form-input"
              value={commentText}
              onChange={e => setCommentText(e.target.value)}
              placeholder="Add a comment..."
              disabled={commentLoading}
              style={{ flex: 1 }}
            />
            <button type="submit" disabled={commentLoading || !commentText.trim()} style={{ padding: '8px 16px', borderRadius: 'var(--radius)', border: 'none', background: 'var(--green)', color: 'var(--white)', fontSize: 13, fontWeight: 500, cursor: commentLoading || !commentText.trim() ? 'not-allowed' : 'pointer', opacity: commentLoading || !commentText.trim() ? 0.6 : 1, whiteSpace: 'nowrap', fontFamily: 'var(--font-body)' }}>
              {commentLoading ? 'Sending...' : 'Send'}
            </button>
          </form>
        )}

        {/* Comments List */}
        {comments.length === 0 ? (
          <p style={{ fontSize: 14, color: 'var(--gray-400)', textAlign: 'center', padding: 20 }}>No comments yet</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {comments.map(comment => (
              <div key={comment._id} style={{ display: 'flex', gap: 12, padding: 16, background: 'var(--gray-50)', borderRadius: 'var(--radius)' }}>
                <div style={{ width: 32, height: 32, borderRadius: '50%', background: comment.author?.role === 'sme' ? '#EEF2FF' : comment.author?.role === 'specialist' ? 'var(--green-light)' : 'var(--gray-200)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 13, fontWeight: 600, color: comment.author?.role === 'sme' ? '#4F46E5' : comment.author?.role === 'specialist' ? 'var(--green)' : 'var(--gray-500)' }}>
                  {comment.author?.name?.[0]?.toUpperCase() || '?'}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                    <span style={{ fontSize: 13, fontWeight: 600 }}>{comment.author?.name || 'Unknown'}</span>
                    <span style={{ fontSize: 12, color: 'var(--gray-400)' }}>{new Date(comment.createdAt).toLocaleDateString()}</span>
                  </div>
                  <p style={{ fontSize: 14, lineHeight: 1.6, margin: 0 }}>{comment.text}</p>
                </div>
                {(user?._id === comment.author?._id || user?.role === 'admin') && (
                  <button onClick={() => handleDeleteComment(comment._id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--gray-400)', fontSize: 12, padding: 4, alignSelf: 'flex-start', fontFamily: 'var(--font-body)' }}>
                    Delete
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectDetail;
