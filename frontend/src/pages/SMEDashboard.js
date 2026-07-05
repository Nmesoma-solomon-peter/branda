import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import CreateProject from '../components/projects/CreateProject';

const statusColors = {
  active: { bg: '#EDF3E2', text: '#5a8a28' },
  in_review: { bg: '#FEF3C7', text: '#D97706' },
  completed: { bg: '#ECFDF5', text: '#059669' },
  revision: { bg: '#FEF2F2', text: '#DC2626' },
  dispute: { bg: '#FEF3C7', text: '#92400E' },
};

const formatCurrency = (amount) => {
  if (!amount) return null;
  return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 }).format(amount);
};

const daysUntil = (dateStr) => {
  if (!dateStr) return null;
  return Math.ceil((new Date(dateStr) - new Date()) / (1000 * 60 * 60 * 24));
};

const styles = {
  page: {
    maxWidth: 1120,
    margin: '0 auto',
    padding: '100px 24px 60px',
    fontFamily: 'var(--font-body)',
  },
  welcome: {
    display: 'flex',
    alignItems: 'center',
    gap: 16,
    marginBottom: 28,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: '50%',
    objectFit: 'cover',
    border: '2px solid var(--gray-200)',
    flexShrink: 0,
  },
  initialsAvatar: {
    width: 56,
    height: 56,
    borderRadius: '50%',
    background: 'var(--green-light)',
    border: '2px solid var(--gray-200)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: 'var(--font-heading)',
    fontSize: 22,
    fontWeight: 700,
    color: 'var(--green)',
    flexShrink: 0,
  },
  welcomeText: {
    flex: 1,
  },
  welcomeHeading: {
    fontFamily: 'var(--font-heading)',
    fontSize: 24,
    fontWeight: 700,
    color: 'var(--black)',
    margin: 0,
    lineHeight: 1.2,
  },
  welcomeSub: {
    fontSize: 14,
    color: 'var(--gray-500)',
    margin: '4px 0 0',
  },
  statsRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: 12,
    marginBottom: 32,
  },
  statCard: {
    background: 'var(--white)',
    border: '1px solid var(--gray-200)',
    borderRadius: 'var(--radius)',
    padding: '20px 16px',
    textAlign: 'center',
    boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
  },
  statNumber: {
    fontFamily: 'var(--font-heading)',
    fontSize: 28,
    fontWeight: 700,
    color: 'var(--green)',
    lineHeight: 1,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: 500,
    color: 'var(--gray-500)',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontFamily: 'var(--font-heading)',
    fontSize: 18,
    fontWeight: 700,
    color: 'var(--black)',
    margin: 0,
  },
  createBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    padding: '10px 18px',
    borderRadius: 'var(--radius)',
    background: 'var(--green)',
    color: 'var(--white)',
    fontFamily: 'var(--font-body)',
    fontSize: 14,
    fontWeight: 600,
    border: 'none',
    cursor: 'pointer',
    transition: 'background 0.2s',
  },
  projectGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: 16,
    marginBottom: 32,
  },
  projectCard: {
    background: 'var(--white)',
    border: '1px solid var(--gray-200)',
    borderRadius: 'var(--radius)',
    padding: 20,
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
    textDecoration: 'none',
    color: 'inherit',
    transition: 'border-color 0.2s, box-shadow 0.2s',
    boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
  },
  projectCardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
  },
  projectTitle: {
    fontFamily: 'var(--font-heading)',
    fontSize: 16,
    fontWeight: 700,
    color: 'var(--black)',
    margin: 0,
    lineHeight: 1.3,
  },
  badge: (bg, color) => ({
    fontSize: 11,
    fontWeight: 600,
    padding: '3px 8px',
    borderRadius: 100,
    background: bg,
    color: color,
    whiteSpace: 'nowrap',
    textTransform: 'capitalize',
  }),
  projectMeta: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTop: '1px solid var(--gray-100)',
  },
  metaText: {
    fontSize: 13,
    color: 'var(--gray-400)',
  },
  createFormWrap: {
    background: 'var(--white)',
    border: '1px solid var(--gray-200)',
    borderRadius: 'var(--radius)',
    padding: 28,
    marginBottom: 32,
    boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
  },
  createFormTitle: {
    fontFamily: 'var(--font-heading)',
    fontSize: 18,
    fontWeight: 700,
    marginBottom: 20,
    color: 'var(--black)',
  },
  skeletonPulse: {
    background: 'linear-gradient(90deg, var(--gray-100) 25%, var(--gray-200) 50%, var(--gray-100) 75%)',
    backgroundSize: '200% 100%',
    animation: 'shimmer 1.5s infinite',
    borderRadius: 'var(--radius)',
  },
  emptyContainer: {
    textAlign: 'center',
    padding: '48px 20px',
  },
  emptyIconCircle: {
    width: 64,
    height: 64,
    background: 'var(--gray-100)',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 20px',
  },
  emptyTitle: {
    fontFamily: 'var(--font-heading)',
    fontSize: 17,
    fontWeight: 700,
    color: 'var(--black)',
    marginBottom: 6,
  },
  emptyDesc: {
    fontSize: 14,
    color: 'var(--gray-400)',
    lineHeight: 1.6,
    maxWidth: 300,
    margin: '0 auto',
  },
};

const SkeletonLoader = () => (
  <div style={styles.page}>
    <div style={styles.welcome}>
      <div style={{ ...styles.skeletonPulse, width: 56, height: 56, borderRadius: '50%' }} />
      <div style={styles.welcomeText}>
        <div style={{ ...styles.skeletonPulse, width: 180, height: 24, marginBottom: 8 }} />
        <div style={{ ...styles.skeletonPulse, width: 140, height: 14 }} />
      </div>
    </div>
    <div style={styles.statsRow}>
      {[1, 2, 3, 4].map(i => (
        <div key={i} style={{ ...styles.skeletonPulse, height: 90 }} />
      ))}
    </div>
    <div style={{ ...styles.skeletonPulse, width: 120, height: 18, marginBottom: 16 }} />
    <div style={styles.projectGrid}>
      {[1, 2, 3, 4].map(i => (
        <div key={i} style={{ ...styles.skeletonPulse, height: 160 }} />
      ))}
    </div>
  </div>
);

const EmptyState = ({ title, description }) => (
  <div style={styles.emptyContainer}>
    <div style={styles.emptyIconCircle}>
      <svg style={{ width: 28, height: 28, stroke: 'var(--gray-400)', fill: 'none', strokeWidth: 1.5, strokeLinecap: 'round', strokeLinejoin: 'round' }} viewBox="0 0 24 24">
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
        <line x1="12" y1="8" x2="12" y2="16" />
        <line x1="8" y1="12" x2="16" y2="12" />
      </svg>
    </div>
    <h3 style={styles.emptyTitle}>{title}</h3>
    <p style={styles.emptyDesc}>{description}</p>
  </div>
);

const SMEDashboard = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);

  const fetchProjects = async () => {
    try {
      const res = await api.get('/projects');
      setProjects(res.data.projects);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProjects(); }, []);

  const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const activeCount = projects.filter(p => p.status === 'active' || p.status === 'in_review').length;
  const completedCount = projects.filter(p => p.status === 'completed').length;
  const totalBudget = projects.reduce((sum, p) => sum + (p.budget || 0), 0);

  if (loading) {
    return <SkeletonLoader />;
  }

  return (
    <div style={styles.page}>
      {/* Welcome */}
      <div style={styles.welcome}>
        {user?.profileImage ? (
          <img
            src={user.profileImage.startsWith('/') ? user.profileImage : `/uploads/${user.profileImage}`}
            alt={user.name}
            style={styles.avatar}
          />
        ) : (
          <div style={styles.initialsAvatar}>
            {getInitials(user?.name)}
          </div>
        )}
        <div style={styles.welcomeText}>
          <h1 style={styles.welcomeHeading}>Welcome, {user?.name?.split(' ')[0]}</h1>
          <p style={styles.welcomeSub}>Manage your branding projects</p>
        </div>
      </div>

      {/* Stats */}
      <div style={styles.statsRow}>
        <div style={styles.statCard}>
          <div style={styles.statNumber}>{projects.length}</div>
          <div style={styles.statLabel}>Total Projects</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statNumber}>{activeCount}</div>
          <div style={styles.statLabel}>Active</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statNumber}>{completedCount}</div>
          <div style={styles.statLabel}>Completed</div>
        </div>
        <div style={styles.statCard}>
          <div style={{ ...styles.statNumber, fontSize: 20 }}>{formatCurrency(totalBudget) || '₦0'}</div>
          <div style={styles.statLabel}>Total Budget</div>
        </div>
      </div>

      {/* Projects */}
      <div style={styles.sectionHeader}>
        <h2 style={styles.sectionTitle}>My Projects</h2>
        <button
          style={styles.createBtn}
          onClick={() => setShowCreate(!showCreate)}
        >
          {showCreate ? (
            'Cancel'
          ) : (
            <>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              New Project
            </>
          )}
        </button>
      </div>

      {showCreate && (
        <div style={styles.createFormWrap}>
          <h3 style={styles.createFormTitle}>Create New Project</h3>
          <CreateProject onCreated={() => { setShowCreate(false); fetchProjects(); }} />
        </div>
      )}

      {projects.length === 0 ? (
        <EmptyState
          title="No projects yet"
          description="Create your first branding project to get started with Branda."
        />
      ) : (
        <div style={styles.projectGrid}>
          {projects.map(project => {
            const status = statusColors[project.status] || statusColors.active;
            const remaining = daysUntil(project.deadline);
            return (
              <Link key={project._id} to={`/projects/${project._id}`} style={styles.projectCard}>
                <div style={styles.projectCardHeader}>
                  <h4 style={styles.projectTitle}>{project.title}</h4>
                  <span style={styles.badge(status.bg, status.text)}>
                    {project.status.replace('_', ' ')}
                  </span>
                </div>
                <p style={{ fontSize: 14, color: 'var(--gray-500)', margin: 0, lineHeight: 1.5 }}>
                  {project.industry || 'Branding project'}
                </p>
                {(project.budget > 0 || project.deadline) && (
                  <div style={{ display: 'flex', gap: 12, fontSize: 12, color: 'var(--gray-400)' }}>
                    {project.budget > 0 && <span style={{ fontWeight: 500 }}>{formatCurrency(project.budget)}</span>}
                    {project.deadline && (
                      <span style={{ color: remaining !== null && remaining <= 3 ? '#D97706' : undefined }}>
                        Due {new Date(project.deadline).toLocaleDateString('en-NG', { month: 'short', day: 'numeric' })}
                        {remaining !== null && remaining <= 3 && remaining >= 0 && ` (${remaining}d left)`}
                        {remaining !== null && remaining < 0 && ' (overdue)'}
                      </span>
                    )}
                  </div>
                )}
                <div style={styles.projectMeta}>
                  <span style={styles.metaText}>
                    {project.assignedSpecialist ? project.assignedSpecialist.name : 'No specialist yet'}
                  </span>
                  <span style={styles.metaText}>{new Date(project.createdAt).toLocaleDateString()}</span>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      <div style={{ marginTop: 40 }}>
        <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 18, fontWeight: 700, marginBottom: 16 }}>Quick Actions</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 12 }}>
          <Link to="/browse" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, padding: 20, background: 'var(--white)', border: '1px solid var(--gray-200)', borderRadius: 'var(--radius)', textDecoration: 'none', color: 'var(--gray-600)', fontSize: 13, fontWeight: 600 }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="22" height="22"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            Find Specialists
          </Link>
          <Link to="/case-studies" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, padding: 20, background: 'var(--white)', border: '1px solid var(--gray-200)', borderRadius: 'var(--radius)', textDecoration: 'none', color: 'var(--gray-600)', fontSize: 13, fontWeight: 600 }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="22" height="22"><path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z"/><path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z"/></svg>
            Case Studies
          </Link>
          <Link to="/tickets" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, padding: 20, background: 'var(--white)', border: '1px solid var(--gray-200)', borderRadius: 'var(--radius)', textDecoration: 'none', color: 'var(--gray-600)', fontSize: 13, fontWeight: 600 }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="22" height="22"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
            Support
          </Link>
          <Link to="/referrals" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, padding: 20, background: 'var(--white)', border: '1px solid var(--gray-200)', borderRadius: 'var(--radius)', textDecoration: 'none', color: 'var(--gray-600)', fontSize: 13, fontWeight: 600 }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="22" height="22"><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/></svg>
            Refer a Friend
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SMEDashboard;
