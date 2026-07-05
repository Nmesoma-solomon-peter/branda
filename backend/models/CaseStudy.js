const mongoose = require('mongoose');

const CaseStudySchema = new mongoose.Schema({
  title: { type: String, required: true, maxlength: [200, 'Title cannot exceed 200 characters'] },
  slug: { type: String, unique: true },
  client: { type: String, default: '' },
  industry: { type: String, default: '' },
  challenge: { type: String, required: true },
  solution: { type: String, required: true },
  results: { type: String, required: true },
  imageUrl: { type: String, default: '',
  },
  published: { type: Boolean, default: false },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now }
});

CaseStudySchema.pre('save', function(next) {
  if (this.isModified('title') && !this.slug) {
    this.slug = this.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  }
  next();
});

module.exports = mongoose.model('CaseStudy', CaseStudySchema);
