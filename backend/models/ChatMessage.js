const mongoose = require('mongoose');

const ChatMessageSchema = new mongoose.Schema({
  chat: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Chat',
    required: true
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  text: {
    type: String,
    default: '',
    maxlength: [2000, 'Message cannot exceed 2000 characters']
  },
  file: {
    type: String,
    default: ''
  },
  fileName: {
    type: String,
    default: ''
  },
  read: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

ChatMessageSchema.index({ chat: 1, createdAt: -1 });

module.exports = mongoose.model('ChatMessage', ChatMessageSchema);
