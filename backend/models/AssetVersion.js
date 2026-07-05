const mongoose = require('mongoose');

const AssetVersionSchema = new mongoose.Schema({
  asset: { type: mongoose.Schema.Types.ObjectId, ref: 'Asset', required: true },
  version: { type: Number, required: true },
  fileUrl: { type: String, required: true },
  fileName: { type: String, required: true },
  fileSize: { type: Number },
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  notes: { type: String, default: '', maxlength: [200, 'Notes cannot exceed 200 characters'] },
  createdAt: { type: Date, default: Date.now }
});

AssetVersionSchema.index({ asset: 1, version: 1 });

module.exports = mongoose.model('AssetVersion', AssetVersionSchema);
