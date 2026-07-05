const mongoose = require('mongoose');

const AnnotationSchema = new mongoose.Schema({
  asset: { type: mongoose.Schema.Types.ObjectId, ref: 'Asset', required: true },
  project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  x: { type: Number, required: true },
  y: { type: Number, required: true },
  text: { type: String, required: true, maxlength: [500, 'Annotation text cannot exceed 500 characters'] },
  replies: [{
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    text: { type: String, maxlength: [500, 'Reply cannot exceed 500 characters'] },
    createdAt: { type: Date, default: Date.now }
  }],
  resolved: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

AnnotationSchema.index({ asset: 1 });
AnnotationSchema.index({ project: 1 });

module.exports = mongoose.model('Annotation', AnnotationSchema);
