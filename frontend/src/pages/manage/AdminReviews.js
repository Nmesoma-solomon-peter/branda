import React, { useState, useEffect } from 'react';
import api from '../../api/axios';

const AdminReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => api.get('/admin/flagged-content').then(res => setReviews(res.data.reports || [])).catch(() => {}).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  if (loading) return <div style={{ padding: 40, textAlign: 'center', color: '#888' }}>Loading...</div>;

  return (
    <div>
      <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>Reviews & Ratings</h3>
      {reviews.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 40, color: '#888', background: 'var(--white)', borderRadius: 'var(--radius)', border: '1px solid var(--gray-200)' }}>No flagged reviews. All reviews are clean.</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {reviews.map(r => (
            <div key={r._id} style={{ background: 'var(--white)', border: '1px solid var(--gray-200)', borderRadius: 'var(--radius)', padding: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <div>
                  <span style={{ fontWeight: 600, fontSize: 13 }}>{r.review?.reviewer?.name || 'Unknown'}</span>
                  <span style={{ fontSize: 12, color: '#888', marginLeft: 8 }}>rated</span>
                  <span style={{ fontWeight: 600, fontSize: 13, marginLeft: 8 }}>{r.review?.specialist?.name || 'Unknown'}</span>
                </div>
                <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--green)' }}>{r.review?.rating}/5</span>
              </div>
              <p style={{ fontSize: 13, color: '#555', margin: '0 0 8px', fontStyle: 'italic' }}>"{r.review?.comment}"</p>
              <div style={{ fontSize: 12, color: '#888' }}>Reason: {r.reason} &bull; Reported by: {r.reportedBy?.name || 'Unknown'}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminReviews;
