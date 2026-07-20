const mongoose = require('mongoose');

const ProjectSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a project title'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Please add a project description'],
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  industry: {
    type: String,
    required: [true, 'Please select an industry'],
    enum: ['Fashion', 'Food', 'Technology', 'Retail', 'Manufacturing', 'Creative', 'Other']
  },
  colorPreferences: {
    type: String,
    default: '',
    maxlength: [200, 'Color preferences cannot exceed 200 characters']
  },
  budget: {
    type: Number,
    default: 0,
    min: [0, 'Budget cannot be negative']
  },
  deadline: {
    type: Date,
    default: null
  },
  status: {
    type: String,
    enum: ['draft', 'open', 'active', 'in_progress', 'in_review', 'completed', 'revision', 'dispute', 'cancelled', 'approved'],
    default: 'open'
  },
  acceptanceStatus: {
    type: String,
    enum: ['pending', 'accepted', 'declined'],
    default: 'pending'
  },
  revisionNote: {
    type: String,
    default: '',
    maxlength: [1000, 'Revision note cannot exceed 1000 characters']
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  assignedSpecialist: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  assignedAt: {
    type: Date,
    default: null
  },
  acceptedAt: {
    type: Date,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

ProjectSchema.pre('save', function () {
  this.updatedAt = Date.now();
});

ProjectSchema.index({ owner: 1 });
ProjectSchema.index({ assignedSpecialist: 1 });

module.exports = mongoose.model('Project', ProjectSchema);
