import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';

const SearchIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
);

const StarIcon = ({ filled }) => (
  <svg viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" width="14" height="14">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
  </svg>
);

const getInitials = (name) => {
  if (!name) return '?';
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
};

const categories = [
  'All', 'Logo Design', 'Brand Identity', 'Web Design', 'Mobile App Design',
  'UI/UX Design', 'Graphic Design', 'Print Design', 'Packaging Design',
  'Social Media Design', 'Illustration', 'Typography', 'Motion Graphics'
];

const BrowseSpecialists = () => {
  const [specialists, setSpecialists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 12;

  const fetchSpecialists = useCallback((pg, cat, q) => {
    setLoading(true);
    const params = { page: pg, limit };
    if (q) params.q = q;
    if (cat && cat !== 'All') params.category = cat;
    api.get('/search/specialists', { params })
      .then(res => { setSpecialists(res.data.specialists); setTotal(res.data.total); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    fetchSpecialists(page, category, debouncedSearch);
  }, [page, category, debouncedSearch, fetchSpecialists]);

  const handleSearch = (e) => {
    e.preventDefault();
    setDebouncedSearch(search);
    setPage(1);
  };

  return (
    <>
      <style>{`
        .bs-hero { text-align: center; padding: 120px 32px 48px; background: var(--green-light); }
        .bs-hero h1 { font-family: var(--font-heading); font-size: 36px; font-weight: 700; margin: 0 0 12px; }
        .bs-hero p { color: var(--gray-500); font-size: 16px; margin: 0 0 28px; }
        .bs-search-bar { display: flex; gap: 12px; max-width: 600px; margin: 0 auto; }
        .bs-search-bar input { flex: 1; padding: 14px 18px; border: 1px solid var(--gray-200); border-radius: 8px; font-size: 15px; font-family: var(--font-body); outline: none; background: var(--white); }
        .bs-search-bar input:focus { border-color: var(--green); }
        .bs-search-bar button { padding: 14px 28px; background: var(--green); color: var(--white); border: none; border-radius: 8px; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 6px; }
        .bs-content { max-width: 1100px; margin: 0 auto; padding: 32px; }
        .bs-filters { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 24px; }
        .bs-filter-btn { padding: 8px 16px; border: 1px solid var(--gray-200); border-radius: 20px; background: var(--white); font-size: 13px; cursor: pointer; color: var(--gray-600); transition: all 0.12s; }
        .bs-filter-btn:hover { border-color: var(--green); color: var(--green); }
        .bs-filter-btn.active { background: var(--green); color: var(--white); border-color: var(--green); }
        .bs-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 20px; }
        .bs-card { border: 1px solid var(--gray-200); border-radius: var(--radius); padding: 24px; background: var(--white); text-align: center; transition: box-shadow 0.15s; }
        .bs-card:hover { box-shadow: 0 4px 16px rgba(0,0,0,0.08); }
        .bs-card-avatar { width: 64px; height: 64px; border-radius: 50%; background: var(--green); color: var(--white); display: flex; align-items: center; justify-content: center; font-size: 22px; font-weight: 700; margin: 0 auto 12px; }
        .bs-card-name { font-size: 16px; font-weight: 600; color: var(--gray-800); margin-bottom: 4px; }
        .bs-card-role { font-size: 12px; color: var(--gray-400); text-transform: capitalize; margin-bottom: 8px; }
        .bs-card-rating { display: flex; align-items: center; justify-content: center; gap: 2px; color: '#F59E0B'; margin-bottom: 12px; }
        .bs-card-rating span { font-size: 13px; color: var(--gray-500); margin-left: 4px; }
        .bs-card-link { display: inline-block; padding: 8px 20px; border: 1px solid var(--green); color: var(--green); border-radius: 6px; text-decoration: none; font-size: 13px; font-weight: 600; transition: all 0.12s; }
        .bs-card-link:hover { background: var(--green); color: var(--white); }
        .bs-empty { text-align: center; padding: 60px 32px; color: var(--gray-400); }
        .bs-pagination { display: flex; justify-content: center; gap: 8px; margin-top: 32px; }
        .bs-page-btn { padding: 8px 14px; border: 1px solid var(--gray-200); border-radius: 6px; background: var(--white); cursor: pointer; font-size: 13px; }
        .bs-page-btn.active { background: var(--green); color: var(--white); border-color: var(--green); }
        .bs-page-btn:disabled { opacity: 0.5; cursor: not-allowed; }
      `}</style>

      <div className="bs-hero">
        <h1>Find a Specialist</h1>
        <p>Browse talented brand designers for your project</p>
        <form className="bs-search-bar" onSubmit={handleSearch}>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name, skill, or keyword..." />
          <button type="submit"><SearchIcon /> Search</button>
        </form>
      </div>

      <div className="bs-content">
        <div className="bs-filters">
          {categories.map(c => (
            <button key={c} className={`bs-filter-btn ${category === c ? 'active' : ''}`} onClick={() => { setCategory(c); setPage(1); }}>{c}</button>
          ))}
        </div>

        {loading ? (
          <div className="bs-empty">Loading...</div>
        ) : specialists.length === 0 ? (
          <div className="bs-empty">No specialists found matching your criteria</div>
        ) : (
          <>
            <div className="bs-grid">
              {specialists.map(s => (
                <div key={s._id} className="bs-card">
                  {s.profileImage ? (
                    <img src={s.profileImage} alt={s.name} style={{ width: 64, height: 64, borderRadius: '50%', objectFit: 'cover', margin: '0 auto 12px', display: 'block' }} />
                  ) : (
                    <div className="bs-card-avatar">{getInitials(s.name)}</div>
                  )}
                  <div className="bs-card-name">{s.name}</div>
                  <div className="bs-card-role">{s.role}</div>
                  {s.averageRating > 0 && (
                    <div className="bs-card-rating">
                      {[1, 2, 3, 4, 5].map(i => <StarIcon key={i} filled={i <= Math.round(s.averageRating)} />)}
                      <span>{s.averageRating.toFixed(1)} ({s.reviewCount})</span>
                    </div>
                  )}
                  <Link to={`/specialists/${s._id}`} className="bs-card-link">View Profile</Link>
                </div>
              ))}
            </div>
            {total > limit && (
              <div className="bs-pagination">
                <button className="bs-page-btn" disabled={page === 1} onClick={() => setPage(p => p - 1)}>Prev</button>
                <span style={{ padding: '8px 14px', fontSize: 13, color: 'var(--gray-500)' }}>Page {page} of {Math.ceil(total / limit)}</span>
                <button className="bs-page-btn" disabled={page >= Math.ceil(total / limit)} onClick={() => setPage(p => p + 1)}>Next</button>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
};

export default BrowseSpecialists;
