import React, { useState, useEffect } from 'react';
import api from '../api/axios';

const ContractView = ({ projectId }) => {
  const [contract, setContract] = useState(null);
  const [loading, setLoading] = useState(true);
  const [signing, setSigning] = useState(false);

  useEffect(() => {
    if (!projectId) return;
    api.get(`/contracts/project/${projectId}`).then(res => setContract(res.data.contract)).catch(() => {}).finally(() => setLoading(false));
  }, [projectId]);

  const handleSign = async () => {
    setSigning(true);
    try {
      await api.post(`/contracts/${contract._id}/sign`);
      const res = await api.get(`/contracts/project/${projectId}`);
      setContract(res.data.contract);
    } catch {} finally { setSigning(false); }
  };

  if (loading) return <div style={{ padding: '20px', color: '#888', fontSize: 13 }}>Loading contract...</div>;
  if (!contract) return <div style={{ padding: '20px', color: '#888', fontSize: 13 }}>No contract for this project</div>;

  const signedByUser = contract.signedBy?.some(s => s.user === JSON.parse(localStorage.getItem('user') || '{}')._id);

  return (
    <div style={{ background: 'var(--white)', border: '1px solid var(--gray-200)', borderRadius: 'var(--radius)', padding: 24 }}>
      <h3 style={{ margin: '0 0 4px', fontSize: 16, fontWeight: 700 }}>Contract</h3>
      <p style={{ fontSize: 12, color: '#888', margin: '0 0 16px' }}>Status: <span style={{ fontWeight: 600, color: contract.status === 'signed' ? '#16A34A' : contract.status === 'terminated' ? '#DC2626' : '#D97706' }}>{contract.status}</span></p>

      <div style={{ fontSize: 13, lineHeight: 1.6, marginBottom: 16 }}>
        <div style={{ marginBottom: 12 }}><strong>Scope:</strong> {contract.scope}</div>
        <div style={{ marginBottom: 12 }}><strong>Amount:</strong> ₦{contract.amount?.toLocaleString()}</div>
        {contract.startDate && <div style={{ marginBottom: 12 }}><strong>Start:</strong> {new Date(contract.startDate).toLocaleDateString()}</div>}
        {contract.endDate && <div style={{ marginBottom: 12 }}><strong>End:</strong> {new Date(contract.endDate).toLocaleDateString()}</div>}
        {contract.terms && <div style={{ marginBottom: 12 }}><strong>Terms:</strong> {contract.terms}</div>}
      </div>

      <div style={{ borderTop: '1px solid var(--gray-100)', paddingTop: 12 }}>
        <p style={{ fontSize: 12, color: '#888', marginBottom: 8 }}>Signatures: {contract.signedBy?.length || 0}/2</p>
        {(contract.signedBy || []).map((s, i) => (
          <div key={i} style={{ fontSize: 12, color: '#555', marginBottom: 4 }}>✓ {s.signedAt ? `Signed on ${new Date(s.signedAt).toLocaleDateString()}` : 'Pending'}</div>
        ))}
      </div>

      {!signedByUser && contract.status !== 'terminated' && (
        <button onClick={handleSign} disabled={signing} style={{ marginTop: 12, padding: '8px 16px', background: '#16A34A', color: 'white', border: 'none', borderRadius: 6, fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>{signing ? 'Signing...' : 'Sign Contract'}</button>
      )}
    </div>
  );
};

export default ContractView;
