const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
  action: {
    type: String,
    required: true,
    enum: [
      'user.register', 'user.role_change', 'user.delete',
      'project.create', 'project.assign', 'project.status_change', 'project.delete',
      'kyc.submit', 'kyc.approve', 'kyc.reject',
      'asset.upload', 'asset.delete',
      'settings.update', 'subscriber.delete',
      'message.send'
    ]
  },
  entity: { type: String, required: true },
  entityId: { type: mongoose.Schema.Types.ObjectId, refPath: 'entity' },
  performedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  details: { type: mongoose.Schema.Types.Mixed, default: {} },
  createdAt: { type: Date, default: Date.now }
});

activitySchema.index({ createdAt: -1 });
activitySchema.index({ action: 1 });
activitySchema.index({ entity: 1 });

module.exports = mongoose.model('Activity', activitySchema);
