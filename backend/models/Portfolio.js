const mongoose = require('mongoose');

const PortfolioSchema = new mongoose.Schema({
  specialist: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: [true, 'Title is required'],
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  description: {
    type: String,
    default: '',
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  images: [{
    type: String
  }],
  industry: {
    type: String,
    default: ''
  },
  category: {
    type: String,
    default: ''
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

PortfolioSchema.index({ specialist: 1 });

module.exports = mongoose.model('Portfolio', PortfolioSchema);
