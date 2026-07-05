import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import ConfirmModal from '../../components/common/ConfirmModal';

const AdminAssets = () => {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [preview, setPreview] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  useEffect(() => {
    api.get('/admin/assets')
      .then(res => setAssets(res.data.assets))
      .catch(() => {}).finally(() => setLoading(false));
  }, []);

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await api.delete(`/assets/${deleteId}`);
      setAssets(prev => prev.filter(a => a._id !== deleteId));
    } catch {} finally { setDeleteId(null); }
  };

  const isImage = (m) => m?.startsWith('image/');

  if (loading) return <div className="skeleton" style={{ height: 300 }} />;

  return (
    <div>
      {preview && (
        <div onClick={() => setPreview(null)} style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, cursor: 'pointer'
        }}>
          <img src={preview} alt="Preview" style={{ maxWidth: '90vw', maxHeight: '85vh', borderRadius: 'var(--radius)' }} />
        </div>
      )}

      <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 20, fontWeight: 700, marginBottom: 24 }}>Assets ({assets.length})</h3>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
        {assets.map(asset => (
          <div key={asset._id} style={{
            background: 'var(--white)', border: '1px solid var(--gray-200)',
            borderRadius: 'var(--radius)', overflow: 'hidden'
          }}>
            {isImage(asset.mimeType) ? (
              <div onClick={() => setPreview(asset.fileUrl)} style={{ height: 140, cursor: 'pointer', background: 'var(--gray-100)' }}>
                <img src={asset.fileUrl} alt={asset.originalName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            ) : (
              <div style={{ height: 140, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--gray-100)', fontSize: 12, color: 'var(--gray-400)' }}>
                {asset.mimeType?.split('/')[1]?.toUpperCase() || 'File'}
              </div>
            )}
            <div style={{ padding: 10 }}>
              <p style={{ fontSize: 12, color: 'var(--gray-600)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{asset.originalName}</p>
              <p style={{ fontSize: 11, color: 'var(--gray-400)', margin: '4px 0 0' }}>
                {asset.uploadedBy?.name || 'Unknown'} | {asset.project?.title || 'No project'}
              </p>
              <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
                <a href={asset.fileUrl} target="_blank" rel="noreferrer" style={{
                  fontSize: 11, padding: '3px 8px', borderRadius: 4, background: 'var(--green-light)',
                  color: 'var(--green)', fontWeight: 500, textDecoration: 'none'
                }}>View</a>
                <button onClick={() => setDeleteId(asset._id)} style={{
                  fontSize: 11, padding: '3px 8px', borderRadius: 4, background: '#FEF2F2',
                  color: '#DC2626', border: 'none', cursor: 'pointer', fontWeight: 500,
                  fontFamily: 'var(--font-body)'
                }}>Delete</button>
              </div>
            </div>
          </div>
        ))}
      </div>
      <ConfirmModal open={!!deleteId} title="Delete Asset" message="Are you sure you want to delete this asset? This action cannot be undone." confirmText="Delete" danger onConfirm={handleDelete} onCancel={() => setDeleteId(null)} />
    </div>
  );
};

export default AdminAssets;
