import React, { useState, useEffect } from 'react';
import api from '../../api/axios';

const StarIcon = ({ filled, onClick }) => (
  <svg
    viewBox="0 0 24 24"
    fill={filled ? '#F59E0B' : 'none'}
    stroke={filled ? '#F59E0B' : '#D1D5DB'}
    strokeWidth="2"
    width="24"
    height="24"
    style={{ cursor: 'pointer' }}
    onClick={onClick}
  >
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
  </svg>
);

const ReviewForm = ({ projectId, specialistId, onReviewSubmitted }) => {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState('');
  const [existing, setExisting] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    api.get(`/reviews/my/${projectId}`)
      .then(res => {
        if (res.data.review) {
          setExisting(res.data.review);
          setRating(res.data.review.rating);
          setComment(res.data.review.comment || '');
        }
      })
      .catch(() => {})
      .finally(() => setFetching(false));
  }, [projectId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) return;
    setLoading(true);
    try {
      const res = existing
        ? await api.put(`/reviews/${existing._id}`, { rating, comment })
        : await api.post('/reviews', { specialist: specialistId, project: projectId, rating, comment });
      setExisting(res.data.review);
      if (onReviewSubmitted) onReviewSubmitted(res.data.review);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return null;

  return (
    <form onSubmit={handleSubmit} style={{ marginTop: 24, padding: 24, border: '1px solid var(--gray-200)', borderRadius: 'var(--radius)', background: 'var(--white)' }}>
      <h4 style={{ fontSize: 16, fontWeight: 600, margin: '0 0 4px' }}>
        {existing ? 'Your Review' : 'Rate This Specialist'}
      </h4>
      <p style={{ fontSize: 13, color: 'var(--gray-400)', margin: '0 0 16px' }}>
        {existing ? 'Edit your review below' : 'Share your experience working with this specialist'}
      </p>

      <div style={{ display: 'flex', gap: 4, marginBottom: 16 }}>
        {[1, 2, 3, 4, 5].map(i => (
          <StarIcon
            key={i}
            filled={i <= (hover || rating)}
            onClick={() => setRating(i)}
            onMouseEnter={() => setHover(i)}
            onMouseLeave={() => setHover(0)}
          />
        ))}
      </div>

      <textarea
        value={comment}
        onChange={e => setComment(e.target.value)}
        placeholder="Tell others about your experience (optional)"
        maxLength={1000}
        rows={3}
        style={{
          width: '100%', padding: 12, border: '1px solid var(--gray-200)',
          borderRadius: 8, fontSize: 14, fontFamily: 'var(--font-body)',
          resize: 'vertical', outline: 'none', boxSizing: 'border-box'
        }}
      />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
        <span style={{ fontSize: 12, color: 'var(--gray-400)' }}>{comment.length}/1000</span>
        <button
          type="submit"
          disabled={loading || rating === 0}
          style={{
            padding: '10px 24px', background: rating === 0 ? 'var(--gray-200)' : 'var(--green)',
            color: rating === 0 ? 'var(--gray-400)' : 'var(--white)',
            border: 'none', borderRadius: 8, fontWeight: 600, fontSize: 14,
            cursor: rating === 0 ? 'not-allowed' : 'pointer', fontFamily: 'var(--font-body)'
          }}
        >
          {loading ? 'Submitting...' : existing ? 'Update Review' : 'Submit Review'}
        </button>
      </div>
    </form>
  );
};

export default ReviewForm;
