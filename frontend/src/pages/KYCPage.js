import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

const KYCPage = () => {
  useAuth();
  const [kyc, setKyc] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ fullName: '', dateOfBirth: '', idType: '', idNumber: '' });
  const [files, setFiles] = useState({ idImageFront: null, idImageBack: null, selfieWithId: null });
  const [previews, setPreviews] = useState({});
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    api.get('/kyc').then(res => {
      setKyc(res.data.kyc);
      if (res.data.kyc.fullName) setForm({
        fullName: res.data.kyc.fullName || '',
        dateOfBirth: res.data.kyc.dateOfBirth || '',
        idType: res.data.kyc.idType || '',
        idNumber: res.data.kyc.idNumber || ''
      });
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const handleFile = (field, e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFiles(prev => ({ ...prev, [field]: file }));
    setPreviews(prev => ({ ...prev, [field]: URL.createObjectURL(file) }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.fullName || !form.dateOfBirth || !form.idType || !form.idNumber) {
      setError('All fields are required');
      return;
    }
    if (!files.idImageFront || !files.idImageBack || !files.selfieWithId) {
      setError('All three images are required');
      return;
    }
    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append('fullName', form.fullName);
      fd.append('dateOfBirth', form.dateOfBirth);
      fd.append('idType', form.idType);
      fd.append('idNumber', form.idNumber);
      fd.append('idImageFront', files.idImageFront);
      fd.append('idImageBack', files.idImageBack);
      fd.append('selfieWithId', files.selfieWithId);
      const res = await api.post('/kyc', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      setKyc(res.data.kyc);
      setSuccess('KYC submitted successfully! Under review.');
    } catch (err) {
      setError(err.response?.data?.error || 'Submission failed');
    } finally { setSubmitting(false); }
  };

  if (loading) return <div style={{ padding: '100px 32px', textAlign: 'center' }}>Loading...</div>;

  const isApproved = kyc?.status === 'approved';
  const isPending = kyc?.status === 'pending';
  const isRejected = kyc?.status === 'rejected';
  const canSubmit = !isApproved && !isPending;

  return (
    <div style={{ maxWidth: 700, margin: '0 auto', padding: '100px 32px 60px' }}>
      <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 28, fontWeight: 700, marginBottom: 8 }}>KYC Verification</h1>
      <p style={{ color: 'var(--gray-500)', fontSize: 15, marginBottom: 32 }}>Complete identity verification to start receiving projects.</p>

      {isApproved && (
        <div style={{ background: '#ECFDF5', border: '1px solid #A7F3D0', borderRadius: 'var(--radius)', padding: 20, marginBottom: 24 }}>
          <p style={{ color: '#059669', fontWeight: 500, margin: 0 }}>Your identity has been verified. You can now receive project assignments.</p>
        </div>
      )}

      {isPending && (
        <div style={{ background: '#FEF3C7', border: '1px solid #FDE68A', borderRadius: 'var(--radius)', padding: 20, marginBottom: 24 }}>
          <p style={{ color: '#D97706', fontWeight: 500, margin: 0 }}>KYC under review. We will notify you once verified.</p>
        </div>
      )}

      {isRejected && (
        <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 'var(--radius)', padding: 20, marginBottom: 24 }}>
          <p style={{ color: '#DC2626', fontWeight: 500, margin: 0 }}>KYC rejected: {kyc.rejectionReason || 'Please resubmit'}</p>
        </div>
      )}

      {canSubmit && (
        <form onSubmit={handleSubmit}>
          {error && (
            <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 'var(--radius)', padding: 12, marginBottom: 16 }}>
              <p style={{ color: '#DC2626', fontSize: 14, margin: 0 }}>{error}</p>
            </div>
          )}
          {success && (
            <div style={{ background: '#ECFDF5', border: '1px solid #A7F3D0', borderRadius: 'var(--radius)', padding: 12, marginBottom: 16 }}>
              <p style={{ color: '#059669', fontSize: 14, margin: 0 }}>{success}</p>
            </div>
          )}

          <div style={{ background: 'var(--white)', border: '1px solid var(--gray-200)', borderRadius: 'var(--radius)', padding: 24, marginBottom: 20 }}>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 16, fontWeight: 700, marginBottom: 20 }}>Personal Details</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: 'var(--gray-500)', marginBottom: 6 }}>Full Legal Name</label>
                <input className="form-input" value={form.fullName} onChange={e => setForm(p => ({ ...p, fullName: e.target.value }))} style={{ width: '100%' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: 'var(--gray-500)', marginBottom: 6 }}>Date of Birth</label>
                <input type="date" className="form-input" value={form.dateOfBirth} onChange={e => setForm(p => ({ ...p, dateOfBirth: e.target.value }))} style={{ width: '100%' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: 'var(--gray-500)', marginBottom: 6 }}>ID Type</label>
                <select className="form-input" value={form.idType} onChange={e => setForm(p => ({ ...p, idType: e.target.value }))} style={{ width: '100%' }}>
                  <option value="">Select ID type</option>
                  <option value="nin">National ID (NIN)</option>
                  <option value="passport">Passport</option>
                  <option value="drivers_license">Driver's License</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: 'var(--gray-500)', marginBottom: 6 }}>ID Number</label>
                <input className="form-input" value={form.idNumber} onChange={e => setForm(p => ({ ...p, idNumber: e.target.value }))} style={{ width: '100%' }} />
              </div>
            </div>
          </div>

          <div style={{ background: 'var(--white)', border: '1px solid var(--gray-200)', borderRadius: 'var(--radius)', padding: 24, marginBottom: 20 }}>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 16, fontWeight: 700, marginBottom: 20 }}>Upload Documents</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
              {[
                { key: 'idImageFront', label: 'ID Front' },
                { key: 'idImageBack', label: 'ID Back' },
                { key: 'selfieWithId', label: 'Selfie with ID' }
              ].map(({ key, label }) => (
                <div key={key}>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: 'var(--gray-500)', marginBottom: 6 }}>{label}</label>
                  <label style={{
                    display: 'flex', padding: 20, border: '2px dashed var(--gray-300)',
                    borderRadius: 'var(--radius)', textAlign: 'center', cursor: 'pointer',
                    fontSize: 12, color: 'var(--gray-400)', minHeight: 100,
                    alignItems: 'center', justifyContent: 'center', flexDirection: 'column'
                  }}>
                    <input type="file" accept="image/*" onChange={e => handleFile(key, e)} style={{ display: 'none' }} />
                    {previews[key] ? (
                      <img src={previews[key]} alt={label} style={{ width: '100%', maxHeight: 80, objectFit: 'cover', borderRadius: 4 }} />
                    ) : (
                      <span>Click to upload</span>
                    )}
                  </label>
                </div>
              ))}
            </div>
          </div>

          <button type="submit" disabled={submitting} className="btn btn-primary" style={{ width: '100%' }}>
            {submitting ? 'Submitting...' : 'Submit KYC'}
          </button>
        </form>
      )}
    </div>
  );
};

export default KYCPage;
