const mongoose = require('mongoose');

const AssetSchema = new mongoose.Schema({
  filename: {
    type: String,
    required: true
  },
  originalName: {
    type: String,
    required: true
  },
  fileUrl: {
    type: String,
    required: true
  },
  mimeType: {
    type: String,
    required: true
  },
  fileSize: {
    type: Number
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  },
  type: {
    type: String,
    enum: ['reference', 'design', 'final'],
    default: 'reference'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

AssetSchema.index({ project: 1 });

module.exports = mongoose.model('Asset', AssetSchema);
