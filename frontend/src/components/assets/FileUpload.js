import React, { useState, useRef } from 'react';
import api from '../../api/axios';

const FileUpload = ({ projectId, onUploaded }) => {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);

  const handleFiles = (fileList) => {
    const allowed = [
      'image/jpeg', 'image/jpg', 'image/png', 'image/gif',
      'image/webp', 'image/svg+xml', 'application/pdf',
      'application/postscript', 'application/zip', 'application/x-zip-compressed'
    ];
    const filtered = Array.from(fileList).filter(f => allowed.includes(f.type));
    if (filtered.length === 0) {
      setError('File type not allowed');
      return;
    }
    if (filtered.length > 10) {
      setError('Maximum 10 files allowed');
      return;
    }
    setFiles(filtered);
    setError('');
  };

  const handleFileChange = (e) => handleFiles(e.target.files);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    handleFiles(e.dataTransfer.files);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => setDragOver(false);

  const handleUpload = async () => {
    if (files.length === 0) {
      setError('Please select files to upload');
      return;
    }
    setUploading(true);
    setProgress(0);
    setError('');
    try {
      const formData = new FormData();
      files.forEach(f => formData.append('files', f));

      await api.post(`/assets/upload/${projectId}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (e) => {
          if (e.total) setProgress(Math.round((e.loaded * 100) / e.total));
        }
      });
      setFiles([]);
      setProgress(0);
      if (fileInputRef.current) fileInputRef.current.value = '';
      if (onUploaded) onUploaded();
    } catch (err) {
      setError(err.response?.data?.error || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const removeFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div>
      <input
        type="file"
        ref={fileInputRef}
        multiple
        accept="image/*,.pdf,.psd,.ai,.zip"
        onChange={handleFileChange}
        style={{ display: 'none' }}
        id={`file-upload-${projectId}`}
      />
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => fileInputRef.current?.click()}
        style={{
          display: 'block',
          padding: 32,
          border: `2px dashed ${dragOver ? 'var(--green)' : 'var(--gray-300)'}`,
          borderRadius: 'var(--radius)',
          textAlign: 'center',
          cursor: 'pointer',
          fontSize: 14,
          color: dragOver ? 'var(--green)' : 'var(--gray-500)',
          marginBottom: 12,
          transition: 'border-color 0.2s, color 0.2s',
          background: dragOver ? 'var(--green-light)' : 'transparent'
        }}
      >
        {files.length > 0 ? `${files.length} file(s) selected` : 'Click or drag files here'}
      </div>

      {files.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
          {files.map((file, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '6px 10px', background: 'var(--gray-50)',
              borderRadius: 'var(--radius)', fontSize: 13
            }}>
              {file.type.startsWith('image/') && (
                <img
                  src={URL.createObjectURL(file)}
                  alt={file.name}
                  style={{ width: 28, height: 28, objectFit: 'cover', borderRadius: 4 }}
                />
              )}
              <span style={{ maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {file.name}
              </span>
              <button
                onClick={(e) => { e.stopPropagation(); removeFile(i); }}
                style={{ background: 'none', border: 'none', color: 'var(--gray-400)', cursor: 'pointer', padding: 0, fontSize: 16, lineHeight: 1 }}
              >
                &times;
              </button>
            </div>
          ))}
        </div>
      )}

      {error && <p style={{ color: '#DC2626', fontSize: 13, marginBottom: 8 }}>{error}</p>}

      {uploading && (
        <div style={{ marginBottom: 12 }}>
          <div style={{ height: 6, background: 'var(--gray-200)', borderRadius: 3, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${progress}%`, background: 'var(--green)', borderRadius: 3, transition: 'width 0.2s' }} />
          </div>
          <p style={{ fontSize: 12, color: 'var(--gray-400)', marginTop: 4, textAlign: 'right' }}>{progress}%</p>
        </div>
      )}

      {files.length > 0 && (
        <button onClick={handleUpload} className="btn btn-primary" disabled={uploading} style={{ width: '100%' }}>
          {uploading ? 'Uploading...' : 'Upload Files'}
        </button>
      )}
    </div>
  );
};

export default FileUpload;
