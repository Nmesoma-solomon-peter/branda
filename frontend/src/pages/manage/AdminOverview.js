import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend, AreaChart, Area } from 'recharts';

const COLORS = ['#6f9c3e', '#000000', '#6B7280', '#3B82F6', '#F59E0B', '#8B5CF6', '#EC4899'];
const STATUS_COLORS = { open: '#3B82F6', active: '#6f9c3e', in_review: '#F59E0B', revision: '#8B5CF6', completed: '#059669', dispute: '#DC2626', draft: '#6B7280' };

const formatCurrency = (amount) => {
  if (!amount && amount !== 0) return 'N0';
  return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 }).format(amount);
};

const formatDate = (d) => {
  const date = new Date(d);
  const now = new Date();
  const diff = now - date;
  if (diff < 60000) return 'Just now';
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  if (diff < 604800000) return `${Math.floor(diff / 86400000)}d ago`;
  return date.toLocaleDateString('en-NG', { month: 'short', day: 'numeric' });
};

const actionLabels = {
  'user.register': 'New user registered',
  'user.role_change': 'User role changed',
  'user.delete': 'User deleted',
  'project.create': 'Project created',
  'project.assign': 'Project assigned',
  'project.status_change': 'Project status changed',
  'project.delete': 'Project deleted',
  'kyc.submit': 'KYC submitted',
  'kyc.approve': 'KYC approved',
  'kyc.reject': 'KYC rejected',
  'asset.upload': 'File uploaded',
  'asset.delete': 'File deleted',
  'settings.update': 'Settings updated'
};

const actionColors = {
  'user.register': '#059669', 'project.create': '#3B82F6', 'project.assign': '#8B5CF6',
  'project.status_change': '#F59E0B', 'project.complete': '#059669',
  'kyc.approve': '#059669', 'kyc.submit': '#F59E0B', 'kyc.reject': '#DC2626',
  'asset.upload': '#3B82F6', 'asset.delete': '#DC2626'
};

const Card = ({ title, children, style }) => (
  <div style={{ background: 'var(--white)', border: '1px solid var(--gray-200)', borderRadius: 'var(--radius)', padding: 20, ...style }}>
    {title && <h4 style={{ fontFamily: 'var(--font-heading)', fontSize: 14, fontWeight: 700, marginBottom: 16, color: 'var(--gray-600)' }}>{title}</h4>}
    {children}
  </div>
);

const StatCard = ({ label, value, icon, color, sub, trend, trendUp }) => (
  <div style={{
    background: 'var(--white)', border: '1px solid var(--gray-200)', borderRadius: 'var(--radius)',
    padding: '20px 24px', flex: 1, minWidth: 200, display: 'flex', alignItems: 'flex-start', gap: 16
  }}>
    <div style={{
      width: 44, height: 44, borderRadius: 10, background: `${color}15`,
      display: 'flex', alignItems: 'center', justifyContent: 'center', color, flexShrink: 0
    }}>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="22" height="22">
        <path d={icon} />
      </svg>
    </div>
    <div style={{ flex: 1 }}>
      <p style={{ fontSize: 12, color: 'var(--gray-400)', marginBottom: 2, fontWeight: 500 }}>{label}</p>
      <p style={{ fontFamily: 'var(--font-heading)', fontSize: 26, fontWeight: 700, lineHeight: 1.1 }}>{value}</p>
      {sub && <p style={{ fontSize: 11, color: 'var(--gray-400)', margin: '2px 0 0' }}>{sub}</p>}
      {trend !== undefined && (
        <p style={{ fontSize: 11, margin: '2px 0 0', color: trendUp ? '#059669' : '#DC2626', fontWeight: 500 }}>
          {trendUp ? '↑' : '↓'} {trend} this month
        </p>
      )}
    </div>
  </div>
);

const AlertBadge = ({ count, label, color, icon }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: `${color}08`, borderRadius: 8, border: `1px solid ${color}20` }}>
    <div style={{ width: 32, height: 32, borderRadius: 8, background: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" width="16" height="16">
        <path d={icon} />
      </svg>
    </div>
    <div>
      <p style={{ fontSize: 18, fontWeight: 700, color, margin: 0, lineHeight: 1.2 }}>{count}</p>
      <p style={{ fontSize: 11, color: 'var(--gray-500)', margin: 0 }}>{label}</p>
    </div>
  </div>
);

const AdminOverview = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/stats')
      .then(res => setStats(res.data.stats))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="skeleton" style={{ height: 120 }} />;
  if (!stats) return <p style={{ color: 'var(--gray-400)' }}>Failed to load stats</p>;

  const statusData = (stats.projectsByStatus || []).map(s => ({
    name: s._id?.charAt(0).toUpperCase() + s._id?.slice(1) || 'Unknown',
    value: s.count,
    fill: STATUS_COLORS[s._id] || '#6B7280'
  }));

  const signupData = (stats.signupsByDay || []).map(s => ({
    date: s._id?.slice(5) || s._id,
    signups: s.count
  }));

  const revenueData = (stats.revenueByDay || []).map(s => ({
    date: s._id?.slice(5) || s._id,
    revenue: s.revenue
  }));

  const roleData = [
    { name: 'SMEs', value: stats.smes || 0 },
    { name: 'Designers', value: stats.specialists || 0 },
    { name: 'Admins', value: stats.admins || 0 }
  ].filter(r => r.value > 0);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 20, fontWeight: 700 }}>Platform Overview</h3>
      </div>

      {/* Summary Cards */}
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 24 }}>
        <StatCard label="Total Users" value={stats.users} color="#6f9c3e"
          icon="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
          sub={`${stats.smes} SMEs · ${stats.specialists} Designers · ${stats.admins || 0} Admins`}
          trend={stats.recentUsers} trendUp />
        <StatCard label="Revenue" value={formatCurrency(stats.totalRevenue)} color="#059669"
          icon="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"
          sub={stats.pendingPayouts > 0 ? `${formatCurrency(stats.pendingPayouts)} in escrow` : 'No pending payouts'}
          trend={formatCurrency(stats.monthlyRevenue)} trendUp />
        <StatCard label="Projects" value={stats.projects} color="#000000"
          icon="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
          sub={`${stats.activeProjects} active · ${stats.completedProjects} done · ${stats.projectCompletionRate}% completion`}
          trend={stats.recentProjects} trendUp />
        <StatCard label="Reviews" value={`${stats.totalReviews || 0}`} color="#8B5CF6"
          icon="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
          sub={`Avg ${stats.avgRating || 0} / 5 · ${stats.reportedReviews || 0} reported`} />
        <StatCard label="Proposals" value={stats.totalProposals || 0} color="#3B82F6"
          icon="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          sub={`${stats.pendingProposals} pending · ${stats.acceptedProposals || 0} accepted`} />
        <StatCard label="KYC" value={stats.pendingKyc || 0} color="#F59E0B"
          icon="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
          sub={`${stats.kycApproved || 0} approved · ${stats.pendingKyc > 0 ? 'Needs review' : 'All clear'}`} />
      </div>

      {/* Alerts Row */}
      {(stats.disputedProjects > 0 || stats.openTickets > 0 || stats.reportedReviews > 0 || stats.pendingKyc > 0) && (
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 24 }}>
          {stats.disputedProjects > 0 && (
            <AlertBadge count={stats.disputedProjects} label="Disputed Projects" color="#DC2626"
              icon="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          )}
          {stats.openTickets > 0 && (
            <AlertBadge count={stats.openTickets} label="Open Tickets" color="#F59E0B"
              icon="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
          )}
          {stats.reportedReviews > 0 && (
            <AlertBadge count={stats.reportedReviews} label="Flagged Reviews" color="#DC2626"
              icon="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          )}
          {stats.pendingKyc > 0 && (
            <AlertBadge count={stats.pendingKyc} label="Pending KYC" color="#3B82F6"
              icon="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          )}
        </div>
      )}

      {/* Charts Row 1 */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
        <Card title="Projects by Status">
          {statusData.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={statusData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--gray-100)" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {statusData.map((entry, i) => <Cell key={i} fill={entry.fill || COLORS[i % COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : <p style={{ color: 'var(--gray-400)', fontSize: 13, textAlign: 'center', padding: 40 }}>No data</p>}
        </Card>

        <Card title="User Roles">
          {roleData.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={roleData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={4} dataKey="value">
                  {roleData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                </Pie>
                <Tooltip />
                <Legend iconType="circle" iconSize={8} />
              </PieChart>
            </ResponsiveContainer>
          ) : <p style={{ color: 'var(--gray-400)', fontSize: 13, textAlign: 'center', padding: 40 }}>No data</p>}
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
        <Card title="Revenue (Last 30 Days)">
          {revenueData.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#059669" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#059669" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--gray-100)" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `N${(v / 1000).toFixed(0)}k`} />
                <Tooltip formatter={value => formatCurrency(value)} />
                <Area type="monotone" dataKey="revenue" stroke="#059669" strokeWidth={2} fill="url(#revenueGrad)" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          ) : <p style={{ color: 'var(--gray-400)', fontSize: 13, textAlign: 'center', padding: 40 }}>No revenue data yet</p>}
        </Card>

        <Card title="Signups (Last 30 Days)">
          {signupData.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={signupData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--gray-100)" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Line type="monotone" dataKey="signups" stroke="#6f9c3e" strokeWidth={2} dot={{ r: 3, fill: '#6f9c3e' }} />
              </LineChart>
            </ResponsiveContainer>
          ) : <p style={{ color: 'var(--gray-400)', fontSize: 13, textAlign: 'center', padding: 40 }}>No signups yet</p>}
        </Card>
      </div>

      {/* Bottom Grid: Activity + Top Specialists + Recent Signups */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 16, marginBottom: 16 }}>
        <Card title="Recent Activity">
          {stats.recentActivity?.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {stats.recentActivity.map((a, i) => (
                <div key={a._id || i} style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '10px 0', borderBottom: i < stats.recentActivity.length - 1 ? '1px solid var(--gray-100)' : 'none'
                }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: `${actionColors[a.action] || '#6B7280'}15`,
                    color: actionColors[a.action] || '#6B7280'
                  }}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
                      <path d={a.action === 'user.register' ? 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' : 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z'} />
                    </svg>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 13, fontWeight: 500, margin: 0 }}>
                      {actionLabels[a.action] || a.action}
                    </p>
                    {a.performedBy?.name && (
                      <p style={{ fontSize: 11, color: 'var(--gray-400)', margin: '1px 0 0' }}>
                        by {a.performedBy.name}
                        {a.details?.name && ` · ${a.details.name}`}
                      </p>
                    )}
                  </div>
                  <span style={{ fontSize: 11, color: 'var(--gray-400)', whiteSpace: 'nowrap', flexShrink: 0 }}>
                    {formatDate(a.createdAt)}
                  </span>
                </div>
              ))}
            </div>
          ) : <p style={{ color: 'var(--gray-400)', fontSize: 13, textAlign: 'center', padding: 40 }}>No recent activity</p>}
        </Card>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Card title="Top Specialists">
            {stats.topSpecialists?.length > 0 ? (
              <div>
                {stats.topSpecialists.map((s, i) => (
                  <div key={s._id} style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '8px 0', borderBottom: i < stats.topSpecialists.length - 1 ? '1px solid var(--gray-100)' : 'none'
                  }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--gray-400)', width: 20 }}>#{i + 1}</span>
                    {s.profileImage ? (
                      <img src={s.profileImage} alt="" style={{ width: 28, height: 28, borderRadius: '50%', objectFit: 'cover' }} />
                    ) : (
                      <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--green)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, flexShrink: 0 }}>
                        {s.name?.[0]?.toUpperCase() || '?'}
                      </div>
                    )}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 13, fontWeight: 500, margin: 0 }}>{s.name}</p>
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--green)' }}>{s.projectsCompleted} completed</span>
                  </div>
                ))}
              </div>
            ) : <p style={{ color: 'var(--gray-400)', fontSize: 13, textAlign: 'center', padding: 20 }}>No data yet</p>}
          </Card>

          <Card title="Recent Signups">
            {stats.recentSignups?.length > 0 ? (
              <div>
                {stats.recentSignups.map((u, i) => (
                  <div key={u._id} style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '8px 0', borderBottom: i < stats.recentSignups.length - 1 ? '1px solid var(--gray-100)' : 'none'
                  }}>
                    <div style={{
                      width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                      background: u.role === 'sme' ? '#EEF2FF' : u.role === 'specialist' ? '#ECFDF5' : '#FEF2F2',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 11, fontWeight: 700,
                      color: u.role === 'sme' ? '#4F46E5' : u.role === 'specialist' ? '#059669' : '#DC2626'
                    }}>
                      {u.name?.[0]?.toUpperCase() || '?'}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 13, fontWeight: 500, margin: 0 }}>{u.name}</p>
                      <p style={{ fontSize: 11, color: 'var(--gray-400)', margin: 0, textTransform: 'capitalize' }}>{u.role}</p>
                    </div>
                    <span style={{ fontSize: 11, color: 'var(--gray-400)', whiteSpace: 'nowrap' }}>
                      {formatDate(u.createdAt)}
                    </span>
                  </div>
                ))}
              </div>
            ) : <p style={{ color: 'var(--gray-400)', fontSize: 13, textAlign: 'center', padding: 20 }}>No recent signups</p>}
          </Card>
        </div>
      </div>

      {/* Quick Stats Row */}
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <Card title="General" style={{ flex: 1, minWidth: 200 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
              <span style={{ color: 'var(--gray-500)' }}>Assets</span>
              <span style={{ fontWeight: 600 }}>{stats.assets || 0}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
              <span style={{ color: 'var(--gray-500)' }}>Subscribers</span>
              <span style={{ fontWeight: 600 }}>{stats.subscribers || 0}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
              <span style={{ color: 'var(--gray-500)' }}>Total Chats</span>
              <span style={{ fontWeight: 600 }}>{stats.totalChats || 0}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
              <span style={{ color: 'var(--gray-500)' }}>Open Tickets</span>
              <span style={{ fontWeight: 600, color: stats.openTickets > 0 ? '#F59E0B' : 'inherit' }}>{stats.openTickets || 0}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
              <span style={{ color: 'var(--gray-500)' }}>Project Completion Rate</span>
              <span style={{ fontWeight: 600 }}>{stats.projectCompletionRate || 0}%</span>
            </div>
          </div>
        </Card>

        <Card title="Monthly Revenue Breakdown" style={{ flex: 1, minWidth: 200 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
              <span style={{ color: 'var(--gray-500)' }}>This Month</span>
              <span style={{ fontWeight: 600 }}>{formatCurrency(stats.monthlyRevenue)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
              <span style={{ color: 'var(--gray-500)' }}>All Time</span>
              <span style={{ fontWeight: 600 }}>{formatCurrency(stats.totalRevenue)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
              <span style={{ color: 'var(--gray-500)' }}>In Escrow</span>
              <span style={{ fontWeight: 600, color: stats.pendingPayouts > 0 ? '#F59E0B' : 'inherit' }}>{formatCurrency(stats.pendingPayouts)}</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Exports Section */}
      <div style={{ marginTop: 24 }}>
        <Card title="Export Data">
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {[
              { label: 'Users CSV', url: '/admin/export/users', color: '#6f9c3e' },
              { label: 'Projects CSV', url: '/admin/export/projects', color: '#000000' },
              { label: 'Payments CSV', url: '/admin/export/payments', color: '#059669' },
              { label: 'Activity CSV', url: '/admin/export/activity', color: '#3B82F6' }
            ].map(exp => (
              <a key={exp.label} href={exp.url} target="_blank" rel="noreferrer" style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                padding: '8px 16px', borderRadius: 6, fontSize: 13, fontWeight: 500,
                background: `${exp.color}10`, color: exp.color,
                border: `1px solid ${exp.color}30`, textDecoration: 'none'
              }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="14" height="14">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
                </svg>
                {exp.label}
              </a>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AdminOverview;