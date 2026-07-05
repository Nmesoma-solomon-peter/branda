import React, { useState, useRef } from 'react';
import api from '../api/axios';
import ConfirmModal from './ConfirmModal';

const AnnotationOverlay = ({ assetId, projectId, annotations: initialAnnotations, onUpdate }) => {
  const [annotations, setAnnotations] = useState(initialAnnotations || []);
  const [showForm, setShowForm] = useState(false);
  const [pendingPos, setPendingPos] = useState({ x: 0, y: 0 });
  const [newText, setNewText] = useState('');
  const [replyTo, setReplyTo] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [saving, setSaving] = useState(false);
  const [deleteModal, setDeleteModal] = useState({ open: false, id: null });
  const [activePin, setActivePin] = useState(null);
  const imgRef = useRef(null);

  const handleClick = (e) => {
    if (showForm || replyTo) return;
    const rect = imgRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width * 100).toFixed(2);
    const y = ((e.clientY - rect.top) / rect.height * 100).toFixed(2);
    setPendingPos({ x: parseFloat(x), y: parseFloat(y) });
    setShowForm(true);
  };

  const handleAddAnnotation = async () => {
    if (!newText.trim()) return;
    setSaving(true);
    try {
      const res = await api.post('/annotations', {
        assetId,
        projectId,
        x: pendingPos.x,
        y: pendingPos.y,
        text: newText
      });
      setAnnotations(prev => [res.data.annotation, ...prev]);
      setNewText('');
      setShowForm(false);
      onUpdate?.();
    } catch {} finally { setSaving(false); }
  };

  const handleReply = async (annotationId) => {
    if (!replyText.trim()) return;
    setSaving(true);
    try {
      const res = await api.post(`/annotations/${annotationId}/reply`, { text: replyText });
      setAnnotations(prev => prev.map(a => a._id === annotationId ? res.data.annotation : a));
      setReplyText('');
      setReplyTo(null);
    } catch {} finally { setSaving(false); }
  };

  const handleResolve = async (annotationId) => {
    try {
      const res = await api.put(`/annotations/${annotationId}/resolve`);
      setAnnotations(prev => prev.map(a => a._id === annotationId ? res.data.annotation : a));
    } catch {}
  };

  const handleDelete = async () => {
    if (!deleteModal.id) return;
    try {
      await api.delete(`/annotations/${deleteModal.id}`);
      setAnnotations(prev => prev.filter(a => a._id !== deleteModal.id));
    } catch {} finally { setDeleteModal({ open: false, id: null }); }
  };

  return (
    <>
      <style>{`
        .ao-container { position: relative; display: inline-block; width: 100%; }
        .ao-pin { position: absolute; width: 24px; height: 24px; border-radius: 50% 50% 50% 0; background: var(--green); transform: rotate(-45deg) translate(-50%, -50%); cursor: pointer; display: flex; align-items: center; justify-content: center; z-index: 10; transition: transform 0.1s; }
        .ao-pin:hover { transform: rotate(-45deg) translate(-50%, -50%) scale(1.15); }
        .ao-pin.active { background: #DC2626; }
        .ao-pin-num { transform: rotate(45deg); font-size: 10px; font-weight: 700; color: var(--white); }
        .ao-pin.resolved { background: var(--gray-400); }
        .ao-sidebar { position: absolute; top: 0; right: -320px; width: 310px; max-height: 100%; overflow-y: auto; background: var(--white); border: 1px solid var(--gray-200); border-radius: var(--radius); padding: 16px; z-index: 20; }
        .ao-item { padding: 12px; border: 1px solid var(--gray-200); border-radius: 8px; margin-bottom: 10px; cursor: pointer; }
        .ao-item:hover { border-color: var(--green); }
        .ao-item.active { border-color: var(--green); background: #F0FDF4; }
        .ao-item.resolved { opacity: 0.6; }
        .ao-item-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; }
        .ao-item-author { font-size: 12px; font-weight: 600; color: var(--gray-700); }
        .ao-item-pos { font-size: 10px; color: var(--gray-400); font-family: monospace; }
        .ao-item-text { font-size: 13px; color: var(--gray-600); line-height: 1.5; }
        .ao-item-actions { display: flex; gap: 6px; margin-top: 8px; }
        .ao-item-actions button { font-size: 11px; padding: 4px 8px; border: 1px solid var(--gray-200); border-radius: 4px; background: var(--white); cursor: pointer; color: var(--gray-600); }
        .ao-item-actions button:hover { background: var(--gray-50); }
        .ao-item-actions button.resolve { color: var(--green); border-color: var(--green); }
        .ao-item-actions button.delete { color: #DC2626; border-color: #FCA5A5; }
        .ao-reply { margin-top: 8px; padding-top: 8px; border-top: 1px solid var(--gray-100); }
        .ao-reply-input { display: flex; gap: 6px; }
        .ao-reply-input input { flex: 1; padding: 6px 10px; border: 1px solid var(--gray-200); border-radius: 4px; font-size: 12px; outline: none; }
        .ao-reply-input button { padding: 6px 10px; background: var(--green); color: var(--white); border: none; border-radius: 4px; font-size: 11px; cursor: pointer; }
        .ao-form { position: absolute; z-index: 30; background: var(--white); border: 1px solid var(--gray-200); border-radius: 8px; padding: 16px; width: 260px; box-shadow: 0 4px 16px rgba(0,0,0,0.12); }
        .ao-form textarea { width: 100%; padding: 8px 10px; border: 1px solid var(--gray-200); border-radius: 6px; font-size: 13px; font-family: var(--font-body); min-height: 60px; resize: vertical; outline: none; margin-bottom: 10px; }
        .ao-form textarea:focus { border-color: var(--green); }
        .ao-form-btns { display: flex; gap: 6px; justify-content: flex-end; }
        .ao-form-btns button { padding: 6px 14px; border-radius: 6px; font-size: 12px; font-weight: 600; cursor: pointer; border: none; }
        .ao-form-btns .save { background: var(--green); color: var(--white); }
        .ao-form-btns .cancel { background: var(--gray-100); color: var(--gray-600); }
        .ao-count { font-size: 13px; color: var(--gray-500); margin-bottom: 12px; }
        .ao-empty { text-align: center; padding: 20px; color: var(--gray-400); font-size: 13px; }
      `}</style>

      <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>
        <div className="ao-container" style={{ flex: 1, maxWidth: '100%' }}>
          <img
            ref={imgRef}
            src={assetId.fileUrl || assetId}
            alt="Design"
            onClick={handleClick}
            style={{ width: '100%', cursor: 'crosshair', display: 'block', borderRadius: 8 }}
          />

          {annotations.map((a, i) => (
            <div
              key={a._id}
              className={`ao-pin ${activePin === a._id ? 'active' : ''} ${a.resolved ? 'resolved' : ''}`}
              style={{ left: `${a.x}%`, top: `${a.y}%` }}
              onClick={(e) => { e.stopPropagation(); setActivePin(activePin === a._id ? null : a._id); }}
            >
              <span className="ao-pin-num">{i + 1}</span>
            </div>
          ))}

          {showForm && (
            <div className="ao-form" style={{ left: `${Math.min(pendingPos.x, 70)}%`, top: `${Math.min(pendingPos.y, 70)}%` }} onClick={e => e.stopPropagation()}>
              <div style={{ fontSize: 11, color: 'var(--gray-400)', marginBottom: 6, fontFamily: 'monospace' }}>Pin at {pendingPos.x}%, {pendingPos.y}%</div>
              <textarea value={newText} onChange={e => setNewText(e.target.value)} placeholder="Add a comment..." autoFocus />
              <div className="ao-form-btns">
                <button className="cancel" onClick={() => { setShowForm(false); setNewText(''); }}>Cancel</button>
                <button className="save" onClick={handleAddAnnotation} disabled={saving || !newText.trim()}>{saving ? 'Adding...' : 'Add'}</button>
              </div>
            </div>
          )}
        </div>

        <div style={{ width: 310, flexShrink: 0 }}>
          <div className="ao-count">{annotations.length} annotation{annotations.length !== 1 ? 's' : ''}</div>
          {annotations.length === 0 ? (
            <div className="ao-empty">Click on the image to add annotations</div>
          ) : annotations.map((a, i) => (
            <div key={a._id} className={`ao-item ${activePin === a._id ? 'active' : ''} ${a.resolved ? 'resolved' : ''}`} onClick={() => setActivePin(a._id)}>
              <div className="ao-item-header">
                <span className="ao-item-author">#{i + 1} {a.author?.name}</span>
                <span className="ao-item-pos">{a.x}%, {a.y}%</span>
              </div>
              <div className="ao-item-text">{a.text}</div>
              <div className="ao-item-actions">
                <button className="resolve" onClick={(e) => { e.stopPropagation(); handleResolve(a._id); }}>{a.resolved ? 'Reopen' : 'Resolve'}</button>
                <button className="delete" onClick={(e) => { e.stopPropagation(); setDeleteModal({ open: true, id: a._id }); }}>Delete</button>
              </div>
              {a.replies?.length > 0 && a.replies.map((r, ri) => (
                <div key={ri} className="ao-reply" style={{ fontSize: 12 }}>
                  <strong>{r.author?.name}: </strong>{r.text}
                </div>
              ))}
              {replyTo === a._id ? (
                <div className="ao-reply">
                  <div className="ao-reply-input">
                    <input value={replyText} onChange={e => setReplyText(e.target.value)} placeholder="Reply..." onKeyDown={e => { if (e.key === 'Enter') handleReply(a._id); }} autoFocus />
                    <button onClick={() => handleReply(a._id)}>Send</button>
                  </div>
                </div>
              ) : (
                <button onClick={(e) => { e.stopPropagation(); setReplyTo(a._id); }} style={{ marginTop: 6, background: 'none', border: 'none', fontSize: 11, color: 'var(--green)', cursor: 'pointer', fontWeight: 600 }}>Reply</button>
              )}
            </div>
          ))}
        </div>
      </div>

      <ConfirmModal open={deleteModal.open} title="Delete Annotation" message="Are you sure you want to delete this annotation?" confirmText="Delete" danger onConfirm={handleDelete} onCancel={() => setDeleteModal({ open: false, id: null })} />
    </>
  );
};

export default AnnotationOverlay;
