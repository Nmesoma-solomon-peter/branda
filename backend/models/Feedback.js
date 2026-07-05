const mongoose = require('mongoose');

const FeedbackSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  type: { type: String, enum: ['bug', 'feature', 'general'], default: 'general' },
  message: { type: String, required: true, maxlength: [1000, 'Message cannot exceed 1000 characters'] },
  page: { type: String, default: '' },
  status: { type: String, enum: ['new', 'reviewed', 'resolved'], default: 'new' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Feedback', FeedbackSchema);
