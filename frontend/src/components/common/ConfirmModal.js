import React from 'react';

const ConfirmModal = ({ open, title, message, confirmText = 'Confirm', cancelText = 'Cancel', onConfirm, onCancel, danger = false }) => {
  if (!open) return null;

  return (
    <div onClick={onCancel} style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 200,
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: 'var(--white)', borderRadius: 'var(--radius)', padding: 28,
        maxWidth: 420, width: '100%', boxShadow: '0 20px 60px rgba(0,0,0,0.2)'
      }}>
        <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 18, fontWeight: 700, marginBottom: 8 }}>{title}</h3>
        <p style={{ fontSize: 14, color: 'var(--gray-500)', marginBottom: 24, lineHeight: 1.6 }}>{message}</p>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button onClick={onCancel} style={{
            padding: '8px 18px', borderRadius: 6, fontSize: 14, fontWeight: 500,
            border: '1px solid var(--gray-300)', background: 'var(--white)',
            color: 'var(--gray-600)', cursor: 'pointer', fontFamily: 'var(--font-body)'
          }}>{cancelText}</button>
          <button onClick={onConfirm} style={{
            padding: '8px 18px', borderRadius: 6, fontSize: 14, fontWeight: 500,
            border: 'none', background: danger ? '#DC2626' : 'var(--green)',
            color: 'var(--white)', cursor: 'pointer', fontFamily: 'var(--font-body)'
          }}>{confirmText}</button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
