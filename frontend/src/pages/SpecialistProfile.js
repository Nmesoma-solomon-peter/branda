import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

const StarIcon = ({ filled }) => (
  <svg viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" width="14" height="14">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
  </svg>
);

const getInitials = (name) => {
  if (!name) return '?';
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
};

const SpecialistProfile = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [specialist, setSpecialist] = useState(null);
  const [portfolio, setPortfolio] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('portfolio');

  useEffect(() => {
    Promise.all([
      api.get(`/portfolio/specialist/${id}`),
      api.get(`/portfolio/specialist/${id}/reviews`)
    ]).then(([profileRes, reviewsRes]) => {
      setSpecialist(profileRes.data.specialist);
      setPortfolio(profileRes.data.items);
      setReviews(reviewsRes.data.reviews);
    }).catch(() => {}).finally(() => setLoading(false));
  }, [id]);

  const submitReview = async () => {
    if (!reviewForm.comment.trim()) return;
    setSubmitting(true);
    try {
      const res = await api.post(`/portfolio/specialist/${id}/reviews`, reviewForm);
      setReviews(prev => [res.data.review, ...prev]);
      setShowReviewForm(false);
      setReviewForm({ rating: 5, comment: '' });
    } catch {} finally { setSubmitting(false); }
  };

  if (loading) return <div style={{ padding: '100px 32px', textAlign: 'center', color: 'var(--gray-400)' }}>Loading...</div>;
  if (!specialist) return <div style={{ padding: '100px 32px', textAlign: 'center', color: 'var(--gray-400)' }}>Specialist not found</div>;

  return (
    <>
      <style>{`
        .sp-header { padding: 100px 32px 48px; background: var(--green-light); text-align: center; }
        .sp-avatar { width: 88px; height: 88px; border-radius: 50%; background: var(--green); color: var(--white); display: flex; align-items: center; justify-content: center; font-size: 32px; font-weight: 700; margin: 0 auto 16px; }
        .sp-name { font-family: var(--font-heading); font-size: 28px; font-weight: 700; margin: 0; }
        .sp-role { font-size: 14px; color: var(--gray-500); text-transform: capitalize; margin-top: 4px; }
        .sp-stats { display: flex; justify-content: center; gap: 32px; margin-top: 20px; }
        .sp-stat { text-align: center; }
        .sp-stat-val { font-size: 22px; font-weight: 700; color: var(--gray-800); }
        .sp-stat-label { font-size: 12px; color: var(--gray-400); }
        .sp-body { max-width: 900px; margin: 0 auto; padding: 32px; }
        .sp-tabs { display: flex; gap: 0; border-bottom: 2px solid var(--gray-200); margin-bottom: 24px; }
        .sp-tab { padding: 12px 24px; background: none; border: none; border-bottom: 2px solid transparent; margin-bottom: -2px; font-size: 14px; font-weight: 600; cursor: pointer; color: var(--gray-500); }
        .sp-tab.active { color: var(--green); border-bottom-color: var(--green); }
        .sp-portfolio-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 20px; }
        .sp-portfolio-card { border: 1px solid var(--gray-200); border-radius: var(--radius); overflow: hidden; }
        .sp-portfolio-card img { width: 100%; height: 180px; object-fit: cover; background: var(--gray-100); }
        .sp-portfolio-card-body { padding: 14px; }
        .sp-portfolio-card-cat { font-size: 11px; color: var(--green); font-weight: 600; text-transform: uppercase; }
        .sp-portfolio-card-title { font-size: 14px; font-weight: 600; color: var(--gray-800); margin-top: 4px; }
        .sp-portfolio-card-desc { font-size: 12px; color: var(--gray-400); margin-top: 4px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
        .sp-review-card { padding: 16px; border: 1px solid var(--gray-200); border-radius: 8px; margin-bottom: 12px; }
        .sp-review-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
        .sp-review-stars { display: flex; gap: 2px; color: '#F59E0B'; }
        .sp-review-date { font-size: 12px; color: var(--gray-400); }
        .sp-review-text { font-size: 14px; color: var(--gray-600); line-height: 1.6; }
        .sp-review-author { font-size: 12px; color: var(--gray-500); margin-top: 8px; font-weight: 600; }
        .sp-review-form { background: var(--gray-50); padding: 20px; border-radius: 8px; margin-bottom: 20px; }
        .sp-stars-input { display: flex; gap: 4px; margin-bottom: 12px; }
        .sp-stars-input button { background: none; border: none; cursor: pointer; color: var(--gray-300); padding: 2px; }
        .sp-stars-input button.active { color: '#F59E0B'; }
        .sp-empty { text-align: center; padding: 40px; color: var(--gray-400); font-size: 14px; }
        .sp-msg-btn { display: inline-flex; align-items: center; gap: 6px; padding: 10px 24px; background: var(--green); color: var(--white); border: none; border-radius: 8px; font-weight: 600; font-size: 14px; cursor: pointer; margin-top: 16px; }
        .sp-msg-btn:hover { opacity: 0.9; }
      `}</style>

      <div className="sp-header">
        {specialist.profileImage ? (
          <img src={specialist.profileImage} alt={specialist.name} className="sp-avatar" style={{ objectFit: 'cover' }} />
        ) : (
          <div className="sp-avatar">{getInitials(specialist.name)}</div>
        )}
        <h1 className="sp-name">{specialist.name}</h1>
        <p className="sp-role">{specialist.role}</p>
        <div className="sp-stats">
          <div className="sp-stat">
            <div className="sp-stat-val">{portfolio.length}</div>
            <div className="sp-stat-label">Projects</div>
          </div>
          <div className="sp-stat">
            <div className="sp-stat-val">{reviews.length}</div>
            <div className="sp-stat-label">Reviews</div>
          </div>
          <div className="sp-stat">
            <div className="sp-stat-val">{reviews.length > 0 ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1) : '—'}</div>
            <div className="sp-stat-label">Rating</div>
          </div>
        </div>
        {user && user.role === 'sme' && (
          <Link to={`/chat`} className="sp-msg-btn">Send Message</Link>
        )}
      </div>

      <div className="sp-body">
        <div className="sp-tabs">
          <button className={`sp-tab ${activeTab === 'portfolio' ? 'active' : ''}`} onClick={() => setActiveTab('portfolio')}>Portfolio ({portfolio.length})</button>
          <button className={`sp-tab ${activeTab === 'reviews' ? 'active' : ''}`} onClick={() => setActiveTab('reviews')}>Reviews ({reviews.length})</button>
        </div>

        {activeTab === 'portfolio' && (
          portfolio.length === 0 ? (
            <div className="sp-empty">No portfolio items yet</div>
          ) : (
            <div className="sp-portfolio-grid">
              {portfolio.map(item => (
                <div key={item._id} className="sp-portfolio-card">
                  {item.imageUrl ? <img src={item.imageUrl} alt={item.title} /> : <div style={{ height: 180, background: 'var(--gray-100)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--gray-300)' }}>No Image</div>}
                  <div className="sp-portfolio-card-body">
                    <div className="sp-portfolio-card-cat">{item.category}</div>
                    <div className="sp-portfolio-card-title">{item.title}</div>
                    <div className="sp-portfolio-card-desc">{item.description}</div>
                  </div>
                </div>
              ))}
            </div>
          )
        )}

        {activeTab === 'reviews' && (
          <>
            {user && user.role === 'sme' && !showReviewForm && (
              <button onClick={() => setShowReviewForm(true)} className="sp-msg-btn" style={{ marginBottom: 20 }}>Write a Review</button>
            )}
            {showReviewForm && (
              <div className="sp-review-form">
                <h4 style={{ margin: '0 0 12px', fontSize: 15 }}>Your Review</h4>
                <div className="sp-stars-input">
                  {[1, 2, 3, 4, 5].map(i => (
                    <button key={i} className={i <= reviewForm.rating ? 'active' : ''} onClick={() => setReviewForm({ ...reviewForm, rating: i })}>
                      <StarIcon filled={i <= reviewForm.rating} />
                    </button>
                  ))}
                </div>
                <textarea value={reviewForm.comment} onChange={e => setReviewForm({ ...reviewForm, comment: e.target.value })} placeholder="Share your experience working with this specialist..." style={{ width: '100%', padding: 12, border: '1px solid var(--gray-200)', borderRadius: 6, fontFamily: 'var(--font-body)', fontSize: 14, minHeight: 80, resize: 'vertical', outline: 'none', boxSizing: 'border-box' }} />
                <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                  <button onClick={submitReview} disabled={submitting || !reviewForm.comment.trim()} style={{ padding: '8px 20px', background: 'var(--green)', color: 'var(--white)', border: 'none', borderRadius: 6, fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>{submitting ? 'Submitting...' : 'Submit'}</button>
                  <button onClick={() => setShowReviewForm(false)} style={{ padding: '8px 20px', border: '1px solid var(--gray-200)', borderRadius: 6, background: 'var(--white)', fontSize: 13, cursor: 'pointer' }}>Cancel</button>
                </div>
              </div>
            )}
            {reviews.length === 0 ? (
              <div className="sp-empty">No reviews yet</div>
            ) : reviews.map(r => (
              <div key={r._id} className="sp-review-card">
                <div className="sp-review-header">
                  <div className="sp-review-stars">{[1, 2, 3, 4, 5].map(i => <StarIcon key={i} filled={i <= r.rating} />)}</div>
                  <span className="sp-review-date">{new Date(r.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="sp-review-text">{r.comment}</div>
                <div className="sp-review-author">— {r.reviewer?.name || 'Anonymous'}</div>
              </div>
            ))}
          </>
        )}
      </div>
    </>
  );
};

export default SpecialistProfile;
