import React, { useState } from 'react';
import api from '../../api/axios';

const CloseIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const DownloadIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
  </svg>
);

const DeleteIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
    <polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
  </svg>
);

const AssetGallery = ({ assets, currentUser, onDelete, projectOwnerId }) => {
  const [preview, setPreview] = useState(null);
  const [deleting, setDeleting] = useState(null);

  if (!assets || assets.length === 0) {
    return <p style={{ fontSize: 14, color: 'var(--gray-400)' }}>No files uploaded yet</p>;
  }

  const canDelete = (asset) => {
    if (!currentUser) return false;
    if (currentUser.role === 'admin') return true;
    const isUploader = asset.uploadedBy?._id === currentUser.id || asset.uploadedBy === currentUser.id;
    if (isUploader) return true;
    if (projectOwnerId && projectOwnerId === currentUser.id) return true;
    return false;
  };

  const handleDelete = async (asset) => {
    setDeleting(asset._id);
    try {
      await api.delete(`/assets/${asset._id}`);
      if (onDelete) onDelete(asset._id);
    } catch {
      // silent
    } finally {
      setDeleting(null);
    }
  };

  const isImage = (mimeType) => mimeType && mimeType.startsWith('image/');

  return (
    <>
      {preview && (
        <div
          onClick={() => setPreview(null)}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 1000, padding: 20, cursor: 'pointer'
          }}
        >
          <div onClick={(e) => e.stopPropagation()} style={{ position: 'relative', maxWidth: '90vw', maxHeight: '90vh' }}>
            <button
              onClick={() => setPreview(null)}
              style={{
                position: 'absolute', top: -12, right: -12,
                background: 'var(--white)', border: 'none', borderRadius: '50%',
                width: 36, height: 36, display: 'flex', alignItems: 'center',
                justifyContent: 'center', cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                zIndex: 1
              }}
            >
              <CloseIcon />
            </button>
            <img
              src={preview}
              alt="Preview"
              style={{ maxWidth: '90vw', maxHeight: '85vh', borderRadius: 'var(--radius)', display: 'block' }}
            />
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12 }}>
        {assets.map(asset => (
          <div key={asset._id} style={{
            background: 'var(--gray-50)', borderRadius: 'var(--radius)',
            overflow: 'hidden', border: '1px solid var(--gray-200)'
          }}>
            {isImage(asset.mimeType) ? (
              <div
                onClick={() => setPreview(asset.fileUrl)}
                style={{ cursor: 'pointer', height: 120, overflow: 'hidden', background: 'var(--gray-100)' }}
              >
                <img
                  src={asset.fileUrl}
                  alt={asset.originalName}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>
            ) : (
              <div style={{
                height: 120, display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'var(--gray-100)', fontSize: 13, color: 'var(--gray-400)', padding: 12, textAlign: 'center'
              }}>
                {asset.mimeType?.split('/')[1]?.toUpperCase() || 'File'}
              </div>
            )}
            <div style={{ padding: 10 }}>
              <p style={{ fontSize: 12, color: 'var(--gray-600)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {asset.originalName}
              </p>
              {asset.uploadedBy?.name && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 4 }}>
                  <span style={{
                    display: 'inline-block', width: 6, height: 6, borderRadius: '50%',
                    background: asset.uploadedBy.role === 'sme' ? '#4F46E5' : asset.uploadedBy.role === 'specialist' ? '#059669' : '#DC2626'
                  }} />
                  <span style={{ fontSize: 11, color: 'var(--gray-400)' }}>{asset.uploadedBy.name}</span>
                  <span style={{
                    fontSize: 10, fontWeight: 600, padding: '1px 5px', borderRadius: 3,
                    background: asset.uploadedBy.role === 'sme' ? '#EEF2FF' : asset.uploadedBy.role === 'specialist' ? '#ECFDF5' : '#FEF2F2',
                    color: asset.uploadedBy.role === 'sme' ? '#4F46E5' : asset.uploadedBy.role === 'specialist' ? '#059669' : '#DC2626',
                    textTransform: 'capitalize'
                  }}>
                    {asset.uploadedBy.role === 'sme' ? 'Business' : asset.uploadedBy.role}
                  </span>
                </div>
              )}
              <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
                <a
                  href={asset.fileUrl}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 4,
                    padding: '4px 8px', borderRadius: 4, fontSize: 12,
                    color: 'var(--green)', background: 'var(--green-light)',
                    textDecoration: 'none', fontWeight: 500
                  }}
                >
                  <DownloadIcon /> View
                </a>
                {canDelete(asset) && (
                  <button
                    onClick={() => handleDelete(asset)}
                    disabled={deleting === asset._id}
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: 4,
                      padding: '4px 8px', borderRadius: 4, fontSize: 12,
                      color: '#DC2626', background: '#FEF2F2',
                      border: 'none', cursor: 'pointer', fontWeight: 500,
                      opacity: deleting === asset._id ? 0.5 : 1,
                      fontFamily: 'var(--font-body)'
                    }}
                  >
                    <DeleteIcon /> Delete
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

export default AssetGallery;
