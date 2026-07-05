import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

const SpecialistAvailability = () => {
  const { user } = useAuth();
  const [form, setForm] = useState({ availability: 'available', hourlyRate: '', yearsExperience: '', skills: '', industries: '' });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    if (user) {
      setForm({
        availability: user.availability || 'available',
        hourlyRate: String(user.hourlyRate || ''),
        yearsExperience: String(user.yearsExperience || ''),
        skills: (user.skills || []).join(', '),
        industries: (user.industries || []).join(', ')
      });
    }
  }, [user]);

  const handleSave = async () => {
    setSaving(true); setMsg('');
    try {
      const payload = {
        availability: form.availability,
        hourlyRate: Number(form.hourlyRate) || 0,
        yearsExperience: Number(form.yearsExperience) || 0,
        skills: form.skills.split(',').map(s => s.trim()).filter(Boolean),
        industries: form.industries.split(',').map(s => s.trim()).filter(Boolean)
      };
      await api.put('/profile', payload);
      setMsg('Profile updated successfully');
    } catch { setMsg('Failed to update profile'); }
    setSaving(false);
  };

  return (
    <>
      <style>{`
        .avail-page { max-width: 600px; margin: 100px auto 60px; padding: 0 32px; }
        .avail-card { background: var(--white); border: 1px solid var(--gray-200); border-radius: var(--radius); padding: 32px; }
        .avail-field { margin-bottom: 20px; }
        .avail-field label { display: block; font-size: 13px; font-weight: 600; color: var(--gray-700); margin-bottom: 6px; }
        .avail-field input, .avail-field select, .avail-field textarea { width: 100%; padding: 10px 12px; border: 1px solid var(--gray-200); border-radius: 6px; font-size: 14px; outline: none; font-family: inherit; }
        .avail-field input:focus, .avail-field select:focus, .avail-field textarea:focus { border-color: var(--green); }
        .avail-field textarea { resize: vertical; min-height: 60px; }
        .avail-field small { display: block; margin-top: 4px; font-size: 11px; color: var(--gray-400); }
        .avail-btn { padding: 10px 24px; background: var(--green); color: var(--white); border: none; border-radius: 8px; font-weight: 600; font-size: 14px; cursor: pointer; }
        .avail-btn:disabled { background: var(--gray-300); cursor: not-allowed; }
        .avail-msg { padding: 10px 14px; border-radius: 6px; font-size: 13px; margin-bottom: 16px; }
        .avail-msg.ok { background: #DCFCE7; color: #166534; }
        .avail-msg.err { background: #FEE2E2; color: #991B1B; }
        .avail-status { display: flex; gap: 10px; margin-top: 8px; }
        .avail-status label { display: flex; align-items: center; gap: 6px; padding: 8px 14px; border: 1px solid var(--gray-200); border-radius: 6px; font-size: 13px; font-weight: 500; cursor: pointer; transition: all 0.15s; }
        .avail-status input[type="radio"] { display: none; }
        .avail-status input[type="radio"]:checked + span { color: var(--green); font-weight: 700; }
        .avail-status label:has(input:checked) { border-color: var(--green); background: var(--green-light); }
      `}</style>

      <div className="avail-page">
        <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 28, fontWeight: 700, marginBottom: 24 }}>Availability & Profile</h1>

        {msg && <div className={`avail-msg ${msg.includes('success') ? 'ok' : 'err'}`}>{msg}</div>}

        <div className="avail-card">
          <div className="avail-field">
            <label>Availability Status</label>
            <div className="avail-status">
              {['available', 'busy', 'unavailable'].map(s => (
                <label key={s}>
                  <input type="radio" name="avail" value={s} checked={form.availability === s} onChange={() => setForm({ ...form, availability: s })} />
                  <span>{s.charAt(0).toUpperCase() + s.slice(1)}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="avail-field">
            <label>Hourly Rate (NGN)</label>
            <input type="number" value={form.hourlyRate} onChange={e => setForm({ ...form, hourlyRate: e.target.value })} placeholder="e.g. 5000" min="0" />
            <small>Set to 0 for project-based pricing</small>
          </div>

          <div className="avail-field">
            <label>Years of Experience</label>
            <input type="number" value={form.yearsExperience} onChange={e => setForm({ ...form, yearsExperience: e.target.value })} placeholder="e.g. 5" min="0" max="50" />
          </div>

          <div className="avail-field">
            <label>Skills</label>
            <textarea value={form.skills} onChange={e => setForm({ ...form, skills: e.target.value })} placeholder="Logo Design, Branding, UI/UX (comma separated)" rows={3} />
            <small>Separate skills with commas</small>
          </div>

          <div className="avail-field">
            <label>Industries</label>
            <textarea value={form.industries} onChange={e => setForm({ ...form, industries: e.target.value })} placeholder="Fashion, Food, Technology (comma separated)" rows={3} />
            <small>Separate industries with commas</small>
          </div>

          <button className="avail-btn" onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : 'Save Changes'}</button>
        </div>
      </div>
    </>
  );
};

export default SpecialistAvailability;
