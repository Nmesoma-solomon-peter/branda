const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema({
  reviewer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  specialist: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  },
  rating: {
    type: Number,
    required: [true, 'Rating is required'],
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    default: '',
    maxlength: [1000, 'Comment cannot exceed 1000 characters']
  },
  response: {
    text: { type: String, default: '' },
    respondedAt: { type: Date }
  },
  reported: { type: Boolean, default: false },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

ReviewSchema.index({ specialist: 1, createdAt: -1 });
ReviewSchema.index({ project: 1 }, { unique: true });

module.exports = mongoose.model('Review', ReviewSchema);
