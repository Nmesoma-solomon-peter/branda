const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  platformName: { type: String, default: 'Branda' },
  platformDescription: { type: String, default: 'Branding made simple for small businesses' },
  contactEmail: { type: String, default: '' },
  contactPhone: { type: String, default: '' },
  contactAddress: { type: String, default: '' },
  metaTitle: { type: String, default: 'Branda - Branding for Small Businesses' },
  metaDescription: { type: String, default: 'Connect with trusted brand designers who create logos, brand guides, and design assets.' },
  metaKeywords: { type: String, default: 'branding, logo, design, small business, SME' },
  ogImage: { type: String, default: '' },
  sitemapEnabled: { type: Boolean, default: true },
  smtpHost: { type: String, default: 'smtp.gmail.com' },
  smtpPort: { type: Number, default: 587 },
  smtpUser: { type: String, default: '' },
  smtpPass: { type: String, default: '' },
  smtpFrom: { type: String, default: '' },
  smtpEnabled: { type: Boolean, default: false },
  footerText: { type: String, default: '2026 Branda. All rights reserved.' },
  maintenanceMode: { type: Boolean, default: false },
  paystackSecretKey: { type: String, default: '' },
  paystackPublicKey: { type: String, default: '' },
  paystackEnabled: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Settings', settingsSchema);
