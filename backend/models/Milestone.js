const mongoose = require('mongoose');

const MilestoneSchema = new mongoose.Schema({
  project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  title: { type: String, required: true, maxlength: [100, 'Title cannot exceed 100 characters'] },
  description: { type: String, default: '' },
  amount: { type: Number, default: 0 },
  status: { type: String, enum: ['pending', 'in_progress', 'completed', 'approved'], default: 'pending' },
  dueDate: { type: Date },
  completedAt: { type: Date },
  order: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

MilestoneSchema.index({ project: 1 });

module.exports = mongoose.model('Milestone', MilestoneSchema);
