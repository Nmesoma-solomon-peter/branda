import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend } from 'recharts';

const COLORS = ['#6f9c3e', '#000000', '#6B7280', '#3B82F6', '#F59E0B'];

const Card = ({ title, children, style }) => (
  <div style={{
    background: 'var(--white)', border: '1px solid var(--gray-200)',
    borderRadius: 'var(--radius)', padding: 20, ...style
  }}>
    {title && <h4 style={{ fontFamily: 'var(--font-heading)', fontSize: 14, fontWeight: 700, marginBottom: 16, color: 'var(--gray-600)' }}>{title}</h4>}
    {children}
  </div>
);

const StatCard = ({ label, value, icon, color, sub }) => (
  <div style={{
    background: 'var(--white)', border: '1px solid var(--gray-200)',
    borderRadius: 'var(--radius)', padding: '20px 24px', flex: 1, minWidth: 180,
    display: 'flex', alignItems: 'flex-start', gap: 16
  }}>
    <div style={{
      width: 44, height: 44, borderRadius: 10, background: `${color}15`,
      display: 'flex', alignItems: 'center', justifyContent: 'center', color, flexShrink: 0
    }}>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="22" height="22">
        <path d={icon} />
      </svg>
    </div>
    <div>
      <p style={{ fontSize: 12, color: 'var(--gray-400)', marginBottom: 2, fontWeight: 500 }}>{label}</p>
      <p style={{ fontFamily: 'var(--font-heading)', fontSize: 26, fontWeight: 700, color: 'var(--black)', lineHeight: 1.1 }}>{value}</p>
      {sub && <p style={{ fontSize: 11, color: 'var(--gray-400)', margin: '4px 0 0' }}>{sub}</p>}
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
    value: s.count
  }));

  const signupData = (stats.signupsByDay || []).map(s => ({
    date: s._id?.slice(5) || s._id,
    signups: s.count
  }));

  const roleData = [
    { name: 'SMEs', value: stats.smes || 0 },
    { name: 'Designers', value: stats.specialists || 0 }
  ];

  return (
    <div>
      <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 20, fontWeight: 700, marginBottom: 24 }}>Platform Overview</h3>

      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 24 }}>
        <StatCard label="Total Users" value={stats.users} color="#6f9c3e"
          icon="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
          sub={`${stats.recentUsers || 0} this month`} />
        <StatCard label="Projects" value={stats.projects} color="#000000"
          icon="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
          sub={`${stats.activeProjects || 0} active, ${stats.completedProjects || 0} done`} />
        <StatCard label="Assets" value={stats.assets} color="#3B82F6"
          icon="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        <StatCard label="Subscribers" value={stats.subscribers} color="#8B5CF6"
          icon="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        <StatCard label="Pending KYC" value={stats.pendingKyc || 0} color="#F59E0B"
          icon="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
          sub={stats.pendingKyc > 0 ? 'Needs review' : 'All clear'} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
        <Card title="Projects by Status">
          {statusData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={statusData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--gray-100)" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {statusData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : <p style={{ color: 'var(--gray-400)', fontSize: 13, textAlign: 'center', padding: 40 }}>No data</p>}
        </Card>

        <Card title="User Roles">
          {roleData.some(r => r.value > 0) ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={roleData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={4} dataKey="value">
                  {roleData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                </Pie>
                <Tooltip />
                <Legend iconType="circle" iconSize={8} />
              </PieChart>
            </ResponsiveContainer>
          ) : <p style={{ color: 'var(--gray-400)', fontSize: 13, textAlign: 'center', padding: 40 }}>No data</p>}
        </Card>
      </div>

      <Card title="Signups (Last 7 Days)">
        {signupData.length > 0 ? (
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={signupData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--gray-100)" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
              <Tooltip />
              <Line type="monotone" dataKey="signups" stroke="#6f9c3e" strokeWidth={2} dot={{ r: 4, fill: '#6f9c3e' }} />
            </LineChart>
          </ResponsiveContainer>
        ) : <p style={{ color: 'var(--gray-400)', fontSize: 13, textAlign: 'center', padding: 40 }}>No signups yet</p>}
      </Card>
    </div>
  );
};

export default AdminOverview;
