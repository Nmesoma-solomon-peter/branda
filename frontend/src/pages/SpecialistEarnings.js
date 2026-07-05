import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

const SpecialistEarnings = () => {
  useAuth();
  const [data, setData] = useState({ withdrawals: [], earnings: { total: 0, withdrawn: 0, available: 0 } });
  const [loading, setLoading] = useState(true);
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [form, setForm] = useState({ amount: '', bankName: '', accountNumber: '', accountName: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api.get('/withdrawals/me').then(res => setData(res.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const handleWithdraw = async () => {
    if (!form.amount || !form.bankName || !form.accountNumber || !form.accountName) return;
    if (Number(form.amount) > data.earnings.available) return;
    setSubmitting(true);
    try {
      await api.post('/withdrawals', { ...form, amount: Number(form.amount) });
      setShowWithdraw(false);
      setForm({ amount: '', bankName: '', accountNumber: '', accountName: '' });
      const res = await api.get('/withdrawals/me');
      setData(res.data);
    } catch {} finally { setSubmitting(false); }
  };

  if (loading) return <div style={{ padding: '100px 32px', textAlign: 'center', color: 'var(--gray-400)' }}>Loading...</div>;

  return (
    <>
      <style>{`
        .earn-container { max-width: 900px; margin: 100px auto 60px; padding: 0 32px; }
        .earn-stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 32px; }
        .earn-stat { background: var(--white); border: 1px solid var(--gray-200); border-radius: var(--radius); padding: 24px; text-align: center; }
        .earn-stat-val { font-size: 28px; font-weight: 700; color: var(--gray-800); }
        .earn-stat-label { font-size: 13px; color: var(--gray-400); margin-top: 4px; }
        .earn-stat.green .earn-stat-val { color: var(--green); }
        .earn-table { width: 100%; border-collapse: collapse; background: var(--white); border: 1px solid var(--gray-200); border-radius: var(--radius); overflow: hidden; }
        .earn-table th { padding: 12px 16px; text-align: left; font-size: 12px; font-weight: 600; color: var(--gray-500); text-transform: uppercase; background: var(--gray-50); border-bottom: 1px solid var(--gray-200); }
        .earn-table td { padding: 12px 16px; font-size: 14px; border-bottom: 1px solid var(--gray-100); }
        .earn-badge { padding: 4px 10px; border-radius: 12px; font-size: 11px; font-weight: 600; }
        .earn-badge.pending { background: #FEF3C7; color: #92400E; }
        .earn-badge.processing { background: #DBEAFE; color: #1E40AF; }
        .earn-badge.completed { background: #DCFCE7; color: #166534; }
        .earn-badge.rejected { background: #FEE2E2; color: #991B1B; }
        .earn-btn { padding: 10px 20px; background: var(--green); color: var(--white); border: none; border-radius: 8px; font-weight: 600; font-size: 14px; cursor: pointer; }
        .earn-btn:disabled { background: var(--gray-300); cursor: not-allowed; }
        .earn-modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 2000; padding: 20px; }
        .earn-modal { background: var(--white); border-radius: var(--radius); width: 100%; max-width: 440px; padding: 24px; }
        .earn-modal h3 { margin: 0 0 16px; font-size: 18px; font-weight: 700; }
        .earn-field { margin-bottom: 14px; }
        .earn-field label { display: block; font-size: 13px; font-weight: 600; color: var(--gray-700); margin-bottom: 6px; }
        .earn-field input { width: 100%; padding: 10px 12px; border: 1px solid var(--gray-200); border-radius: 6px; font-size: 14px; outline: none; }
        .earn-field input:focus { border-color: var(--green); }
        .earn-modal-btns { display: flex; gap: 8px; justify-content: flex-end; margin-top: 16px; }
        .earn-modal-btns button { padding: 10px 18px; border-radius: 6px; font-size: 13px; font-weight: 600; cursor: pointer; border: none; }
        .earn-modal-btns .save { background: var(--green); color: var(--white); }
        .earn-modal-btns .cancel { background: var(--gray-100); color: var(--gray-600); }
        .earn-empty { text-align: center; padding: 40px; color: var(--gray-400); font-size: 14px; }
      `}</style>

      <div className="earn-container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 28, fontWeight: 700, margin: 0 }}>Earnings</h1>
          <button className="earn-btn" onClick={() => setShowWithdraw(true)} disabled={data.earnings.available <= 0}>Withdraw Funds</button>
        </div>

        <div className="earn-stats">
          <div className="earn-stat green">
            <div className="earn-stat-val">₦{(data.earnings.total || 0).toLocaleString()}</div>
            <div className="earn-stat-label">Total Earned</div>
          </div>
          <div className="earn-stat">
            <div className="earn-stat-val">₦{(data.earnings.withdrawn || 0).toLocaleString()}</div>
            <div className="earn-stat-label">Withdrawn</div>
          </div>
          <div className="earn-stat green">
            <div className="earn-stat-val">₦{(data.earnings.available || 0).toLocaleString()}</div>
            <div className="earn-stat-label">Available</div>
          </div>
        </div>

        <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>Withdrawal History</h2>
        {data.withdrawals.length === 0 ? (
          <div className="earn-empty">No withdrawals yet</div>
        ) : (
          <table className="earn-table">
            <thead><tr><th>Amount</th><th>Bank</th><th>Account</th><th>Status</th><th>Date</th></tr></thead>
            <tbody>
              {data.withdrawals.map(w => (
                <tr key={w._id}>
                  <td style={{ fontWeight: 600 }}>₦{w.amount.toLocaleString()}</td>
                  <td>{w.bankName}</td>
                  <td>{w.accountNumber}</td>
                  <td><span className={`earn-badge ${w.status}`}>{w.status}</span></td>
                  <td>{new Date(w.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showWithdraw && (
        <div className="earn-modal-overlay" onClick={() => setShowWithdraw(false)}>
          <div className="earn-modal" onClick={e => e.stopPropagation()}>
            <h3>Withdraw Funds</h3>
            <p style={{ fontSize: 13, color: 'var(--gray-500)', marginBottom: 16 }}>Available: ₦{(data.earnings.available || 0).toLocaleString()}</p>
            <div className="earn-field">
              <label>Amount (NGN)</label>
              <input type="number" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} placeholder="0.00" max={data.earnings.available} />
            </div>
            <div className="earn-field">
              <label>Bank Name</label>
              <input value={form.bankName} onChange={e => setForm({ ...form, bankName: e.target.value })} placeholder="e.g. GTBank" />
            </div>
            <div className="earn-field">
              <label>Account Number</label>
              <input value={form.accountNumber} onChange={e => setForm({ ...form, accountNumber: e.target.value })} placeholder="0123456789" maxLength={10} />
            </div>
            <div className="earn-field">
              <label>Account Name</label>
              <input value={form.accountName} onChange={e => setForm({ ...form, accountName: e.target.value })} placeholder="John Doe" />
            </div>
            <div className="earn-modal-btns">
              <button className="cancel" onClick={() => setShowWithdraw(false)}>Cancel</button>
              <button className="save" onClick={handleWithdraw} disabled={submitting || !form.amount || !form.bankName || !form.accountNumber || !form.accountName}>{submitting ? 'Processing...' : 'Submit'}</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SpecialistEarnings;
