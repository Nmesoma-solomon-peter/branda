import React, { useState } from 'react';
import api from '../../api/axios';

const industries = ['Fashion', 'Food', 'Technology', 'Retail', 'Manufacturing', 'Creative', 'Other'];

const CreateProject = ({ onCreated }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [industry, setIndustry] = useState('');
  const [colorPreferences, setColorPreferences] = useState('');
  const [budget, setBudget] = useState('');
  const [deadline, setDeadline] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const payload = { title, description, industry, colorPreferences };
      if (budget) payload.budget = Number(budget);
      if (deadline) payload.deadline = deadline;
      await api.post('/projects', payload);
      if (onCreated) onCreated();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create project');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && <div style={{ color: '#DC2626', fontSize: 14, marginBottom: 16 }}>{error}</div>}
      <div style={{ marginBottom: 16 }}>
        <label style={{ display: 'block', fontSize: 14, fontWeight: 500, marginBottom: 6 }}>Project Title</label>
        <input
          type="text"
          className="form-input"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g., Logo for my fashion brand"
          required
          disabled={loading}
          style={{ width: '100%' }}
        />
      </div>
      <div style={{ marginBottom: 16 }}>
        <label style={{ display: 'block', fontSize: 14, fontWeight: 500, marginBottom: 6 }}>Description</label>
        <textarea
          className="form-input"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe what you need..."
          required
          disabled={loading}
          rows={4}
          style={{ width: '100%', resize: 'vertical' }}
        />
      </div>
      <div style={{ marginBottom: 16 }}>
        <label style={{ display: 'block', fontSize: 14, fontWeight: 500, marginBottom: 6 }}>Industry</label>
        <select
          className="form-input"
          value={industry}
          onChange={(e) => setIndustry(e.target.value)}
          required
          disabled={loading}
          style={{ width: '100%' }}
        >
          <option value="">Select industry</option>
          {industries.map(i => <option key={i} value={i}>{i}</option>)}
        </select>
      </div>
      <div style={{ marginBottom: 16 }}>
        <label style={{ display: 'block', fontSize: 14, fontWeight: 500, marginBottom: 6 }}>Color Preferences</label>
        <input
          type="text"
          className="form-input"
          value={colorPreferences}
          onChange={(e) => setColorPreferences(e.target.value)}
          placeholder="e.g., Green and gold"
          disabled={loading}
          style={{ width: '100%' }}
        />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
        <div>
          <label style={{ display: 'block', fontSize: 14, fontWeight: 500, marginBottom: 6 }}>Budget (NGN)</label>
          <input
            type="number"
            className="form-input"
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
            placeholder="e.g., 50000"
            min="0"
            disabled={loading}
            style={{ width: '100%' }}
          />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: 14, fontWeight: 500, marginBottom: 6 }}>Deadline</label>
          <input
            type="date"
            className="form-input"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            disabled={loading}
            style={{ width: '100%' }}
          />
        </div>
      </div>
      <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%' }}>
        {loading ? 'Creating...' : 'Create Project'}
      </button>
    </form>
  );
};

export default CreateProject;
