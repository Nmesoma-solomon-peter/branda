const mongoose = require('mongoose');

const ProposalSchema = new mongoose.Schema({
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
  coverLetter: {
    type: String,
    required: [true, 'Cover letter is required'],
    maxlength: [2000, 'Cover letter cannot exceed 2000 characters']
  },
  bidAmount: {
    type: Number,
    required: [true, 'Bid amount is required']
  },
  timeline: {
    type: Number,
    default: 14
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected', 'withdrawn'],
    default: 'pending'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

ProposalSchema.index({ project: 1, specialist: 1 }, { unique: true });
ProposalSchema.index({ specialist: 1, createdAt: -1 });

module.exports = mongoose.model('Proposal', ProposalSchema);
