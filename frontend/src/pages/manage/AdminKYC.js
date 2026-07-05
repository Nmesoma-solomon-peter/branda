import React, { useState, useEffect } from 'react';
import api from '../../api/axios';

const AdminKYC = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending');
  const [selected, setSelected] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [processing, setProcessing] = useState(null);

  useEffect(() => { loadUsers(); }, [filter]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadUsers = async () => {
    setLoading(true);
    try {
      const endpoint = filter === 'all' ? '/admin/kyc/all' : '/admin/kyc/pending';
      const res = await api.get(endpoint);
      setUsers(res.data.users);
    } catch {} finally { setLoading(false); }
  };

  const handleReview = async (userId, action) => {
    setProcessing(userId);
    try {
      await api.put(`/admin/kyc/${userId}/review`, {
        action,
        rejectionReason: action === 'rejected' ? rejectReason : undefined
      });
      setUsers(prev => prev.map(u => u._id === userId ? { ...u, kyc: { ...u.kyc, status: action } } : u));
      setSelected(null);
      setRejectReason('');
      if (filter === 'pending') loadUsers();
    } catch {} finally { setProcessing(null); }
  };

  const statusColor = (s) => {
    if (s === 'approved') return { bg: '#ECFDF5', color: '#059669', border: '#A7F3D0' };
    if (s === 'pending') return { bg: '#FEF3C7', color: '#D97706', border: '#FDE68A' };
    if (s === 'rejected') return { bg: '#FEF2F2', color: '#DC2626', border: '#FECACA' };
    return { bg: 'var(--gray-100)', color: 'var(--gray-500)', border: 'var(--gray-200)' };
  };

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 20, fontWeight: 700, margin: 0 }}>KYC Verification</h3>
        <div style={{ display: 'flex', gap: 6 }}>
          {['pending', 'all'].map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{
              padding: '6px 14px', borderRadius: 6, fontSize: 13, fontWeight: 500, cursor: 'pointer',
              border: `1px solid ${filter === f ? 'var(--green)' : 'var(--gray-300)'}`,
              background: filter === f ? 'var(--green-light)' : 'var(--white)',
              fontFamily: 'var(--font-body)', textTransform: 'capitalize'
            }}>{f === 'pending' ? 'Pending' : 'All Designers'}</button>
          ))}
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 40, color: 'var(--gray-400)' }}>Loading...</div>
      ) : users.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 40, color: 'var(--gray-400)', fontSize: 14 }}>
          No {filter === 'pending' ? 'pending' : ''} KYC submissions found.
        </div>
      ) : (
        <div style={{ display: 'grid', gap: 12 }}>
          {users.map(u => {
            const st = statusColor(u.kyc?.status);
            return (
              <div key={u._id} style={{
                background: 'var(--white)', border: '1px solid var(--gray-200)',
                borderRadius: 'var(--radius)', padding: 20
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
                  <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
                    <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'var(--gray-100)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      {u.profileImage ? (
                        <img src={u.profileImage} alt={u.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <span style={{ fontWeight: 700, color: 'var(--gray-400)' }}>{u.name?.[0]?.toUpperCase()}</span>
                      )}
                    </div>
                    <div>
                      <h4 style={{ fontSize: 15, fontWeight: 600, margin: 0 }}>{u.name}</h4>
                      <p style={{ fontSize: 13, color: 'var(--gray-400)', margin: '2px 0 0' }}>{u.email}</p>
                      <p style={{ fontSize: 12, color: 'var(--gray-400)', margin: '2px 0 0' }}>
                        {u.kyc?.idType?.toUpperCase()} - {u.kyc?.idNumber}
                      </p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <span style={{
                      fontSize: 12, fontWeight: 500, padding: '3px 10px', borderRadius: 100,
                      background: st.bg, color: st.color, border: `1px solid ${st.border}`,
                      textTransform: 'capitalize'
                    }}>{u.kyc?.status}</span>
                    {u.kyc?.status === 'pending' && (
                      <button onClick={() => setSelected(u)} style={{
                        padding: '6px 14px', borderRadius: 6, fontSize: 13, fontWeight: 500,
                        background: 'var(--green)', color: 'var(--white)', border: 'none',
                        cursor: 'pointer', fontFamily: 'var(--font-body)'
                      }}>Review</button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {selected && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 100,
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20
        }} onClick={() => setSelected(null)}>
          <div style={{
            background: 'var(--white)', borderRadius: 'var(--radius)', padding: 24,
            maxWidth: 500, width: '100%', maxHeight: '90vh', overflow: 'auto'
          }} onClick={e => e.stopPropagation()}>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 18, fontWeight: 700, marginBottom: 16 }}>
              Review KYC - {selected.name}
            </h3>

            <div style={{ display: 'grid', gap: 12, marginBottom: 20 }}>
              <div>
                <span style={{ fontSize: 12, color: 'var(--gray-400)' }}>Full Name</span>
                <p style={{ fontSize: 14, fontWeight: 500, margin: '2px 0 0' }}>{selected.kyc?.fullName}</p>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <span style={{ fontSize: 12, color: 'var(--gray-400)' }}>Date of Birth</span>
                  <p style={{ fontSize: 14, fontWeight: 500, margin: '2px 0 0' }}>{selected.kyc?.dateOfBirth}</p>
                </div>
                <div>
                  <span style={{ fontSize: 12, color: 'var(--gray-400)' }}>ID Type</span>
                  <p style={{ fontSize: 14, fontWeight: 500, margin: '2px 0 0', textTransform: 'uppercase' }}>{selected.kyc?.idType}</p>
                </div>
              </div>
              <div>
                <span style={{ fontSize: 12, color: 'var(--gray-400)' }}>ID Number</span>
                <p style={{ fontSize: 14, fontWeight: 500, margin: '2px 0 0' }}>{selected.kyc?.idNumber}</p>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 20 }}>
              {[
                { key: 'idImageFront', label: 'ID Front' },
                { key: 'idImageBack', label: 'ID Back' },
                { key: 'selfieWithId', label: 'Selfie with ID' }
              ].map(({ key, label }) => (
                <div key={key}>
                  <span style={{ fontSize: 12, color: 'var(--gray-400)', display: 'block', marginBottom: 4 }}>{label}</span>
                  {selected.kyc?.[key] ? (
                    <img src={selected.kyc[key]} alt={label} style={{
                      width: '100%', height: 100, objectFit: 'cover', borderRadius: 6,
                      border: '1px solid var(--gray-200)', cursor: 'pointer'
                    }} onClick={() => window.open(selected.kyc[key], '_blank')} />
                  ) : (
                    <div style={{ width: '100%', height: 100, background: 'var(--gray-100)', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, color: 'var(--gray-400)' }}>Not uploaded</div>
                  )}
                </div>
              ))}
            </div>

            {selected.kyc?.status === 'rejected' && selected.kyc?.rejectionReason && (
              <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 6, padding: 12, marginBottom: 16 }}>
                <p style={{ fontSize: 13, color: '#DC2626', margin: 0 }}>Previous rejection: {selected.kyc.rejectionReason}</p>
              </div>
            )}

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: 'var(--gray-500)', marginBottom: 6 }}>Rejection Reason (required if rejecting)</label>
              <input className="form-input" value={rejectReason} onChange={e => setRejectReason(e.target.value)}
                placeholder="Reason for rejection..." style={{ width: '100%' }} />
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => handleReview(selected._id, 'approved')} disabled={processing === selected._id}
                style={{
                  flex: 1, padding: '10px 16px', borderRadius: 6, fontSize: 14, fontWeight: 500,
                  background: '#059669', color: 'var(--white)', border: 'none', cursor: 'pointer',
                  fontFamily: 'var(--font-body)', opacity: processing === selected._id ? 0.6 : 1
                }}>
                {processing === selected._id ? 'Processing...' : 'Approve'}
              </button>
              <button onClick={() => handleReview(selected._id, 'rejected')} disabled={processing === selected._id || !rejectReason}
                style={{
                  flex: 1, padding: '10px 16px', borderRadius: 6, fontSize: 14, fontWeight: 500,
                  background: '#DC2626', color: 'var(--white)', border: 'none', cursor: 'pointer',
                  fontFamily: 'var(--font-body)', opacity: processing === selected._id || !rejectReason ? 0.6 : 1
                }}>
                Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AdminKYC;
