import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

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
  welcomeText: { flex: 1 },
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
    gridTemplateColumns: 'repeat(3, 1fr)',
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
  actionsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: 12,
    marginBottom: 32,
  },
  actionCard: {
    background: 'var(--white)',
    border: '1px solid var(--gray-200)',
    borderRadius: 'var(--radius)',
    padding: '24px 16px',
    textAlign: 'center',
    textDecoration: 'none',
    color: 'inherit',
    transition: 'border-color 0.2s, box-shadow 0.2s',
    boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 10,
  },
  actionIcon: {
    width: 44,
    height: 44,
    borderRadius: '50%',
    background: 'var(--green-light)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionIconSvg: {
    width: 20,
    height: 20,
    stroke: 'var(--green)',
    fill: 'none',
    strokeWidth: 1.5,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
  },
  actionLabel: {
    fontSize: 13,
    fontWeight: 600,
    color: 'var(--black)',
    fontFamily: 'var(--font-body)',
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
      {[1, 2, 3].map(i => (
        <div key={i} style={{ ...styles.skeletonPulse, height: 90 }} />
      ))}
    </div>
    <div style={{ ...styles.skeletonPulse, width: 120, height: 18, marginBottom: 16 }} />
    <div style={styles.projectGrid}>
      {[1, 2, 3, 4].map(i => (
        <div key={i} style={{ ...styles.skeletonPulse, height: 140 }} />
      ))}
    </div>
  </div>
);

const EmptyState = ({ title, description }) => (
  <div style={styles.emptyContainer}>
    <div style={styles.emptyIconCircle}>
      <svg style={styles.actionIconSvg} viewBox="0 0 24 24" stroke="var(--gray-400)">
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
        <line x1="9" y1="3" x2="9" y2="21" />
      </svg>
    </div>
    <h3 style={styles.emptyTitle}>{title}</h3>
    <p style={styles.emptyDesc}>{description}</p>
  </div>
);

const SpecialistDashboard = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [acceptLoading, setAcceptLoading] = useState({});

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await api.get('/projects/specialist');
        setProjects(res.data.projects);
      } catch {
        // silent
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, []);

  const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const handleAcceptDecline = async (projectId, action) => {
    setAcceptLoading(prev => ({ ...prev, [projectId]: true }));
    try {
      await api.put(`/projects/${projectId}/accept`, { action });
      setProjects(prev => prev.map(p => p._id === projectId ? { ...p, acceptanceStatus: action } : p));
    } catch {
      // silent
    } finally {
      setAcceptLoading(prev => ({ ...prev, [projectId]: false }));
    }
  };

  const activeCount = projects.filter(p => p.status === 'active' || p.status === 'in_review').length;
  const completedCount = projects.filter(p => p.status === 'completed').length;
  const pendingCount = projects.filter(p => p.acceptanceStatus === 'pending').length;

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
          <p style={styles.welcomeSub}>Here is your project overview</p>
        </div>
      </div>

      {/* Stats */}
      <div style={styles.statsRow}>
        <div style={styles.statCard}>
          <div style={styles.statNumber}>{activeCount}</div>
          <div style={styles.statLabel}>Active</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statNumber}>{completedCount}</div>
          <div style={styles.statLabel}>Completed</div>
        </div>
        <div style={styles.statCard}>
          <div style={{ ...styles.statNumber, color: pendingCount > 0 ? '#D97706' : 'var(--gray-400)' }}>
            {pendingCount}
          </div>
          <div style={styles.statLabel}>Pending</div>
        </div>
      </div>

      {/* Pending Acceptances */}
      {projects.filter(p => p.acceptanceStatus === 'pending').length > 0 && (
        <>
          <div style={styles.sectionHeader}>
            <h2 style={styles.sectionTitle}>Pending Assignments</h2>
          </div>
          <div style={{ marginBottom: 32 }}>
            {projects.filter(p => p.acceptanceStatus === 'pending').map(project => (
              <div key={project._id} style={{ background: '#EEF2FF', border: '1px solid #C7D2FE', borderRadius: 'var(--radius)', padding: 16, marginBottom: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
                <div>
                  <p style={{ fontSize: 15, fontWeight: 600, margin: 0 }}>{project.title}</p>
                  <p style={{ fontSize: 13, color: 'var(--gray-500)', margin: '4px 0 0' }}>From {project.owner?.name || 'Unknown client'} -- {project.industry}</p>
                  {project.budget > 0 && <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--green)', margin: '4px 0 0' }}>{formatCurrency(project.budget)}</p>}
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    onClick={() => handleAcceptDecline(project._id, 'accepted')}
                    disabled={acceptLoading[project._id]}
                    style={{ padding: '8px 16px', borderRadius: 'var(--radius)', border: 'none', background: 'var(--green)', color: 'var(--white)', fontSize: 13, fontWeight: 600, cursor: acceptLoading[project._id] ? 'not-allowed' : 'pointer', opacity: acceptLoading[project._id] ? 0.6 : 1, fontFamily: 'var(--font-body)' }}
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => handleAcceptDecline(project._id, 'declined')}
                    disabled={acceptLoading[project._id]}
                    style={{ padding: '8px 16px', borderRadius: 'var(--radius)', border: '1px solid var(--gray-300)', background: 'var(--white)', fontSize: 13, fontWeight: 500, cursor: acceptLoading[project._id] ? 'not-allowed' : 'pointer', opacity: acceptLoading[project._id] ? 0.6 : 1, fontFamily: 'var(--font-body)' }}
                  >
                    Decline
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Projects */}
      <div style={styles.sectionHeader}>
        <h2 style={styles.sectionTitle}>My Projects</h2>
      </div>

      {projects.length === 0 ? (
        <EmptyState
          title="No assigned projects"
          description="Projects assigned to you will appear here once a client selects you."
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
                      </span>
                    )}
                  </div>
                )}
                <div style={styles.projectMeta}>
                  <span style={styles.metaText}>{project.owner?.name || 'Unknown client'}</span>
                  <span style={styles.metaText}>{new Date(project.createdAt).toLocaleDateString()}</span>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {/* Quick Actions */}
      <div style={styles.sectionHeader}>
        <h2 style={styles.sectionTitle}>Quick Actions</h2>
      </div>
      <div style={styles.actionsGrid}>
        <Link to="/profile" style={styles.actionCard}>
          <div style={styles.actionIcon}>
            <svg style={styles.actionIconSvg} viewBox="0 0 24 24">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </div>
          <span style={styles.actionLabel}>View Profile</span>
        </Link>
        <Link to="/portfolio" style={styles.actionCard}>
          <div style={styles.actionIcon}>
            <svg style={styles.actionIconSvg} viewBox="0 0 24 24">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <polyline points="21 15 16 10 5 21" />
            </svg>
          </div>
          <span style={styles.actionLabel}>My Portfolio</span>
        </Link>
        <Link to="/kyc" style={styles.actionCard}>
          <div style={styles.actionIcon}>
            <svg style={styles.actionIconSvg} viewBox="0 0 24 24">
              <rect x="2" y="5" width="20" height="14" rx="2" />
              <path d="M2 10h20" />
            </svg>
          </div>
          <span style={styles.actionLabel}>Complete KYC</span>
        </Link>
        <Link to="/earnings" style={styles.actionCard}>
          <div style={styles.actionIcon}>
            <svg style={styles.actionIconSvg} viewBox="0 0 24 24">
              <line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
            </svg>
          </div>
          <span style={styles.actionLabel}>Earnings</span>
        </Link>
        <Link to="/packages" style={styles.actionCard}>
          <div style={styles.actionIcon}>
            <svg style={styles.actionIconSvg} viewBox="0 0 24 24">
              <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 002 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0022 16z" />
            </svg>
          </div>
          <span style={styles.actionLabel}>Packages</span>
        </Link>
        <Link to="/availability" style={styles.actionCard}>
          <div style={styles.actionIcon}>
            <svg style={styles.actionIconSvg} viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
            </svg>
          </div>
          <span style={styles.actionLabel}>Availability</span>
        </Link>
        <Link to="/tickets" style={styles.actionCard}>
          <div style={styles.actionIcon}>
            <svg style={styles.actionIconSvg} viewBox="0 0 24 24">
              <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
            </svg>
          </div>
          <span style={styles.actionLabel}>Support</span>
        </Link>
      </div>
    </div>
  );
};

export default SpecialistDashboard;
