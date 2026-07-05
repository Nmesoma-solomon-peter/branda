const mongoose = require('mongoose');

const ReviewReportSchema = new mongoose.Schema({
  review: { type: mongoose.Schema.Types.ObjectId, ref: 'Review', required: true },
  reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  reason: { type: String, required: true, maxlength: [500, 'Reason cannot exceed 500 characters'] },
  status: { type: String, enum: ['new', 'reviewed', 'dismissed'], default: 'new' },
  reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  reviewedAt: { type: Date },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('ReviewReport', ReviewReportSchema);
