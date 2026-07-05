import React, { useState, useEffect } from 'react';
import api from '../api/axios';

const CaseStudies = () => {
  const [caseStudies, setCaseStudies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    api.get('/case-studies').then(res => setCaseStudies(res.data.caseStudies || [])).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ padding: '100px 32px', textAlign: 'center', color: 'var(--gray-400)' }}>Loading...</div>;

  return (
    <>
      <style>{`
        .cs-page { max-width: 1100px; margin: 100px auto 60px; padding: 0 32px; }
        .cs-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 24px; margin-top: 32px; }
        .cs-card { background: var(--white); border: 1px solid var(--gray-200); border-radius: var(--radius); overflow: hidden; cursor: pointer; transition: box-shadow 0.15s; }
        .cs-card:hover { box-shadow: 0 4px 12px rgba(0,0,0,0.08); }
        .cs-card-img { height: 180px; background: var(--gray-100); display: flex; align-items: center; justify-content: center; color: var(--gray-400); font-size: 13px; overflow: hidden; }
        .cs-card-img img { width: 100%; height: 100%; object-fit: cover; }
        .cs-card-body { padding: 20px; }
        .cs-card-body h3 { margin: 0 0 8px; font-size: 16px; font-weight: 700; }
        .cs-card-body p { font-size: 13px; color: var(--gray-500); margin: 0; line-height: 1.5; }
        .cs-card-footer { padding: 12px 20px; border-top: 1px solid var(--gray-100); display: flex; gap: 16px; font-size: 11px; color: var(--gray-400); }
        .cs-detail { max-width: 700px; margin: 0 auto; }
        .cs-detail h1 { font-size: 28px; font-weight: 700; margin: 0 0 8px; }
        .cs-detail .cs-industry { font-size: 13px; color: var(--green); font-weight: 600; margin-bottom: 24px; }
        .cs-detail h2 { font-size: 18px; font-weight: 700; margin: 24px 0 8px; }
        .cs-detail p { font-size: 14px; line-height: 1.7; color: var(--gray-600); }
        .cs-detail .cs-results { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-top: 12px; }
        .cs-detail .cs-result { text-align: center; padding: 16px; background: var(--gray-50); border-radius: 8px; }
        .cs-detail .cs-result-val { font-size: 22px; font-weight: 700; color: var(--green); }
        .cs-detail .cs-result-label { font-size: 11px; color: var(--gray-500); margin-top: 4px; }
        .cs-back { display: inline-flex; align-items: center; gap: 6px; color: var(--green); font-size: 13px; font-weight: 600; cursor: pointer; margin-bottom: 24px; border: none; background: none; padding: 0; }
        .cs-empty { text-align: center; padding: 60px 20px; color: var(--gray-400); }
      `}</style>

      <div className="cs-page">
        {!selected ? (
          <>
            <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 28, fontWeight: 700, margin: 0 }}>Case Studies</h1>
            <p style={{ fontSize: 14, color: 'var(--gray-500)', marginTop: 8 }}>Real projects, real results from Aba's best designers</p>
            {caseStudies.length === 0 ? (
              <div className="cs-empty">No case studies published yet</div>
            ) : (
              <div className="cs-grid">
                {caseStudies.map(cs => (
                  <div className="cs-card" key={cs._id} onClick={() => setSelected(cs)}>
                    {cs.images && cs.images.length > 0 ? (
                      <div className="cs-card-img"><img src={cs.images[0]} alt={cs.title} /></div>
                    ) : (
                      <div className="cs-card-img">No Image</div>
                    )}
                    <div className="cs-card-body">
                      <h3>{cs.title}</h3>
                      <p>{cs.summary || cs.challenge?.substring(0, 120)}...</p>
                    </div>
                    <div className="cs-card-footer">
                      <span>{cs.industry}</span>
                      <span>{cs.views || 0} views</span>
                      <span>{new Date(cs.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="cs-detail">
            <button className="cs-back" onClick={() => setSelected(null)}>← Back to Case Studies</button>
            <h1>{selected.title}</h1>
            <div className="cs-industry">{selected.industry}</div>
            {selected.images && selected.images.length > 0 && <img src={selected.images[0]} alt={selected.title} style={{ width: '100%', borderRadius: 'var(--radius)', marginBottom: 24 }} />}
            <h2>Challenge</h2>
            <p>{selected.challenge}</p>
            <h2>Solution</h2>
            <p>{selected.solution}</p>
            <h2>Results</h2>
            <p>{selected.results}</p>
            {selected.metrics && selected.metrics.length > 0 && (
              <div className="cs-results">
                {selected.metrics.map((m, i) => (
                  <div className="cs-result" key={i}>
                    <div className="cs-result-val">{m.value}</div>
                    <div className="cs-result-label">{m.label}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default CaseStudies;
