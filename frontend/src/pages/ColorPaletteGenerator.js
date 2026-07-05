import React, { useState } from 'react';

const PALETTES = {
  Fashion: [
    ['#000000', '#C9A96E', '#F5F0E8', '#8B7355', '#2C2C2C'],
    ['#1A1A2E', '#E94560', '#F5F5F5', '#0F3460', '#16213E'],
    ['#2D2D2D', '#D4A574', '#F8E8D4', '#A0522D', '#1A1A1A'],
  ],
  Food: [
    ['#E63946', '#F1FAEE', '#A8DADC', '#457B9D', '#1D3557'],
    ['#2B2D42', '#8D99AE', '#EDF2F4', '#EF233C', '#D90429'],
    ['#FF6B35', '#004E89', '#FFF8F0', '#1A659E', '#FFC145'],
  ],
  Technology: [
    ['#0D1117', '#21262D', '#58A6FF', '#3FB950', '#F0F6FC'],
    ['#1E1E2E', '#89B4FA', '#CDD6F4', '#F38BA8', '#A6E3A1'],
    ['#000000', '#6f9c3e', '#FFFFFF', '#333333', '#EDF3E2'],
  ],
  Retail: [
    ['#000000', '#6f9c3e', '#FFFFFF', '#333333', '#F0F0F0'],
    ['#264653', '#2A9D8F', '#E9C46A', '#F4A261', '#E76F51'],
    ['#003049', '#D62828', '#F77F00', '#FCBF49', '#EAE2B7'],
  ],
  Manufacturing: [
    ['#1B1B1B', '#4A4A4A', '#8B8B8B', '#C0C0C0', '#E8E8E8'],
    ['#0D1B2A', '#1B263B', '#415A77', '#778DA9', '#E0E1DD'],
    ['#2B2D42', '#5C677D', '#8D99AE', '#C4C4C4', '#EDF2F4'],
  ],
  Creative: [
    ['#FF006E', '#3A86FF', '#FFBE0B', '#8338EC', '#06D6A0'],
    ['#7400B8', '#6930C3', '#5390D9', '#48BFE3', '#56CFE1'],
    ['#F72585', '#7209B7', '#3A0CA3', '#4361EE', '#4CC9F0'],
  ],
  Other: [
    ['#000000', '#6f9c3e', '#FFFFFF', '#333333', '#666666'],
    ['#1A1A2E', '#16213E', '#0F3460', '#E94560', '#533483'],
    ['#2D3436', '#636E72', '#B2BEC3', '#DFE6E9', '#FFFFFF'],
  ]
};

const ColorPaletteGenerator = () => {
  const [industry, setIndustry] = useState('');
  const [palette, setPalette] = useState(null);

  const generate = () => {
    if (!industry) return;
    const palettes = PALETTES[industry] || PALETTES.Other;
    setPalette(palettes[Math.floor(Math.random() * palettes.length)]);
  };

  const exportCSS = () => {
    if (!palette) return;
    const css = `:root {\n${palette.map((c, i) => `  --brand-${i + 1}: ${c};`).join('\n')}\n}`;
    navigator.clipboard.writeText(css);
  };

  return (
    <div style={{ maxWidth: 700, margin: '0 auto', padding: '100px 32px 60px' }}>
      <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 28, fontWeight: 700, marginBottom: 8 }}>Color Palette Generator</h1>
      <p style={{ color: 'var(--gray-500)', marginBottom: 32, fontSize: 15 }}>Generate color palettes for your brand.</p>

      <div style={{ background: 'var(--white)', border: '1px solid var(--gray-200)', borderRadius: 'var(--radius)', padding: 24, marginBottom: 24 }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end' }}>
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: 'var(--gray-500)', marginBottom: 6 }}>Industry</label>
            <select value={industry} onChange={e => setIndustry(e.target.value)} className="form-input" style={{ width: '100%' }}>
              <option value="">Select industry</option>
              <option value="Fashion">Fashion</option>
              <option value="Food">Food</option>
              <option value="Technology">Technology</option>
              <option value="Retail">Retail</option>
              <option value="Manufacturing">Manufacturing</option>
              <option value="Creative">Creative</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <button onClick={generate} disabled={!industry} className="btn btn-primary" style={{ padding: '10px 24px' }}>
            Generate
          </button>
        </div>
      </div>

      {palette && (
        <div>
          <div style={{ display: 'flex', borderRadius: 'var(--radius)', overflow: 'hidden', height: 120, marginBottom: 16 }}>
            {palette.map((color, i) => (
              <div key={i} style={{ flex: 1, background: color }} />
            ))}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12, marginBottom: 16 }}>
            {palette.map((color, i) => (
              <div key={i} style={{ textAlign: 'center' }}>
                <div style={{ width: '100%', height: 48, background: color, borderRadius: 6, border: '1px solid var(--gray-200)', marginBottom: 4 }} />
                <span style={{ fontSize: 12, fontFamily: 'monospace', color: 'var(--gray-600)' }}>{color}</span>
              </div>
            ))}
          </div>
          <button onClick={exportCSS} style={{ padding: '8px 20px', background: 'var(--white)', color: 'var(--gray-700)', border: '1px solid var(--gray-200)', borderRadius: '6px', fontSize: '13px', fontWeight: '500', cursor: 'pointer' }}>
            Copy as CSS Variables
          </button>
        </div>
      )}
    </div>
  );
};

export default ColorPaletteGenerator;
