import React, { useState, useEffect } from 'react';
import api from '../../api/axios';

const Section = ({ title, children }) => (
  <div style={{ background: 'var(--white)', border: '1px solid var(--gray-200)', borderRadius: 'var(--radius)', padding: 24, marginBottom: 20 }}>
    <h4 style={{ fontFamily: 'var(--font-heading)', fontSize: 16, fontWeight: 700, marginBottom: 20, paddingBottom: 12, borderBottom: '1px solid var(--gray-100)' }}>{title}</h4>
    {children}
  </div>
);

const Field = ({ label, children }) => (
  <div style={{ marginBottom: 16 }}>
    <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: 'var(--gray-600)', marginBottom: 6 }}>{label}</label>
    {children}
  </div>
);

const Toggle = ({ checked, onChange, label }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
    <button onClick={() => onChange(!checked)} style={{
      width: 44, height: 24, borderRadius: 12, border: 'none', cursor: 'pointer',
      background: checked ? 'var(--green)' : 'var(--gray-300)',
      position: 'relative', transition: 'background 0.2s', flexShrink: 0
    }}>
      <span style={{
        position: 'absolute', top: 2, left: checked ? 22 : 2,
        width: 20, height: 20, borderRadius: '50%', background: 'var(--white)',
        transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.15)'
      }} />
    </button>
    <span style={{ fontSize: 14, color: 'var(--gray-600)' }}>{label}</span>
  </div>
);

const AdminSettings = () => {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [tab, setTab] = useState('platform');
  const [pw, setPw] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [pwSaving, setPwSaving] = useState(false);
  const [pwMsg, setPwMsg] = useState('');

  useEffect(() => {
    api.get('/admin/settings')
      .then(res => setSettings(res.data.settings))
      .catch(() => {}).finally(() => setLoading(false));
  }, []);

  const handleChange = (field, value) => {
    setSettings(prev => ({ ...prev, [field]: value }));
    setSaved(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await api.put('/admin/settings', settings);
      setSettings(res.data.settings);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {} finally { setSaving(false); }
  };

  if (loading) return <div className="skeleton" style={{ height: 400 }} />;
  if (!settings) return <p style={{ color: 'var(--gray-400)' }}>Failed to load settings</p>;

  const tabs = ['platform', 'contact', 'seo', 'email', 'advanced', 'security'];

  const handlePasswordChange = async () => {
    setPwMsg('');
    if (!pw.currentPassword || !pw.newPassword) {
      setPwMsg('All fields are required');
      return;
    }
    if (pw.newPassword !== pw.confirmPassword) {
      setPwMsg('New passwords do not match');
      return;
    }
    if (pw.newPassword.length < 6) {
      setPwMsg('Password must be at least 6 characters');
      return;
    }
    setPwSaving(true);
    try {
      await api.put('/auth/change-password', { currentPassword: pw.currentPassword, newPassword: pw.newPassword });
      setPwMsg('Password updated successfully');
      setPw({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setPwMsg(err.response?.data?.error || 'Failed to update password');
    } finally { setPwSaving(false); }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 20, fontWeight: 700 }}>Settings</h3>
        <button onClick={handleSave} disabled={saving} className="btn btn-primary" style={{ padding: '8px 20px', fontSize: 13 }}>
          {saving ? 'Saving...' : saved ? 'Saved!' : 'Save Changes'}
        </button>
      </div>

      <div style={{ display: 'flex', gap: 4, marginBottom: 24, background: 'var(--white)', border: '1px solid var(--gray-200)', borderRadius: 'var(--radius)', padding: 4, flexWrap: 'wrap' }}>
        {tabs.map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            padding: '8px 16px', borderRadius: 4, border: 'none', fontSize: 13, fontWeight: 500, cursor: 'pointer',
            background: tab === t ? 'var(--green-light)' : 'transparent',
            color: tab === t ? 'var(--green)' : 'var(--gray-500)',
            fontFamily: 'var(--font-body)', textTransform: 'capitalize'
          }}>{t}</button>
        ))}
      </div>

      {tab === 'platform' && (
        <Section title="Platform Information">
          <Field label="Platform Name">
            <input className="form-input" value={settings.platformName || ''} onChange={e => handleChange('platformName', e.target.value)} style={{ width: '100%' }} />
          </Field>
          <Field label="Platform Description">
            <textarea className="form-input" value={settings.platformDescription || ''} onChange={e => handleChange('platformDescription', e.target.value)} rows={3} style={{ width: '100%', resize: 'vertical' }} />
          </Field>
          <Field label="Footer Text">
            <input className="form-input" value={settings.footerText || ''} onChange={e => handleChange('footerText', e.target.value)} style={{ width: '100%' }} />
          </Field>
        </Section>
      )}

      {tab === 'contact' && (
        <Section title="Contact Information">
          <Field label="Contact Email">
            <input type="email" className="form-input" value={settings.contactEmail || ''} onChange={e => handleChange('contactEmail', e.target.value)} style={{ width: '100%' }} />
          </Field>
          <Field label="Contact Phone">
            <input className="form-input" value={settings.contactPhone || ''} onChange={e => handleChange('contactPhone', e.target.value)} style={{ width: '100%' }} />
          </Field>
          <Field label="Address">
            <textarea className="form-input" value={settings.contactAddress || ''} onChange={e => handleChange('contactAddress', e.target.value)} rows={2} style={{ width: '100%', resize: 'vertical' }} />
          </Field>
        </Section>
      )}

      {tab === 'seo' && (
        <>
          <Section title="SEO & Meta Tags">
            <Field label="Meta Title">
              <input className="form-input" value={settings.metaTitle || ''} onChange={e => handleChange('metaTitle', e.target.value)} style={{ width: '100%' }} />
              <p style={{ fontSize: 11, color: 'var(--gray-400)', marginTop: 4 }}>{(settings.metaTitle || '').length}/60 characters</p>
            </Field>
            <Field label="Meta Description">
              <textarea className="form-input" value={settings.metaDescription || ''} onChange={e => handleChange('metaDescription', e.target.value)} rows={3} style={{ width: '100%', resize: 'vertical' }} />
              <p style={{ fontSize: 11, color: 'var(--gray-400)', marginTop: 4 }}>{(settings.metaDescription || '').length}/160 characters</p>
            </Field>
            <Field label="Meta Keywords (comma separated)">
              <input className="form-input" value={settings.metaKeywords || ''} onChange={e => handleChange('metaKeywords', e.target.value)} style={{ width: '100%' }} />
            </Field>
            <Field label="OG Image URL">
              <input className="form-input" value={settings.ogImage || ''} onChange={e => handleChange('ogImage', e.target.value)} placeholder="https://..." style={{ width: '100%' }} />
            </Field>
          </Section>
          <Section title="Sitemap">
            <Toggle checked={settings.sitemapEnabled} onChange={v => handleChange('sitemapEnabled', v)} label="Enable auto-generated sitemap.xml" />
          </Section>
        </>
      )}

      {tab === 'email' && (
        <Section title="Email Configuration (Gmail SMTP)">
          <Toggle checked={settings.smtpEnabled} onChange={v => handleChange('smtpEnabled', v)} label="Enable email notifications" />
          {settings.smtpEnabled && (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <Field label="SMTP Host">
                  <input className="form-input" value={settings.smtpHost || ''} onChange={e => handleChange('smtpHost', e.target.value)} style={{ width: '100%' }} />
                </Field>
                <Field label="SMTP Port">
                  <input type="number" className="form-input" value={settings.smtpPort || ''} onChange={e => handleChange('smtpPort', parseInt(e.target.value) || 587)} style={{ width: '100%' }} />
                </Field>
              </div>
              <Field label="Gmail Address">
                <input type="email" className="form-input" value={settings.smtpUser || ''} onChange={e => handleChange('smtpUser', e.target.value)} placeholder="your@gmail.com" style={{ width: '100%' }} />
              </Field>
              <Field label="App Password (not your Gmail password)">
                <input type="password" className="form-input" value={settings.smtpPass || ''} onChange={e => handleChange('smtpPass', e.target.value)} placeholder="xxxx xxxx xxxx xxxx" style={{ width: '100%' }} />
                <p style={{ fontSize: 11, color: 'var(--gray-400)', marginTop: 4 }}>Generate an App Password at myaccount.google.com → Security → 2FA → App Passwords</p>
              </Field>
              <Field label="From Name">
                <input className="form-input" value={settings.smtpFrom || ''} onChange={e => handleChange('smtpFrom', e.target.value)} placeholder="Branda" style={{ width: '100%' }} />
              </Field>
            </>
          )}
        </Section>
      )}

      {tab === 'advanced' && (
        <Section title="Advanced">
          <Toggle checked={settings.maintenanceMode} onChange={v => handleChange('maintenanceMode', v)} label="Maintenance Mode (blocks public access)" />
          {settings.maintenanceMode && (
            <div style={{ background: '#FEF3C7', border: '1px solid #FDE68A', borderRadius: 'var(--radius)', padding: 12, marginTop: 8 }}>
              <p style={{ fontSize: 13, color: '#92400E', margin: 0 }}>Maintenance mode is active. Only admins can access the platform.</p>
            </div>
          )}
        </Section>
      )}

      {tab === 'security' && (
        <Section title="Change Password">
          <Field label="Current Password">
            <input type="password" className="form-input" value={pw.currentPassword} onChange={e => setPw(p => ({ ...p, currentPassword: e.target.value }))} style={{ width: '100%' }} />
          </Field>
          <Field label="New Password">
            <input type="password" className="form-input" value={pw.newPassword} onChange={e => setPw(p => ({ ...p, newPassword: e.target.value }))} style={{ width: '100%' }} />
          </Field>
          <Field label="Confirm New Password">
            <input type="password" className="form-input" value={pw.confirmPassword} onChange={e => setPw(p => ({ ...p, confirmPassword: e.target.value }))} style={{ width: '100%' }} />
          </Field>
          {pwMsg && (
            <p style={{ fontSize: 13, color: pwMsg.includes('success') ? '#059669' : '#DC2626', marginBottom: 12 }}>{pwMsg}</p>
          )}
          <button onClick={handlePasswordChange} disabled={pwSaving} className="btn btn-primary" style={{ padding: '8px 20px', fontSize: 13 }}>
            {pwSaving ? 'Updating...' : 'Update Password'}
          </button>
        </Section>
      )}
    </div>
  );
};

export default AdminSettings;
