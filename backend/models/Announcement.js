const mongoose = require('mongoose');

const AnnouncementSchema = new mongoose.Schema({
  title: { type: String, required: true, maxlength: [100, 'Title cannot exceed 100 characters'] },
  message: { type: String, required: true, maxlength: [500, 'Message cannot exceed 500 characters'] },
  type: { type: String, enum: ['info', 'warning', 'success'], default: 'info' },
  active: { type: Boolean, default: true },
  target: { type: String, enum: ['all', 'sme', 'specialist'], default: 'all' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now },
  expiresAt: { type: Date }
});

module.exports = mongoose.model('Announcement', AnnouncementSchema);
