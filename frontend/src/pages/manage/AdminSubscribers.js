import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import ConfirmModal from '../../components/common/ConfirmModal';

const AdminSubscribers = () => {
  const [subscribers, setSubscribers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState(null);

  useEffect(() => {
    api.get('/admin/subscribers')
      .then(res => setSubscribers(res.data.subscribers))
      .catch(() => {}).finally(() => setLoading(false));
  }, []);

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await api.delete(`/admin/subscribers/${deleteId}`);
      setSubscribers(prev => prev.filter(s => s._id !== deleteId));
    } catch {} finally { setDeleteId(null); }
  };

  const handleExport = () => {
    const csv = subscribers.map(s => s.email).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'subscribers.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) return <div className="skeleton" style={{ height: 300 }} />;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 20, fontWeight: 700 }}>Subscribers ({subscribers.length})</h3>
        {subscribers.length > 0 && (
          <button onClick={handleExport} style={{
            padding: '8px 16px', borderRadius: 'var(--radius)', border: '1px solid var(--gray-300)',
            background: 'var(--white)', fontSize: 13, fontWeight: 500, cursor: 'pointer',
            fontFamily: 'var(--font-body)'
          }}>Export CSV</button>
        )}
      </div>

      <div style={{ background: 'var(--white)', border: '1px solid var(--gray-200)', borderRadius: 'var(--radius)', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14, minWidth: 400 }}>
          <thead>
            <tr style={{ background: 'var(--gray-50)', borderBottom: '1px solid var(--gray-200)' }}>
              <th style={{ textAlign: 'left', padding: '12px 16px', fontWeight: 500, color: 'var(--gray-500)', fontSize: 13 }}>Email</th>
              <th style={{ textAlign: 'left', padding: '12px 16px', fontWeight: 500, color: 'var(--gray-500)', fontSize: 13 }}>Subscribed</th>
              <th style={{ textAlign: 'right', padding: '12px 16px', fontWeight: 500, color: 'var(--gray-500)', fontSize: 13 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {subscribers.map(s => (
              <tr key={s._id} style={{ borderBottom: '1px solid var(--gray-100)' }}>
                <td style={{ padding: '12px 16px' }}>{s.email}</td>
                <td style={{ padding: '12px 16px', color: 'var(--gray-400)', fontSize: 13 }}>{new Date(s.createdAt).toLocaleDateString()}</td>
                <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                  <button onClick={() => setDeleteId(s._id)} style={{
                    padding: '4px 10px', borderRadius: 4, border: '1px solid #FECACA',
                    background: '#FEF2F2', color: '#DC2626', fontSize: 12, cursor: 'pointer',
                    fontWeight: 500, fontFamily: 'var(--font-body)'
                  }}>Remove</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </div>
      <ConfirmModal open={!!deleteId} title="Remove Subscriber" message="Are you sure you want to remove this subscriber?" confirmText="Remove" danger onConfirm={handleDelete} onCancel={() => setDeleteId(null)} />
    </div>
  );
};

export default AdminSubscribers;
