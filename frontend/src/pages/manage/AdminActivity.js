import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import ConfirmModal from '../../components/common/ConfirmModal';

const ACTION_LABELS = {
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
  'asset.upload': 'Asset uploaded',
  'asset.delete': 'Asset deleted',
  'settings.update': 'Settings updated',
  'subscriber.delete': 'Subscriber removed',
  'message.send': 'Message sent'
};

const ACTION_COLORS = {
  'user.register': '#059669', 'user.role_change': '#D97706', 'user.delete': '#DC2626',
  'project.create': '#3B82F6', 'project.assign': '#6f9c3e', 'project.status_change': '#8B5CF6', 'project.delete': '#DC2626',
  'kyc.submit': '#F59E0B', 'kyc.approve': '#059669', 'kyc.reject': '#DC2626',
  'asset.upload': '#3B82F6', 'asset.delete': '#DC2626',
  'settings.update': '#6B7280', 'subscriber.delete': '#6B7280', 'message.send': '#3B82F6'
};

const AdminActivity = () => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [filter, setFilter] = useState('');
  const [clearing, setClearing] = useState(false);
  const [showClearAll, setShowClearAll] = useState(false);

  useEffect(() => { loadActivities(1); }, [filter]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadActivities = async (page = 1) => {
    setLoading(true);
    try {
      const params = { page, limit: 20 };
      if (filter) params.action = filter;
      const res = await api.get('/admin/activities', { params });
      setActivities(res.data.activities);
      setPagination(res.data.pagination);
    } catch {} finally { setLoading(false); }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/admin/activities/${id}`);
      setActivities(prev => prev.filter(a => a._id !== id));
    } catch {}
  };

  const handleClearAll = async () => {
    setShowClearAll(false);
    setClearing(true);
    try {
      await api.delete('/admin/activities');
      setActivities([]);
      setPagination({ page: 1, pages: 1, total: 0 });
    } catch {} finally { setClearing(false); }
  };

  const timeAgo = (date) => {
    const secs = Math.floor((Date.now() - new Date(date)) / 1000);
    if (secs < 60) return 'just now';
    if (secs < 3600) return `${Math.floor(secs / 60)}m ago`;
    if (secs < 86400) return `${Math.floor(secs / 3600)}h ago`;
    return `${Math.floor(secs / 86400)}d ago`;
  };

  const formatDetails = (action, details) => {
    if (!details || Object.keys(details).length === 0) return '';
    switch (action) {
      case 'user.role_change': return `${details.name} → ${details.newRole}`;
      case 'user.delete': return `${details.name} (${details.email})`;
      case 'project.assign': return `${details.title} → ${details.specialist}`;
      case 'project.status_change': return `${details.title} → ${details.newStatus}`;
      case 'project.delete': return details.title;
      case 'kyc.approve': case 'kyc.reject': return `${details.name}${details.reason ? ` — ${details.reason}` : ''}`;
      case 'settings.update': return details.changes?.join(', ');
      case 'subscriber.delete': return details.email;
      default: return Object.values(details).filter(Boolean).join(' ');
    }
  };

  const filterOptions = Object.entries(ACTION_LABELS).map(([value, label]) => ({ value, label }));

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 20, fontWeight: 700, margin: 0 }}>Activity Logs</h3>
          <p style={{ fontSize: 13, color: 'var(--gray-400)', margin: '4px 0 0' }}>{pagination.total} total events</p>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <select value={filter} onChange={e => setFilter(e.target.value)} style={{
            padding: '6px 12px', borderRadius: 6, border: '1px solid var(--gray-300)',
            fontSize: 13, fontFamily: 'var(--font-body)', background: 'var(--white)'
          }}>
            <option value="">All Activity</option>
            {filterOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <button onClick={() => setShowClearAll(true)} disabled={clearing || activities.length === 0} style={{
            padding: '6px 14px', borderRadius: 6, fontSize: 13, fontWeight: 500,
            background: '#FEF2F2', color: '#DC2626', border: '1px solid #FECACA',
            cursor: 'pointer', fontFamily: 'var(--font-body)', opacity: clearing ? 0.6 : 1
          }}>
            {clearing ? 'Clearing...' : 'Clear All'}
          </button>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 40, color: 'var(--gray-400)' }}>Loading...</div>
      ) : activities.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 40, color: 'var(--gray-400)', fontSize: 14 }}>No activity logs found.</div>
      ) : (
        <>
          <div style={{ display: 'grid', gap: 2 }}>
            {activities.map(a => (
              <div key={a._id} style={{
                display: 'flex', alignItems: 'flex-start', gap: 14, padding: '14px 16px',
                background: 'var(--white)', border: '1px solid var(--gray-200)',
                borderRadius: 'var(--radius)', transition: 'border-color 0.15s'
              }}>
                <div style={{
                  width: 8, height: 8, borderRadius: '50%', marginTop: 6, flexShrink: 0,
                  background: ACTION_COLORS[a.action] || 'var(--gray-400)'
                }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                    <div>
                      <span style={{ fontSize: 14, fontWeight: 500 }}>{ACTION_LABELS[a.action] || a.action}</span>
                      {a.entityId && (
                        <span style={{ fontSize: 12, color: 'var(--gray-400)', marginLeft: 8 }}>
                          {a.entity}
                        </span>
                      )}
                    </div>
                    <span style={{ fontSize: 12, color: 'var(--gray-400)', whiteSpace: 'nowrap' }}>{timeAgo(a.createdAt)}</span>
                  </div>
                  {formatDetails(a.action, a.details) && (
                    <p style={{ fontSize: 13, color: 'var(--gray-500)', margin: '4px 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {formatDetails(a.action, a.details)}
                    </p>
                  )}
                  {a.performedBy && (
                    <p style={{ fontSize: 12, color: 'var(--gray-400)', margin: '4px 0 0' }}>
                      by {a.performedBy.name} ({a.performedBy.email})
                    </p>
                  )}
                </div>
                <button onClick={() => handleDelete(a._id)} style={{
                  background: 'none', border: 'none', color: 'var(--gray-400)', cursor: 'pointer',
                  padding: 4, fontSize: 16, lineHeight: 1, flexShrink: 0
                }} title="Delete">&times;</button>
              </div>
            ))}
          </div>

          {pagination.pages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginTop: 20 }}>
              {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(p => (
                <button key={p} onClick={() => loadActivities(p)} style={{
                  width: 32, height: 32, borderRadius: 6, fontSize: 13, fontWeight: 500,
                  border: `1px solid ${pagination.page === p ? 'var(--green)' : 'var(--gray-300)'}`,
                  background: pagination.page === p ? 'var(--green)' : 'var(--white)',
                  color: pagination.page === p ? 'var(--white)' : 'var(--gray-600)',
                  cursor: 'pointer', fontFamily: 'var(--font-body)'
                }}>{p}</button>
              ))}
            </div>
          )}
        </>
      )}
      <ConfirmModal open={showClearAll} title="Clear All Activity" message="Are you sure you want to clear all activity logs? This action cannot be undone." confirmText="Clear All" danger onConfirm={handleClearAll} onCancel={() => setShowClearAll(false)} />
    </div>
  );
};

export default AdminActivity;
