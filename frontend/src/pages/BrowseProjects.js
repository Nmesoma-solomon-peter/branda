import React, { useState, useEffect } from 'react';
import api from '../api/axios';

const formatCurrency = (amount) => {
  if (!amount) return 'Not set';
  return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 }).format(amount);
};

const BrowseProjects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(null);
  const [coverLetter, setCoverLetter] = useState('');
  const [bidAmount, setBidAmount] = useState('');
  const [timeline, setTimeline] = useState(14);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const params = {};
    if (search) params.q = search;
    api.get('/projects/open', { params })
      .then(res => setProjects(res.data.projects))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [search]);

  const submitProposal = async (projectId) => {
    if (!coverLetter.trim() || !bidAmount) return;
    setSubmitting(true);
    try {
      await api.post('/proposals', { projectId, coverLetter, bidAmount: Number(bidAmount), timeline });
      setShowForm(null);
      setCoverLetter('');
      setBidAmount('');
      setTimeline(14);
    } catch {
      // silent
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '100px 32px 60px' }}>
      <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 28, fontWeight: 700, marginBottom: 8 }}>Open Projects</h1>
      <p style={{ color: 'var(--gray-500)', marginBottom: 24 }}>Browse projects and submit your proposal</p>

      <input
        value={search}
        onChange={e => setSearch(e.target.value)}
        placeholder="Search projects by title..."
        style={{
          width: '100%', padding: '12px 16px', border: '1px solid var(--gray-200)', borderRadius: 8,
          fontSize: 15, outline: 'none', marginBottom: 24, fontFamily: 'var(--font-body)', boxSizing: 'border-box'
        }}
      />

      {loading ? (
        <div style={{ textAlign: 'center', padding: 40, color: 'var(--gray-400)' }}>Loading...</div>
      ) : projects.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 60, color: 'var(--gray-400)', background: 'var(--gray-50)', borderRadius: 'var(--radius)' }}>
          <p style={{ fontSize: 16 }}>No open projects right now</p>
          <p style={{ fontSize: 13 }}>Check back later for new opportunities</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {projects.map(p => (
            <div key={p._id} style={{ background: 'var(--white)', border: '1px solid var(--gray-200)', borderRadius: 'var(--radius)', padding: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <div>
                  <h3 style={{ fontSize: 16, fontWeight: 600, margin: '0 0 4px' }}>{p.title}</h3>
                  <p style={{ fontSize: 13, color: 'var(--gray-400)', margin: 0 }}>
                    {p.industry} &bull; Budget: {formatCurrency(p.budget)} &bull; {p.owner?.name || 'Unknown'}
                  </p>
                </div>
                {p.deadline && (
                  <span style={{ fontSize: 12, color: 'var(--gray-400)', whiteSpace: 'nowrap' }}>
                    Due: {new Date(p.deadline).toLocaleDateString()}
                  </span>
                )}
              </div>
              <p style={{ fontSize: 14, color: 'var(--gray-600)', lineHeight: 1.6, margin: '0 0 16px' }}>{p.description}</p>

              {showForm === p._id ? (
                <div style={{ borderTop: '1px solid var(--gray-200)', paddingTop: 16, marginTop: 8 }}>
                  <h4 style={{ fontSize: 14, fontWeight: 600, margin: '0 0 12px' }}>Submit Proposal</h4>
                  <div style={{ marginBottom: 12 }}>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 4 }}>Cover Letter</label>
                    <textarea
                      value={coverLetter}
                      onChange={e => setCoverLetter(e.target.value)}
                      placeholder="Tell the client why you're the right person for this project..."
                      maxLength={2000}
                      rows={4}
                      style={{
                        width: '100%', padding: 10, border: '1px solid var(--gray-200)', borderRadius: 6,
                        fontSize: 14, fontFamily: 'var(--font-body)', resize: 'vertical', outline: 'none',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>
                  <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
                    <div style={{ flex: 1 }}>
                      <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 4 }}>Your Bid (NGN)</label>
                      <input
                        type="number"
                        value={bidAmount}
                        onChange={e => setBidAmount(e.target.value)}
                        placeholder="Enter amount"
                        style={{
                          width: '100%', padding: '10px 12px', border: '1px solid var(--gray-200)', borderRadius: 6,
                          fontSize: 14, fontFamily: 'var(--font-body)', outline: 'none', boxSizing: 'border-box'
                        }}
                      />
                    </div>
                    <div style={{ flex: 1 }}>
                      <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 4 }}>Timeline (days)</label>
                      <input
                        type="number"
                        value={timeline}
                        onChange={e => setTimeline(Number(e.target.value))}
                        min={1}
                        style={{
                          width: '100%', padding: '10px 12px', border: '1px solid var(--gray-200)', borderRadius: 6,
                          fontSize: 14, fontFamily: 'var(--font-body)', outline: 'none', boxSizing: 'border-box'
                        }}
                      />
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button
                      onClick={() => submitProposal(p._id)}
                      disabled={submitting || !coverLetter.trim() || !bidAmount}
                      style={{
                        padding: '10px 24px', background: 'var(--green)', color: 'var(--white)',
                        border: 'none', borderRadius: 6, fontWeight: 600, fontSize: 13,
                        cursor: submitting || !coverLetter.trim() || !bidAmount ? 'not-allowed' : 'pointer', fontFamily: 'var(--font-body)'
                      }}
                    >{submitting ? 'Submitting...' : 'Submit Proposal'}</button>
                    <button
                      onClick={() => setShowForm(null)}
                      style={{
                        padding: '10px 24px', background: 'var(--white)', color: 'var(--gray-600)',
                        border: '1px solid var(--gray-200)', borderRadius: 6, fontSize: 13,
                        cursor: 'pointer', fontFamily: 'var(--font-body)'
                      }}
                    >Cancel</button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setShowForm(p._id)}
                  style={{
                    padding: '8px 20px', background: 'var(--green)', color: 'var(--white)',
                    border: 'none', borderRadius: 6, fontWeight: 600, fontSize: 13,
                    cursor: 'pointer', fontFamily: 'var(--font-body)'
                  }}
                >Submit Proposal</button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BrowseProjects;
