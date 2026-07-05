import React, { useState } from 'react';

const PREFIXES = ['Neo', 'Eco', 'Zen', 'Aura', 'Flux', 'Apex', 'Vibe', 'Core', 'Edge', 'Nova', 'Pulse', 'Spark', 'Bloom', 'Craft', 'Forge', 'Hive', 'Leap', 'Nest', 'Root', 'Wave'];
const SUFFIXES = ['Hub', 'Lab', 'Co', 'Studio', 'Works', 'Studio', 'Space', 'Zone', 'Den', 'Nest', 'HQ', 'Box', 'Park', 'Base', 'Dock', 'Port', 'Mill', 'Grove', 'Field', 'Lane'];
const ADJECTIVES = ['Bold', 'Swift', 'Bright', 'Clean', 'Sharp', 'Fresh', 'Pure', 'Prime', 'True', 'Keen', 'Smart', 'Quick', 'Fine', 'Grand', 'Peak', 'Royal', 'Sage', 'Wise', 'Safe', 'Calm'];
const INDUSTRY_WORDS = {
  Fashion: ['Style', 'Thread', 'Weave', 'Stitch', 'Fabric', 'Cloth', 'Wear', 'Drape', 'Loom', 'Silk'],
  Food: ['Taste', 'Flavor', 'Feast', 'Savor', 'Bite', 'Spice', 'Fresh', 'Harvest', 'Zest', 'Grill'],
  Technology: ['Byte', 'Code', 'Data', 'Sync', 'Cloud', 'Tech', 'Net', 'Bit', 'Pixel', 'Logic'],
  Retail: ['Shop', 'Store', 'Mart', 'Deal', 'Buy', 'Sale', 'Stock', 'Trade', 'Market', 'Pick'],
  Manufacturing: ['Build', 'Make', 'Craft', 'Form', 'Mold', 'Press', 'Cast', 'Mint', 'Shape', 'Fuse'],
  Creative: ['Art', 'Draw', 'Design', 'Create', 'Imagine', 'Vision', 'Canvas', 'Sketch', 'Paint', 'Blend'],
  Other: ['Go', 'Link', 'Join', 'Open', 'Move', 'Lift', 'Rise', 'Grow', 'Turn', 'Pull']
};

const generateNames = (industry, keywords) => {
  const words = [];
  const industryWords = INDUSTRY_WORDS[industry] || INDUSTRY_WORDS.Other;
  if (keywords) {
    words.push(...keywords.split(/[\s,]+/).filter(Boolean));
  }
  const names = new Set();
  const maxAttempts = 200;
  let attempts = 0;
  while (names.size < 12 && attempts < maxAttempts) {
    attempts++;
    const method = Math.floor(Math.random() * 5);
    let name = '';
    switch (method) {
      case 0: name = PREFIXES[Math.floor(Math.random() * PREFIXES.length)] + SUFFIXES[Math.floor(Math.random() * SUFFIXES.length)]; break;
      case 1: name = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)] + (words.length ? words[Math.floor(Math.random() * words.length)] : industryWords[Math.floor(Math.random() * industryWords.length)]); break;
      case 2: name = (words.length ? words[Math.floor(Math.random() * words.length)] : industryWords[Math.floor(Math.random() * industryWords.length)]) + SUFFIXES[Math.floor(Math.random() * SUFFIXES.length)]; break;
      case 3: name = PREFIXES[Math.floor(Math.random() * PREFIXES.length)] + (words.length ? words[Math.floor(Math.random() * words.length)] : industryWords[Math.floor(Math.random() * industryWords.length)]); break;
      case 4: name = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)] + SUFFIXES[Math.floor(Math.random() * SUFFIXES.length)]; break;
      default: name = PREFIXES[Math.floor(Math.random() * PREFIXES.length)] + SUFFIXES[Math.floor(Math.random() * SUFFIXES.length)];
    }
    names.add(name);
  }
  return [...names];
};

const BrandNameGenerator = () => {
  const [industry, setIndustry] = useState('');
  const [keywords, setKeywords] = useState('');
  const [names, setNames] = useState([]);

  const handleGenerate = () => {
    if (!industry) return;
    setNames(generateNames(industry, keywords));
  };

  return (
    <div style={{ maxWidth: 700, margin: '0 auto', padding: '100px 32px 60px' }}>
      <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 28, fontWeight: 700, marginBottom: 8 }}>Brand Name Generator</h1>
      <p style={{ color: 'var(--gray-500)', marginBottom: 32, fontSize: 15 }}>Generate creative brand name ideas for your business.</p>

      <div style={{ background: 'var(--white)', border: '1px solid var(--gray-200)', borderRadius: 'var(--radius)', padding: 24, marginBottom: 24 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
          <div>
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
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: 'var(--gray-500)', marginBottom: 6 }}>Keywords (optional)</label>
            <input value={keywords} onChange={e => setKeywords(e.target.value)} placeholder="e.g., fast, premium, local" className="form-input" style={{ width: '100%' }} />
          </div>
        </div>
        <button onClick={handleGenerate} disabled={!industry} className="btn btn-primary" style={{ padding: '10px 24px' }}>
          Generate Names
        </button>
      </div>

      {names.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
          {names.map((name, i) => (
            <div key={i} style={{ background: 'var(--white)', border: '1px solid var(--gray-200)', borderRadius: 'var(--radius)', padding: '16px', textAlign: 'center' }}>
              <span style={{ fontSize: 16, fontWeight: 600, color: 'var(--gray-800)' }}>{name}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BrandNameGenerator;
