import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

const ProfilePage = () => {
  const { setUser: setAuthUser, logout } = useAuth();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '', location: '', gender: '', bio: '' });
  const [showDelete, setShowDelete] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    api.get('/profile').then(res => {
      setUser(res.data.user);
      setForm({
        name: res.data.user.name || '',
        phone: res.data.user.phone || '',
        location: res.data.user.location || '',
        gender: res.data.user.gender || '',
        bio: res.data.user.bio || ''
      });
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const getCompletion = () => {
    if (!user) return 0;
    let filled = 0;
    let total = 5;
    if (user.name) filled++;
    if (user.email) filled++;
    if (user.phone) filled++;
    if (user.location) filled++;
    if (user.bio) filled++;
    if (user.role === 'specialist') { total++; if (user.kyc?.status === 'approved') filled++; }
    return Math.round((filled / total) * 100);
  };

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setSaved(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await api.put('/profile', form);
      setUser(res.data.user);
      setAuthUser(res.data.user);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {} finally { setSaving(false); }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await api.put('/profile/image', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      setUser(res.data.user);
      setAuthUser(res.data.user);
    } catch {} finally { setUploading(false); }
  };

  const handleDeleteAccount = async () => {
    if (!deletePassword) return;
    setDeleting(true);
    try {
      await api.delete('/auth/account', { data: { password: deletePassword } });
      logout();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to delete account');
    } finally { setDeleting(false); }
  };

  if (loading) return <div style={{ padding: '100px 32px', textAlign: 'center' }}>Loading...</div>;
  if (!user) return <div style={{ padding: '100px 32px', textAlign: 'center' }}>Failed to load profile</div>;

  const completion = getCompletion();

  return (
    <div style={{ maxWidth: 700, margin: '0 auto', padding: '100px 32px 60px' }}>
      <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 28, fontWeight: 700, marginBottom: 32 }}>My Profile</h1>

      <div style={{ background: 'var(--white)', border: '1px solid var(--gray-200)', borderRadius: 'var(--radius)', padding: 24, marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 24 }}>
          <div style={{ position: 'relative' }}>
            <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'var(--gray-100)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {user.profileImage ? (
                <img src={user.profileImage} alt={user.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <span style={{ fontSize: 28, fontWeight: 700, color: 'var(--gray-400)' }}>{user.name?.[0]?.toUpperCase()}</span>
              )}
            </div>
            <label style={{
              position: 'absolute', bottom: 0, right: 0, width: 28, height: 28,
              borderRadius: '50%', background: 'var(--green)', color: 'var(--white)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', fontSize: 14, border: '2px solid var(--white)'
            }}>
              <input type="file" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} />
              {uploading ? '...' : '+'}
            </label>
          </div>
          <div style={{ flex: 1 }}>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 18, fontWeight: 700, margin: 0 }}>{user.name}</h3>
            <p style={{ fontSize: 14, color: 'var(--gray-400)', margin: '4px 0 0' }}>{user.email}</p>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 6, flexWrap: 'wrap' }}>
              <span style={{
                fontSize: 12, fontWeight: 500, padding: '2px 10px',
                borderRadius: 100,                 background: user.role === 'specialist' ? '#EDF3E2' : '#EEF2FF',
                color: user.role === 'specialist' ? '#5a8a28' : '#4F46E5', textTransform: 'capitalize'
              }}>{user.role}</span>
              {user.isVerified && (
                <span style={{ fontSize: 12, fontWeight: 500, padding: '2px 10px', borderRadius: 100, background: '#ECFDF5', color: '#059669' }}>Verified</span>
              )}
              {!user.isVerified && (
                <span style={{ fontSize: 12, fontWeight: 500, padding: '2px 10px', borderRadius: 100, background: '#FEF3C7', color: '#D97706' }}>Unverified</span>
              )}
            </div>
          </div>
        </div>

        <div style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
            <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--gray-500)' }}>Profile Completion</span>
            <span style={{ fontSize: 13, fontWeight: 600, color: completion === 100 ? '#059669' : 'var(--gray-700)' }}>{completion}%</span>
          </div>
          <div style={{ height: 6, background: 'var(--gray-100)', borderRadius: 3, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${completion}%`, background: completion === 100 ? '#6f9c3e' : '#5a8a28', borderRadius: 3, transition: 'width 0.3s' }} />
          </div>
        </div>

        {user.role === 'specialist' && (
          <div style={{ marginBottom: 20, padding: 12, borderRadius: 'var(--radius)', background: user.kyc?.status === 'approved' ? '#ECFDF5' : user.kyc?.status === 'pending' ? '#FEF3C7' : '#FEF2F2', border: `1px solid ${user.kyc?.status === 'approved' ? '#A7F3D0' : user.kyc?.status === 'pending' ? '#FDE68A' : '#FECACA'}` }}>
            <p style={{ fontSize: 13, fontWeight: 500, margin: 0, color: user.kyc?.status === 'approved' ? '#059669' : user.kyc?.status === 'pending' ? '#D97706' : '#DC2626' }}>
              KYC Status: {user.kyc?.status === 'none' ? 'Not submitted' : user.kyc?.status?.charAt(0).toUpperCase() + user.kyc?.status?.slice(1)}
              {user.kyc?.status === 'rejected' && user.kyc?.rejectionReason && ` — ${user.kyc.rejectionReason}`}
            </p>
          </div>
        )}
      </div>

      <div style={{ background: 'var(--white)', border: '1px solid var(--gray-200)', borderRadius: 'var(--radius)', padding: 24, marginBottom: 20 }}>
        <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 16, fontWeight: 700, marginBottom: 20 }}>Personal Information</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: 'var(--gray-500)', marginBottom: 6 }}>Full Name</label>
            <input className="form-input" value={form.name} onChange={e => handleChange('name', e.target.value)} style={{ width: '100%' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: 'var(--gray-500)', marginBottom: 6 }}>Phone</label>
            <input className="form-input" value={form.phone} onChange={e => handleChange('phone', e.target.value)} placeholder="+234..." style={{ width: '100%' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: 'var(--gray-500)', marginBottom: 6 }}>Location</label>
            <input className="form-input" value={form.location} onChange={e => handleChange('location', e.target.value)} placeholder="e.g., Aba, Nigeria" style={{ width: '100%' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: 'var(--gray-500)', marginBottom: 6 }}>Gender</label>
            <select className="form-input" value={form.gender} onChange={e => handleChange('gender', e.target.value)} style={{ width: '100%' }}>
              <option value="">Select</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>
        <div style={{ marginTop: 16 }}>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: 'var(--gray-500)', marginBottom: 6 }}>Bio</label>
          <textarea className="form-input" value={form.bio} onChange={e => handleChange('bio', e.target.value)} rows={3} placeholder="Tell us about yourself..." style={{ width: '100%', resize: 'vertical' }} />
        </div>
        <div style={{ marginTop: 20, display: 'flex', gap: 12, alignItems: 'center' }}>
          <button onClick={handleSave} disabled={saving} className="btn btn-primary" style={{ padding: '8px 20px', fontSize: 13 }}>
            {saving ? 'Saving...' : saved ? 'Saved!' : 'Save Changes'}
          </button>
          {saved && <span style={{ fontSize: 13, color: 'var(--green)' }}>Profile updated</span>}
        </div>
        <p style={{ fontSize: 12, color: 'var(--gray-400)', marginTop: 12, margin: '12px 0 0' }}>
          Last updated: {user.updatedAt ? new Date(user.updatedAt).toLocaleDateString() : 'Never'}
        </p>
      </div>

      <div style={{ background: 'var(--white)', border: '1px solid #FECACA', borderRadius: 'var(--radius)', padding: 24 }}>
        <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 16, fontWeight: 700, marginBottom: 8, color: '#DC2626' }}>Danger Zone</h3>
        <p style={{ fontSize: 14, color: 'var(--gray-500)', marginBottom: 16 }}>
          Permanently delete your account and all associated data. This action cannot be undone.
        </p>
        {!showDelete ? (
          <button onClick={() => setShowDelete(true)} style={{ padding: '8px 20px', background: '#fff', color: '#DC2626', border: '1px solid #DC2626', borderRadius: '6px', fontSize: '13px', fontWeight: '500', cursor: 'pointer' }}>
            Delete Account
          </button>
        ) : (
          <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end' }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: 'var(--gray-500)', marginBottom: 6 }}>Confirm with password</label>
              <input
                type="password"
                value={deletePassword}
                onChange={e => setDeletePassword(e.target.value)}
                placeholder="Enter your password"
                className="form-input"
                style={{ width: '100%' }}
              />
            </div>
            <button
              onClick={handleDeleteAccount}
              disabled={!deletePassword || deleting}
              style={{
                padding: '8px 20px', background: deleting ? '#9ca3af' : '#DC2626', color: '#fff',
                border: 'none', borderRadius: '6px', fontSize: '13px', fontWeight: '500', cursor: deleting ? 'not-allowed' : 'pointer', whiteSpace: 'nowrap'
              }}
            >
              {deleting ? 'Deleting...' : 'Confirm Delete'}
            </button>
            <button
              onClick={() => { setShowDelete(false); setDeletePassword(''); }}
              style={{ padding: '8px 20px', background: '#fff', color: 'var(--gray-500)', border: '1px solid var(--gray-200)', borderRadius: '6px', fontSize: '13px', fontWeight: '500', cursor: 'pointer' }}
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
