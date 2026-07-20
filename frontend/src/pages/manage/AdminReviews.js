import React, { useState, useEffect } from 'react';
import api from '../../api/axios';

const StarIcon = ({ filled }) => (
  <svg viewBox="0 0 24 24" fill={filled ? '#F59E0B' : 'none'} stroke={filled ? '#F59E0B' : '#D1D5DB'} strokeWidth="2" width="14" height="14">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
  </svg>
);

const AdminReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [flagged, setFlagged] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('all');
  const [deleting, setDeleting] = useState(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 20;

  const loadReviews = () => {
    return api.get('/admin/reviews', { params: { page, limit } })
      .then(res => {
        setReviews(res.data.reviews || []);
        setTotal(res.data.total || 0);
      });
  };

  const loadFlagged = () => {
    return api.get('/admin/flagged-content')
      .then(res => setFlagged(res.data.reports || []));
  };

  useEffect(() => {
    setLoading(true);
    Promise.all([loadReviews(), loadFlagged()])
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [page]);

  const handleDelete = async (id) => {
    setDeleting(id);
    try {
      await api.delete(`/reviews/${id}`);
      setReviews(prev => prev.filter(r => r._id !== id));
    } catch {
      // silent
    } finally {
      setDeleting(null);
    }
  };

  const handleFlagAction = async (reportId, action) => {
    try {
      await api.put(`/admin/flagged-content/${reportId}`, { status: action });
      loadFlagged();
    } catch {
      // silent
    }
  };

  if (loading) return <div style={{ padding: 40, textAlign: 'center', color: '#888' }}>Loading...</div>;

  return (
    <div>
      <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>Reviews & Ratings</h3>

      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        <button
          onClick={() => setTab('all')}
          style={{
            padding: '8px 20px', borderRadius: 20, border: '1px solid var(--gray-200)',
            background: tab === 'all' ? 'var(--green)' : 'var(--white)',
            color: tab === 'all' ? 'var(--white)' : 'var(--gray-600)',
            fontWeight: 600, fontSize: 13, cursor: 'pointer', fontFamily: 'var(--font-body)'
          }}
        >All Reviews ({total})</button>
        <button
          onClick={() => setTab('flagged')}
          style={{
            padding: '8px 20px', borderRadius: 20, border: '1px solid var(--gray-200)',
            background: tab === 'flagged' ? '#DC2626' : 'var(--white)',
            color: tab === 'flagged' ? 'var(--white)' : 'var(--gray-600)',
            fontWeight: 600, fontSize: 13, cursor: 'pointer', fontFamily: 'var(--font-body)'
          }}
        >Flagged ({flagged.length})</button>
      </div>

      {tab === 'all' ? (
        <>
          {reviews.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 40, color: '#888', background: 'var(--white)', borderRadius: 'var(--radius)', border: '1px solid var(--gray-200)' }}>No reviews yet</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {reviews.map(r => (
                <div key={r._id} style={{ background: 'var(--white)', border: '1px solid var(--gray-200)', borderRadius: 'var(--radius)', padding: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <div>
                      <span style={{ fontWeight: 600, fontSize: 13 }}>{r.reviewer?.name || 'Unknown'}</span>
                      <span style={{ fontSize: 12, color: '#888', margin: '0 8px' }}>reviewed</span>
                      <span style={{ fontWeight: 600, fontSize: 13 }}>{r.specialist?.name || 'Unknown'}</span>
                      <span style={{ fontSize: 11, color: '#888', marginLeft: 8 }}>on {r.project?.title || 'Unknown project'}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      {[1,2,3,4,5].map(i => <StarIcon key={i} filled={i <= r.rating} />)}
                      <span style={{ fontWeight: 700, fontSize: 13, color: 'var(--green)', marginLeft: 4 }}>{r.rating}/5</span>
                    </div>
                  </div>
                  {r.comment && <p style={{ fontSize: 13, color: '#555', margin: '0 0 10px' }}>"{r.comment}"</p>}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 11, color: '#aaa' }}>{new Date(r.createdAt).toLocaleDateString()}</span>
                    <button
                      onClick={() => handleDelete(r._id)}
                      disabled={deleting === r._id}
                      style={{
                        padding: '4px 12px', fontSize: 12, color: '#DC2626',
                        background: '#FEF2F2', border: 'none', borderRadius: 4,
                        cursor: 'pointer', fontFamily: 'var(--font-body)'
                      }}
                    >Delete</button>
                  </div>
                </div>
              ))}
            </div>
          )}
          {total > limit && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 20 }}>
              <button disabled={page === 1} onClick={() => setPage(p => p - 1)} style={{ padding: '8px 14px', border: '1px solid var(--gray-200)', borderRadius: 6, background: 'var(--white)', cursor: 'pointer', fontSize: 13 }}>Prev</button>
              <span style={{ padding: '8px 14px', fontSize: 13, color: 'var(--gray-500)' }}>Page {page} of {Math.ceil(total / limit)}</span>
              <button disabled={page >= Math.ceil(total / limit)} onClick={() => setPage(p => p + 1)} style={{ padding: '8px 14px', border: '1px solid var(--gray-200)', borderRadius: 6, background: 'var(--white)', cursor: 'pointer', fontSize: 13 }}>Next</button>
            </div>
          )}
        </>
      ) : (
        <>
          {flagged.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 40, color: '#888', background: 'var(--white)', borderRadius: 'var(--radius)', border: '1px solid var(--gray-200)' }}>No flagged reviews. All reviews are clean.</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {flagged.map(r => (
                <div key={r._id} style={{ background: 'var(--white)', border: '1px solid #FCA5A5', borderRadius: 'var(--radius)', padding: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <div>
                      <span style={{ fontWeight: 600, fontSize: 13 }}>{r.review?.reviewer?.name || 'Unknown'}</span>
                      <span style={{ fontSize: 12, color: '#888', marginLeft: 8 }}>rated</span>
                      <span style={{ fontWeight: 600, fontSize: 13, marginLeft: 8 }}>{r.review?.specialist?.name || 'Unknown'}</span>
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--green)' }}>{r.review?.rating}/5</span>
                  </div>
                  <p style={{ fontSize: 13, color: '#555', margin: '0 0 8px', fontStyle: 'italic' }}>"{r.review?.comment}"</p>
                  <div style={{ fontSize: 12, color: '#888', marginBottom: 12 }}>Reason: {r.reason} &bull; Reported by: {r.reportedBy?.name || 'Unknown'}</div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button
                      onClick={() => handleFlagAction(r._id, 'dismissed')}
                      style={{ padding: '6px 16px', fontSize: 12, color: 'var(--green)', background: '#ECFDF5', border: 'none', borderRadius: 4, cursor: 'pointer', fontFamily: 'var(--font-body)' }}
                    >Dismiss</button>
                    {r.review && (
                      <button
                        onClick={() => handleDelete(r.review._id)}
                        style={{ padding: '6px 16px', fontSize: 12, color: '#DC2626', background: '#FEF2F2', border: 'none', borderRadius: 4, cursor: 'pointer', fontFamily: 'var(--font-body)' }}
                      >Remove Review</button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AdminReviews;
